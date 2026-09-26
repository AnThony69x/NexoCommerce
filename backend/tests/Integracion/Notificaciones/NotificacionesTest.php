<?php

declare(strict_types=1);

namespace Tests\Integracion\Notificaciones;

use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\NotificacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use RuntimeException;
use Tests\TestCase;

class NotificacionesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_rutas_exigen_autenticacion_y_validan_filtros(): void
    {
        $this->getJson('/api/v1/notificaciones')->assertUnauthorized();
        $this->patchJson('/api/v1/notificaciones/1/leida')->assertUnauthorized();
        $this->patchJson('/api/v1/notificaciones/leer-todas')->assertUnauthorized();
        $this->autenticarCliente();
        $this->getJson('/api/v1/notificaciones?leida=otra')->assertUnprocessable();
        $this->getJson('/api/v1/notificaciones?page=0')->assertUnprocessable();
        $this->getJson('/api/v1/notificaciones')->assertOk()->assertJsonPath('meta.total_no_leidas', 0);
    }

    public function test_pedido_y_pagos_notifican_a_destinatarios_correctos(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $otroAdmin = UsuarioModelo::factory()->admin()->create();
        $inactivo = UsuarioModelo::factory()->admin()->create(['activo' => false]);
        $cliente = $this->autenticarCliente();
        $otroCliente = UsuarioModelo::factory()->verificado()->create();
        $pedidoId = $this->crearPedido();

        $this->assertDatabaseHas('notificaciones', ['usuario_id' => $cliente->id, 'pedido_id' => $pedidoId, 'pago_id' => null, 'tipo' => 'PEDIDO_CREADO']);
        foreach ([$admin, $otroAdmin] as $destinatario) {
            $this->assertDatabaseHas('notificaciones', ['usuario_id' => $destinatario->id, 'pedido_id' => $pedidoId, 'tipo' => 'PEDIDO_CREADO']);
        }
        $this->assertDatabaseMissing('notificaciones', ['usuario_id' => $inactivo->id]);
        $this->assertDatabaseMissing('notificaciones', ['usuario_id' => $otroCliente->id]);

        $pagoId = $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedidoId, 'metodo' => 'PASARELA', 'monto' => '5.00', 'referencia_pasarela' => 'REF-NOT-1',
        ])->assertCreated()->json('data.id');
        $this->assertDatabaseHas('notificaciones', ['usuario_id' => $admin->id, 'pedido_id' => $pedidoId, 'pago_id' => $pagoId, 'tipo' => 'PAGO_REGISTRADO']);
        $this->assertDatabaseHas('notificaciones', ['usuario_id' => $otroAdmin->id, 'pedido_id' => $pedidoId, 'pago_id' => $pagoId, 'tipo' => 'PAGO_REGISTRADO']);
        $this->assertDatabaseMissing('notificaciones', ['usuario_id' => $cliente->id, 'tipo' => 'PAGO_REGISTRADO']);

        $this->autenticar($admin);
        $this->patchJson('/api/v1/admin/pagos/'.$pagoId.'/verificar', ['estado' => 'APROBADO'])->assertOk();
        $this->assertDatabaseHas('notificaciones', ['usuario_id' => $cliente->id, 'pedido_id' => $pedidoId, 'pago_id' => $pagoId, 'tipo' => 'PAGO_APROBADO']);
        foreach (['EN_PREPARACION', 'LISTO', 'ENTREGADO'] as $estado) {
            $this->patchJson('/api/v1/admin/pedidos/'.$pedidoId.'/estado', ['estado' => $estado])->assertOk();
            $this->assertDatabaseHas('notificaciones', ['usuario_id' => $cliente->id, 'pedido_id' => $pedidoId, 'tipo' => 'PEDIDO_'.$estado]);
        }
        $this->assertDatabaseCount('notificaciones', 9);
        $this->getJson('/api/v1/notificaciones')->assertOk()->assertJsonPath('meta.total_no_leidas', 2);
        $this->autenticar($cliente);
        $this->getJson('/api/v1/notificaciones')->assertOk()->assertJsonPath('meta.total_no_leidas', 5)
            ->assertJsonPath('data.0.tipo', 'PEDIDO_ENTREGADO');
    }

    public function test_transferencia_y_rechazo_generan_avisos_y_no_se_duplican_ante_error(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $cliente = $this->autenticarCliente();
        $pedidoId = $this->crearPedido();
        $archivo = MultimediaModelo::factory()->create(['subido_por_id' => $cliente->id, 'ruta_archivo' => 'comprobantes/aviso.pdf']);
        $pagoId = $this->postJson('/api/v1/pagos', [
            'pedido_id' => $pedidoId, 'metodo' => 'TRANSFERENCIA', 'monto' => '5.00', 'multimedia_id' => $archivo->id,
        ])->assertCreated()->json('data.id');
        $this->assertDatabaseHas('notificaciones', ['usuario_id' => $admin->id, 'pago_id' => $pagoId, 'tipo' => 'PAGO_REGISTRADO']);
        $this->autenticar($admin);
        $this->patchJson('/api/v1/admin/pagos/'.$pagoId.'/verificar', ['estado' => 'RECHAZADO'])->assertOk();
        $this->assertDatabaseHas('notificaciones', ['usuario_id' => $cliente->id, 'pago_id' => $pagoId, 'tipo' => 'PAGO_RECHAZADO']);
        $this->patchJson('/api/v1/admin/pagos/'.$pagoId.'/verificar', ['estado' => 'APROBADO'])->assertBadRequest();
        $this->assertDatabaseCount('notificaciones', 4);
    }

    public function test_listado_filtra_pagina_y_cuenta_no_leidas_globales(): void
    {
        $cliente = $this->autenticarCliente();
        $otro = UsuarioModelo::factory()->verificado()->create();
        foreach (range(1, 22) as $numero) {
            NotificacionModelo::create([
                'usuario_id' => $cliente->id, 'tipo' => 'PEDIDO_CREADO', 'titulo' => 'Aviso '.$numero,
                'mensaje' => 'Pedido nuevo', 'leida' => $numero <= 2,
                'fecha_lectura' => $numero <= 2 ? now() : null,
            ]);
        }
        NotificacionModelo::create(['usuario_id' => $otro->id, 'tipo' => 'PEDIDO_CREADO', 'titulo' => 'Ajena', 'mensaje' => 'Ajena']);
        $this->getJson('/api/v1/notificaciones?page=2')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 22)->assertJsonPath('meta.total_no_leidas', 20);
        $this->getJson('/api/v1/notificaciones?leida=1')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 2)->assertJsonPath('meta.total_no_leidas', 20);
        $this->getJson('/api/v1/notificaciones?leida=0')->assertOk()->assertJsonCount(20, 'data');
    }

    public function test_lectura_individual_y_masiva_son_propias_e_idempotentes(): void
    {
        $cliente = $this->autenticarCliente();
        $otro = UsuarioModelo::factory()->verificado()->create();
        $propia = NotificacionModelo::create(['usuario_id' => $cliente->id, 'tipo' => 'PEDIDO_CREADO', 'titulo' => 'Propia', 'mensaje' => 'Propia']);
        $segunda = NotificacionModelo::create(['usuario_id' => $cliente->id, 'tipo' => 'PEDIDO_CREADO', 'titulo' => 'Otra', 'mensaje' => 'Otra']);
        $ajena = NotificacionModelo::create(['usuario_id' => $otro->id, 'tipo' => 'PEDIDO_CREADO', 'titulo' => 'Ajena', 'mensaje' => 'Ajena']);
        $this->patchJson('/api/v1/notificaciones/'.$ajena->id.'/leida')->assertForbidden();
        $this->patchJson('/api/v1/notificaciones/999999/leida')->assertNotFound();
        $primeraFecha = $this->patchJson('/api/v1/notificaciones/'.$propia->id.'/leida')->assertOk()
            ->assertJsonPath('data.leida', true)->json('data.fecha_lectura');
        $this->patchJson('/api/v1/notificaciones/'.$propia->id.'/leida')->assertOk()->assertJsonPath('data.fecha_lectura', $primeraFecha);
        $this->patchJson('/api/v1/notificaciones/leer-todas')->assertOk()->assertJsonPath('data.actualizadas', 1);
        $this->patchJson('/api/v1/notificaciones/leer-todas')->assertOk()->assertJsonPath('data.actualizadas', 0);
        $this->assertDatabaseHas('notificaciones', ['id' => $segunda->id, 'leida' => true]);
        $this->assertDatabaseHas('notificaciones', ['id' => $ajena->id, 'leida' => false]);
        $this->getJson('/api/v1/notificaciones')->assertJsonPath('meta.total_no_leidas', 0);
    }

    public function test_error_al_guardar_aviso_revierte_pedido_stock_y_carrito(): void
    {
        $cliente = $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 3]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 1])->assertCreated();
        $this->mock(NotificacionRepositorioInterface::class)->shouldReceive('guardar')->once()->andThrow(new RuntimeException('Falla de aviso'));
        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '5.00'])->assertInternalServerError();
        $this->assertDatabaseCount('pedidos', 0);
        $this->assertDatabaseCount('notificaciones', 0);
        $this->assertDatabaseCount('detalles_carrito', 1);
        $this->assertDatabaseHas('detalles', ['producto_id' => $producto->id, 'stock' => 3]);
    }

    private function autenticarCliente(): UsuarioModelo
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->autenticar($cliente);

        return $cliente;
    }

    private function autenticar(UsuarioModelo $usuario): void
    {
        Auth::forgetGuards();
        $this->withToken($usuario->createToken('test')->plainTextToken);
    }

    private function crearPedido(): int
    {
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 3]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 1])->assertCreated();

        return $this->postJson('/api/v1/pedidos', [
            'fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '5.00',
        ])->assertCreated()->json('data.id');
    }
}
