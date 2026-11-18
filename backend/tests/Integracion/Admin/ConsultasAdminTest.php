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
        $activo = ProductoModelo::factory()->create(['nombre' => 'Taza azul']);
        DetalleModelo::factory()->create(['producto_id' => $activo->id, 'stock' => 3]);
        $inactivo = ProductoModelo::factory()->inactivo()->create(['nombre' => 'Taza roja']);
        DetalleModelo::factory()->create(['producto_id' => $inactivo->id, 'stock' => 0]);
        $admin = $this->admin();

        $this->getJson('/api/v1/admin/productos')
            ->assertUnauthorized();
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->getJson('/api/v1/admin/productos?buscar=taza')
            ->assertOk()->assertJsonPath('meta.total', 2);
        $this->getJson('/api/v1/admin/productos?activo=0&buscar=roja')
            ->assertOk()->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.activo', false)
            ->assertJsonPath('data.0.nombre', 'Taza roja');
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
        PagoModelo::create([
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
            ->assertJsonPath('data.0.pedido_estado', 'PENDIENTE');
        $this->getJson('/api/v1/admin/multimedia?destino=comprobantes')
            ->assertOk()->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.destino', 'comprobantes')
            ->assertJsonPath('data.0.url', null);
    }

    public function test_dashboard_y_consultas_de_pedido_incluyen_datos_admin(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create([
            'nombre_completo' => 'Cliente de prueba',
            'correo' => 'cliente.contratos@example.test',
            'telefono' => '+593999123456',
        ]);
        $producto = ProductoModelo::factory()->create(['tipo' => 'DETALLE', 'nombre' => 'Caja pequeña']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 2]);
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
            ->assertOk()->assertJsonPath('data.productos_activos', 1)
            ->assertJsonPath('data.pedidos_pendientes', 1)
            ->assertJsonPath('data.pagos_pendientes', 1)
            ->assertJsonPath('data.usuarios_registrados', 2)
            ->assertJsonPath('data.productos_stock_bajo.0.stock', 2);
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
