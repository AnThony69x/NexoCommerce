<?php

declare(strict_types=1);

namespace Tests\Integracion\Admin;

use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PagoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PedidoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ConsultasAdminTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_listado_admin_incluye_inactivos_y_filtra_por_nombre(): void
    {
        $activo = ProductoModelo::factory()->create(['nombre' => 'Contrato-admin taza azul']);
        DetalleModelo::factory()->create(['producto_id' => $activo->id, 'stock' => 3]);
        $inactivo = ProductoModelo::factory()->inactivo()->create(['nombre' => 'Contrato-admin taza roja']);
        DetalleModelo::factory()->create(['producto_id' => $inactivo->id, 'stock' => 0]);
        $admin = $this->admin();

        $this->getJson('/api/v1/admin/productos')
            ->assertUnauthorized();
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->getJson('/api/v1/admin/productos?buscar=contrato-admin+taza')
            ->assertOk()->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/productos?activo=0&buscar=roja')
            ->assertOk()->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.activo', false)
            ->assertJsonPath('data.0.nombre', 'Contrato-admin taza roja');
        $this->getJson('/api/v1/admin/productos?activo=maybe')->assertUnprocessable();
        $this->getJson('/api/v1/admin/productos/'.$inactivo->id)
            ->assertOk()->assertJsonPath('data.activo', false);
    }

    public function test_listados_de_pagos_y_multimedia_exponen_historial_y_destinos(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $pedido = PedidoModelo::create([
            'usuario_id' => $cliente->id,
            'fecha_entrega' => now()->addDay()->toDateString(),
            'estado' => 'PENDIENTE',
            'subtotal' => '12.00',
            'total' => '12.00',
        ]);
        $pago = PagoModelo::create([
            'pedido_id' => $pedido->id,
            'metodo' => 'PASARELA',
            'estado' => 'RECHAZADO',
            'monto' => '12.00',
            'referencia_pasarela' => 'ADMIN-LIST-REF',
        ]);
        MultimediaModelo::factory()->pdf()->create([
            'subido_por_id' => $cliente->id,
        ]);
        $admin = $this->admin();
        $this->withToken($admin->createToken('test')->plainTextToken);

        $this->getJson('/api/v1/admin/pagos?estado=RECHAZADO')
            ->assertOk()->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.pedido_id', $pedido->id)
            ->assertJsonPath('data.0.pedido_estado', 'PENDIENTE')
            ->assertJsonPath('data.0.creado_en', $pago->creado_en->toISOString())
            ->assertJsonPath('data.0.fecha_pago', null);
        $this->getJson('/api/v1/admin/multimedia?destino=comprobantes')
            ->assertOk()->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.destino', 'comprobantes')
            ->assertJsonPath('data.0.url', null);
    }

    public function test_admin_puede_desactivar_y_reactivar_multimedia_con_estado_confirmado(): void
    {
        $medio = MultimediaModelo::factory()->pdf()->create();
        $admin = $this->admin();
        $token = $admin->createToken('test')->plainTextToken;

        $this->patchJson('/api/v1/admin/multimedia/'.$medio->id.'/estado', ['activo' => false], [
            'Authorization' => 'Bearer '.$token,
        ])->assertOk()->assertJsonPath('data.activo', false);

        $this->getJson('/api/v1/admin/multimedia?activo=0', [
            'Authorization' => 'Bearer '.$token,
        ])->assertOk()->assertJsonPath('data.0.id', $medio->id)
            ->assertJsonPath('data.0.activo', false);

        $this->patchJson('/api/v1/admin/multimedia/'.$medio->id.'/estado', ['activo' => true], [
            'Authorization' => 'Bearer '.$token,
        ])->assertOk()->assertJsonPath('data.activo', true);
        $this->getJson('/api/v1/admin/multimedia?activo=1', [
            'Authorization' => 'Bearer '.$token,
        ])->assertOk()->assertJsonPath('data.0.id', $medio->id)
            ->assertJsonPath('data.0.activo', true);

        $this->patchJson('/api/v1/admin/multimedia/'.$medio->id.'/estado', ['activo' => 'maybe'], [
            'Authorization' => 'Bearer '.$token,
        ])->assertUnprocessable();
    }

    public function test_dashboard_y_consultas_de_pedido_incluyen_datos_admin(): void
    {
        $productosActivosPrevios = ProductoModelo::query()->where('activo', true)->count();
        $pedidosPendientesPrevios = PedidoModelo::query()->where('estado', 'PENDIENTE')->count();
        $pagosPendientesPrevios = PagoModelo::query()->where('estado', 'PENDIENTE')->count();
        $usuariosPrevios = UsuarioModelo::query()->count();
        $listosPrevios = PedidoModelo::query()->where('estado', 'LISTO')->count();
        $stockBajoPrevio = DetalleModelo::query()
            ->join('catalogo.productos', 'catalogo.productos.id', '=', 'catalogo.detalles.producto_id')
            ->where('catalogo.productos.activo', true)->whereBetween('stock', [0, 5])->count();
        $cliente = UsuarioModelo::factory()->verificado()->create([
            'nombre_completo' => 'Cliente de prueba',
            'correo' => 'cliente.contratos@example.test',
            'telefono' => '+593999123456',
        ]);
        foreach (range(1, 12) as $indice) {
            $producto = ProductoModelo::factory()->create(['tipo' => 'DETALLE', 'activo' => true]);
            DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => $indice % 6]);
        }
        $inactivo = ProductoModelo::factory()->create(['tipo' => 'DETALLE', 'activo' => false]);
        DetalleModelo::factory()->create(['producto_id' => $inactivo->id, 'stock' => 1]);
        $listo = PedidoModelo::create([
            'usuario_id' => $cliente->id, 'fecha_entrega' => now()->addDay()->toDateString(),
            'estado' => 'PENDIENTE', 'subtotal' => '20.00', 'total' => '20.00',
        ]);
        PagoModelo::create([
            'pedido_id' => $listo->id, 'metodo' => 'PASARELA', 'estado' => 'APROBADO',
            'monto' => '20.00', 'referencia_pasarela' => 'ADMIN-DASH-LISTO',
        ]);
        $listo->update(['estado' => 'EN_PREPARACION']);
        $listo->update(['estado' => 'LISTO']);
        $pedido = PedidoModelo::create([
            'usuario_id' => $cliente->id,
            'fecha_entrega' => now()->addDay()->toDateString(),
            'estado' => 'PENDIENTE',
            'subtotal' => '20.00',
            'total' => '20.00',
        ]);
        PagoModelo::create([
            'pedido_id' => $pedido->id,
            'metodo' => 'PASARELA',
            'estado' => 'PENDIENTE',
            'monto' => '20.00',
            'referencia_pasarela' => 'ADMIN-DASH-REF',
        ]);
        $admin = $this->admin();
        $this->withToken($admin->createToken('test')->plainTextToken);

        $this->getJson('/api/v1/admin/dashboard')
            ->assertOk()->assertJsonPath('data.productos_activos', $productosActivosPrevios + 12)
            ->assertJsonPath('data.pedidos_pendientes', $pedidosPendientesPrevios + 1)
            ->assertJsonPath('data.pagos_pendientes', $pagosPendientesPrevios + 1)
            ->assertJsonPath('data.usuarios_registrados', $usuariosPrevios + 2)
            ->assertJsonPath('data.pedidos_listos', $listosPrevios + 1)
            ->assertJsonPath('data.total_productos_stock_bajo', $stockBajoPrevio + 12)
            ->assertJsonCount(10, 'data.productos_stock_bajo')
            ->assertJsonPath('data.productos_stock_bajo.0.stock', 0)
            ->assertJsonPath('data.pedidos_recientes.0.id', $pedido->id)
            ->assertJsonPath('data.pedidos_recientes.0.cliente_nombre', 'Cliente de prueba')
            ->assertJsonPath('data.pedidos_recientes.0.fecha_entrega', $pedido->fecha_entrega->toDateString())
            ->assertJsonPath('data.pedidos_recientes.0.total', 20);
        $this->getJson('/api/v1/admin/pedidos')
            ->assertOk()->assertJsonPath('data.0.cliente.id', $cliente->id)
            ->assertJsonPath('data.0.cliente.nombre_completo', 'Cliente de prueba');
        $this->getJson('/api/v1/pedidos/'.$pedido->id)
            ->assertOk()->assertJsonPath('data.cliente.correo', 'cliente.contratos@example.test')
            ->assertJsonPath('data.cliente.telefono', '+593999123456');
    }

    private function admin(): UsuarioModelo
    {
        return UsuarioModelo::factory()->admin()->create();
    }
}
