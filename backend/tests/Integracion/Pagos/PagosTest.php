<?php

declare(strict_types=1);

namespace Tests\Integracion\Pagos;

use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PagoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PedidoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class PagosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_rutas_exigen_autenticacion_y_roles_y_validan_body(): void
    {
        $this->postJson('/api/v1/pagos', [])->assertUnauthorized();
        $this->getJson('/api/v1/pedidos/1/pago')->assertUnauthorized();
        $this->patchJson('/api/v1/admin/pagos/1/verificar', [])->assertUnauthorized();
        $cliente = $this->autenticarCliente();
        $pedido = $this->pedido($cliente);

        $this->postJson('/api/v1/pagos', [])->assertUnprocessable()->assertJsonStructure(['errors' => ['pedido_id', 'metodo', 'monto']]);
        $this->postJson('/api/v1/pagos', ['pedido_id' => $pedido->id, 'metodo' => 'tarjeta', 'monto' => '35.00'])->assertUnprocessable();
        $this->postJson('/api/v1/pagos', ['pedido_id' => $pedido->id, 'metodo' => 'efectivo', 'monto' => '35.00'])->assertUnprocessable();
        $this->postJson('/api/v1/pagos', ['pedido_id' => $pedido->id, 'metodo' => 'TRANSFERENCIA', 'monto' => '35.00'])->assertUnprocessable();
        $this->postJson('/api/v1/pagos', ['pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => 35, 'referencia_pasarela' => 'REF-1'])->assertUnprocessable();
        $this->patchJson('/api/v1/admin/pagos/1/verificar', ['estado' => 'APROBADO'])->assertForbidden();
        Auth::forgetGuards();
        $admin = UsuarioModelo::factory()->admin()->create();
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->postJson('/api/v1/pagos', ['pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.00', 'referencia_pasarela' => 'REF-1'])
            ->assertForbidden();
    }

    public function test_consulta_sin_pago_devuelve_null_y_aisla_pedidos(): void
    {
        $dueno = $this->autenticarCliente();
        $pedido = $this->pedido($dueno);

        $this->getJson('/api/v1/pedidos/'.$pedido->id.'/pago')->assertOk()->assertJsonPath('data', null);
        Auth::forgetGuards();
        $otro = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($otro->createToken('test')->plainTextToken);
        $this->getJson('/api/v1/pedidos/'.$pedido->id.'/pago')->assertForbidden();
        $this->postJson('/api/v1/pagos', ['pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.00', 'referencia_pasarela' => 'REF-1'])->assertForbidden();
        Auth::forgetGuards();
        $admin = UsuarioModelo::factory()->admin()->create();
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->getJson('/api/v1/pedidos/'.$pedido->id.'/pago')->assertOk()->assertJsonPath('data', null);
        $this->getJson('/api/v1/pedidos/999999/pago')->assertNotFound();
    }

    public function test_transferencia_guarda_comprobante_y_aprobar_no_cambia_pedido(): void
    {
        $cliente = $this->autenticarCliente();
        $pedido = $this->pedido($cliente);
        $archivo = $this->archivo($cliente);
        $respuesta = $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'TRANSFERENCIA', 'monto' => '35.00', 'multimedia_id' => $archivo->id,
        ])->assertCreated()->assertJsonPath('data.estado', 'PENDIENTE')
            ->assertJsonPath('data.comprobante.multimedia_id', $archivo->id);
        $pagoId = $respuesta->json('data.id');
        $this->assertDatabaseHas('comprobantes_pago', ['pago_id' => $pagoId, 'multimedia_id' => $archivo->id]);
        $this->getJson('/api/v1/pedidos/'.$pedido->id.'/pago')->assertOk()->assertJsonPath('data.id', $pagoId);
        $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.00', 'referencia_pasarela' => 'REF-2',
        ])->assertBadRequest()->assertJsonPath('codigo_error', 'PAG_PAGO_ACTIVO');
        Auth::forgetGuards();
        $admin = UsuarioModelo::factory()->admin()->create();
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->patchJson('/api/v1/admin/pagos/'.$pagoId.'/verificar', ['estado' => 'APROBADO', 'comentario_revision' => 'Acreditado'])
            ->assertOk()->assertJsonPath('data.estado', 'APROBADO')->assertJsonPath('data.pedido_estado', 'PENDIENTE')
            ->assertJsonPath('data.comprobante.revisado_por_id', $admin->id)
            ->assertJsonPath('data.comprobante.comentario_revision', 'Acreditado');
        $this->assertDatabaseHas('pedidos', ['id' => $pedido->id, 'estado' => 'PENDIENTE']);
        $this->assertDatabaseHas('pagos', ['id' => $pagoId, 'estado' => 'APROBADO']);
        $this->assertNotNull(PagoModelo::find($pagoId)->fecha_pago);
        $this->patchJson('/api/v1/admin/pagos/'.$pagoId.'/verificar', ['estado' => 'RECHAZADO'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PAG_ESTADO_INVALIDO');
        $this->patchJson('/api/v1/admin/pedidos/'.$pedido->id.'/estado', ['estado' => 'EN_PREPARACION'])->assertOk();
    }

    public function test_rechazo_permite_reintento_y_referencia_no_se_reutiliza(): void
    {
        $cliente = $this->autenticarCliente();
        $pedido = $this->pedido($cliente);
        $primero = $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.00', 'referencia_pasarela' => 'REF-UNICA',
        ])->assertCreated()->assertJsonPath('data.comprobante', null);
        $id = $primero->json('data.id');
        Auth::forgetGuards();
        $admin = UsuarioModelo::factory()->admin()->create();
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->patchJson('/api/v1/admin/pagos/'.$id.'/verificar', ['estado' => 'RECHAZADO'])->assertOk();
        $this->assertNull(PagoModelo::find($id)->fecha_pago);
        Auth::forgetGuards();
        $this->withToken($cliente->createToken('retry')->plainTextToken);
        $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.00', 'referencia_pasarela' => 'REF-UNICA',
        ])->assertBadRequest()->assertJsonPath('codigo_error', 'PAG_REFERENCIA_DUPLICADA');
        $segundo = $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.00', 'referencia_pasarela' => 'REF-NUEVA',
        ])->assertCreated();
        $this->getJson('/api/v1/pedidos/'.$pedido->id.'/pago')->assertJsonPath('data.id', $segundo->json('data.id'));
        $this->assertDatabaseCount('pagos', 2);
    }

    public function test_monto_y_estado_de_pedido_se_validan_antes_de_insertar(): void
    {
        $cliente = $this->autenticarCliente();
        $pedido = $this->pedido($cliente);
        $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.01', 'referencia_pasarela' => 'REF-1',
        ])->assertBadRequest()->assertJsonPath('codigo_error', 'PAG_MONTO_INVALIDO');
        $this->assertDatabaseCount('pagos', 0);
        $pedido->update(['estado' => 'LISTO']);
        $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'PASARELA', 'monto' => '35.00', 'referencia_pasarela' => 'REF-1',
        ])->assertBadRequest()->assertJsonPath('codigo_error', 'PAG_PEDIDO_NO_PENDIENTE');
        $this->assertDatabaseCount('pagos', 0);
    }

    public function test_comprobante_debe_ser_propio_activo_del_destino_y_sin_uso(): void
    {
        $cliente = $this->autenticarCliente();
        $pedido = $this->pedido($cliente);
        $otro = UsuarioModelo::factory()->verificado()->create();
        $ajeno = $this->archivo($otro);
        $inactivo = $this->archivo($cliente, ['activo' => false]);
        $producto = $this->archivo($cliente, ['ruta_archivo' => 'productos/foto.webp']);
        foreach ([
            ['id' => $ajeno->id, 'status' => 403, 'codigo' => 'PAG_COMPROBANTE_AJENO'],
            ['id' => $inactivo->id, 'status' => 400, 'codigo' => 'PAG_COMPROBANTE_INVALIDO'],
            ['id' => $producto->id, 'status' => 400, 'codigo' => 'PAG_COMPROBANTE_INVALIDO'],
        ] as $caso) {
            $this->postJson('/api/v1/pagos', [
                'pedido_id' => $pedido->id, 'metodo' => 'TRANSFERENCIA', 'monto' => '35.00', 'multimedia_id' => $caso['id'],
            ])->assertStatus($caso['status'])->assertJsonPath('codigo_error', $caso['codigo']);
        }
        $this->assertDatabaseCount('pagos', 0);
        $valido = $this->archivo($cliente);
        $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedido->id, 'metodo' => 'TRANSFERENCIA', 'monto' => '35.00', 'multimedia_id' => $valido->id,
        ])->assertCreated();
        $otroPedido = $this->pedido($cliente);
        $this->postJson('/api/v1/pagos', [
            'pedido_id' => $otroPedido->id, 'metodo' => 'TRANSFERENCIA', 'monto' => '35.00', 'multimedia_id' => $valido->id,
        ])->assertBadRequest()->assertJsonPath('codigo_error', 'PAG_COMPROBANTE_EN_USO');
        $this->assertDatabaseCount('comprobantes_pago', 1);
    }

    private function autenticarCliente(): UsuarioModelo
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken);

        return $cliente;
    }

    private function pedido(UsuarioModelo $usuario): PedidoModelo
    {
        return PedidoModelo::create([
            'usuario_id' => $usuario->id, 'fecha_entrega' => now()->addDay()->toDateString(),
            'estado' => 'PENDIENTE', 'subtotal' => '35.00', 'total' => '35.00',
        ]);
    }

    private function archivo(UsuarioModelo $usuario, array $atributos = []): MultimediaModelo
    {
        return MultimediaModelo::factory()->create([
            'subido_por_id' => $usuario->id, 'ruta_archivo' => 'comprobantes/transferencia.pdf', ...$atributos,
        ]);
    }
}
