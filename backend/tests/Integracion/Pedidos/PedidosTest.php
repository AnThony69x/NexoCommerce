<?php

declare(strict_types=1);

namespace Tests\Integracion\Pedidos;

use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionProduccionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PedidoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PedidosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_autenticacion_roles_y_validacion_del_contrato(): void
    {
        $fecha = now()->addDay()->toDateString();
        $this->postJson('/api/v1/pedidos', [])->assertUnauthorized();
        $this->getJson('/api/v1/pedidos')->assertUnauthorized();
        $this->getJson('/api/v1/pedidos/1')->assertUnauthorized();
        $this->getJson('/api/v1/admin/pedidos')->assertUnauthorized();
        $this->patchJson('/api/v1/admin/pedidos/1/estado', [])->assertUnauthorized();
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken);

        $this->postJson('/api/v1/pedidos', [])->assertUnprocessable()->assertJsonStructure(['errors' => ['fecha_entrega', 'total_esperado']]);
        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->subDay()->toDateString(), 'total_esperado' => '1.00'])->assertUnprocessable();
        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => $fecha, 'total_esperado' => 1.0])->assertUnprocessable();
        $this->getJson('/api/v1/admin/pedidos')->assertForbidden();
        $this->patchJson('/api/v1/admin/pedidos/1/estado', ['estado' => 'LISTO'])->assertForbidden();
        Auth::forgetGuards();
        $admin = UsuarioModelo::factory()->admin()->create();
        $this->withToken($admin->createToken('test')->plainTextToken)->postJson('/api/v1/pedidos', ['fecha_entrega' => $fecha, 'total_esperado' => '0.00'])->assertForbidden();
    }

    public function test_crea_detalle_con_snapshot_descuenta_stock_y_vacia_carrito(): void
    {
        $cliente = $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['nombre' => 'Caja regalo', 'precio_base' => '10.05']);
        $detalle = DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 5]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2, 'comentario' => 'Entregar con lazo'])->assertCreated();

        $pedido = $this->postJson('/api/v1/pedidos', [
            'fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '20.10',
        ])->assertCreated()->assertJsonPath('data.estado', 'PENDIENTE')->assertJsonPath('data.total', 20.1);
        $id = $pedido->json('data.id');
        $this->assertDatabaseHas('detalles', ['producto_id' => $producto->id, 'stock' => 3]);
        $this->assertDatabaseHas('detalles_pedido', [
            'pedido_id' => $id, 'nombre_producto' => 'Caja regalo', 'precio_unitario' => '10.05',
            'subtotal' => '20.10', 'indicaciones' => 'Entregar con lazo',
        ]);
        $this->assertDatabaseCount('detalles_carrito', 0);
        $this->assertDatabaseHas('carritos', ['usuario_id' => $cliente->id, 'activo' => true]);
        $producto->update(['nombre' => 'Nombre nuevo', 'precio_base' => '50.00']);
        $this->getJson('/api/v1/pedidos/'.$id)->assertOk()
            ->assertJsonPath('data.items.0.nombre_producto', 'Caja regalo')
            ->assertJsonPath('data.items.0.precio_unitario', 10.05)
            ->assertJsonPath('data.pago', null);
    }

    public function test_precio_cambiado_persiste_en_carrito_y_exige_reconfirmacion(): void
    {
        $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '10.00']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 4]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2])->assertCreated();
        $producto->update(['precio_base' => '11.25']);

        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '20.00'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_PRECIO_CAMBIADO');
        $this->assertDatabaseHas('detalles_carrito', ['producto_id' => $producto->id, 'cantidad' => 2, 'precio_unitario' => '11.25']);
        $this->assertDatabaseHas('detalles', ['producto_id' => $producto->id, 'stock' => 4]);
        $this->assertDatabaseCount('pedidos', 0);
        $this->getJson('/api/v1/carrito')->assertJsonPath('data.total', 22.5);
        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '22.50'])->assertCreated();
    }

    public function test_rechaza_stock_insuficiente_o_producto_inactivo_sin_consumir_carrito(): void
    {
        $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        $detalle = DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 3]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2])->assertCreated();
        $detalle->update(['stock' => 1]);

        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '10.00'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_SIN_STOCK');
        $this->assertDatabaseCount('pedidos', 0);
        $this->assertDatabaseCount('detalles_carrito', 1);
        $this->assertDatabaseHas('detalles', ['producto_id' => $producto->id, 'stock' => 1]);
        $producto->update(['activo' => false]);
        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '10.00'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_ITEM_NO_DISPONIBLE');
        $this->assertDatabaseCount('pedidos', 0);
    }

    public function test_sublimacion_guarda_costo_y_ambas_indicaciones(): void
    {
        $cliente = $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '8.10']);
        SublimacionModelo::factory()->create(['producto_id' => $producto->id]);
        $plantilla = PlantillaDisenoModelo::factory()->create(['sublimacion_id' => $producto->id, 'costo_adicional' => '0.20']);
        $personalizado = DisenoPersonalizadoModelo::factory()->create([
            'usuario_id' => $cliente->id, 'sublimacion_id' => $producto->id, 'indicaciones' => 'Texto azul',
        ]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 1, 'plantilla_diseno_id' => $plantilla->id])->assertCreated();
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 1, 'diseno_personalizado_id' => $personalizado->id, 'comentario' => 'Empacar'])->assertCreated();

        $pedido = $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '16.40'])->assertCreated();
        $id = $pedido->json('data.id');
        $this->assertDatabaseHas('detalles_pedido', ['pedido_id' => $id, 'tipo_configuracion' => 'PLANTILLA', 'nombre_diseno' => $plantilla->nombre, 'costo_diseno' => '0.20']);
        $this->assertDatabaseHas('detalles_pedido', [
            'pedido_id' => $id, 'tipo_configuracion' => 'DISENO_PERSONALIZADO', 'nombre_diseno' => null,
            'costo_diseno' => '0.00', 'indicaciones' => "Comentario: Empacar\nDiseño personalizado: Texto azul",
        ]);
    }

    public function test_torta_exige_cupo_y_snapshot_de_diseno(): void
    {
        $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '20.00']);
        TortaModelo::factory()->create(['producto_id' => $producto->id]);
        $diseno = DisenoTortaModelo::factory()->create(['torta_id' => $producto->id, 'costo_adicional' => '2.00']);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2, 'diseno_torta_id' => $diseno->id])->assertCreated();
        $fecha = now()->addDay()->toDateString();

        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => $fecha, 'total_esperado' => '44.00'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_SIN_CAPACIDAD');
        ConfiguracionProduccionModelo::factory()->create(['fecha' => $fecha, 'categoria_id' => $producto->categoria_id, 'capacidad_maxima' => 1]);
        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => $fecha, 'total_esperado' => '44.00'])->assertBadRequest();
        ConfiguracionProduccionModelo::query()->update(['capacidad_maxima' => 2]);
        $pedido = $this->postJson('/api/v1/pedidos', ['fecha_entrega' => $fecha, 'total_esperado' => '44.00'])->assertCreated();
        $this->assertDatabaseHas('detalles_pedido', [
            'pedido_id' => $pedido->json('data.id'), 'tipo_configuracion' => 'DISENO_TORTA',
            'nombre_diseno' => $diseno->nombre, 'costo_diseno' => '2.00',
        ]);
    }

    public function test_listados_aislamiento_y_cambio_de_estado_con_pago(): void
    {
        $primero = $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 5]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 1])->assertCreated();
        $fecha = now()->addDay()->toDateString();
        $id = $this->postJson('/api/v1/pedidos', ['fecha_entrega' => $fecha, 'total_esperado' => '5.00'])->assertCreated()->json('data.id');
        $segundo = UsuarioModelo::factory()->verificado()->create();
        Auth::forgetGuards();
        $this->withToken($segundo->createToken('test')->plainTextToken);

        $this->getJson('/api/v1/pedidos')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/pedidos/'.$id)->assertForbidden();
        Auth::forgetGuards();
        $admin = UsuarioModelo::factory()->admin()->create();
        $this->withToken($admin->createToken('test')->plainTextToken);
        $this->getJson('/api/v1/admin/pedidos?estado=PENDIENTE&fecha_entrega='.$fecha.'&usuario_id='.$primero->id)
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.usuario_id', $primero->id);
        $this->getJson('/api/v1/admin/pedidos?estado=LISTO')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/pedidos/'.$id)->assertOk()->assertJsonPath('data.usuario_id', $primero->id);
        $this->patchJson('/api/v1/admin/pedidos/'.$id.'/estado', ['estado' => 'LISTO'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_ESTADO_INVALIDO');
        $this->patchJson('/api/v1/admin/pedidos/'.$id.'/estado', ['estado' => 'EN_PREPARACION'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_PAGO_NO_APROBADO');
        DB::table('pagos')->insert([
            'pedido_id' => $id, 'metodo' => 'PASARELA', 'estado' => 'APROBADO', 'monto' => '5.00',
            'creado_en' => now(), 'actualizado_en' => now(),
        ]);
        $this->patchJson('/api/v1/admin/pedidos/'.$id.'/estado', ['estado' => 'EN_PREPARACION'])->assertOk()->assertJsonPath('data.estado', 'EN_PREPARACION');
        $this->patchJson('/api/v1/admin/pedidos/'.$id.'/estado', ['estado' => 'LISTO'])->assertOk();
        $this->patchJson('/api/v1/admin/pedidos/'.$id.'/estado', ['estado' => 'ENTREGADO'])->assertOk();
        $this->patchJson('/api/v1/admin/pedidos/'.$id.'/estado', ['estado' => 'ENTREGADO'])->assertBadRequest();
        $this->getJson('/api/v1/pedidos/'.$id)->assertJsonPath('data.pago.estado', 'APROBADO');
    }

    public function test_stock_se_valida_sobre_todos_los_renglones_del_producto(): void
    {
        $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        $detalle = DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 5]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2, 'comentario' => 'A'])->assertCreated();
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2, 'comentario' => 'B'])->assertCreated();
        $detalle->update(['stock' => 3]);

        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '20.00'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_SIN_STOCK');
        $this->assertDatabaseCount('pedidos', 0);
        $this->assertDatabaseCount('detalles_carrito', 2);
        $this->assertDatabaseHas('detalles', ['producto_id' => $producto->id, 'stock' => 3]);
    }

    public function test_plantilla_desactivada_bloquea_pedido_y_conserva_carrito(): void
    {
        $this->autenticarCliente();
        $producto = ProductoModelo::factory()->create(['precio_base' => '8.00']);
        SublimacionModelo::factory()->create(['producto_id' => $producto->id]);
        $plantilla = PlantillaDisenoModelo::factory()->create(['sublimacion_id' => $producto->id, 'costo_adicional' => '2.00']);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 1, 'plantilla_diseno_id' => $plantilla->id])->assertCreated();
        $plantilla->update(['activo' => false]);

        $this->postJson('/api/v1/pedidos', ['fecha_entrega' => now()->addDay()->toDateString(), 'total_esperado' => '10.00'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'PED_ITEM_NO_DISPONIBLE');
        $this->assertDatabaseCount('pedidos', 0);
        $this->assertDatabaseCount('detalles_carrito', 1);
    }

    public function test_listado_del_cliente_pagina_quince_pedidos_estables(): void
    {
        $cliente = $this->autenticarCliente();
        $ids = [];
        foreach (range(1, 16) as $numero) {
            $ids[] = PedidoModelo::create([
                'usuario_id' => $cliente->id, 'fecha_entrega' => now()->addDays($numero)->toDateString(),
                'estado' => 'PENDIENTE', 'subtotal' => '1.00', 'total' => '1.00',
            ])->id;
        }

        $this->getJson('/api/v1/pedidos')->assertOk()
            ->assertJsonCount(15, 'data')->assertJsonPath('meta.total', 16)
            ->assertJsonPath('meta.por_pagina', 15)->assertJsonPath('data.0.id', $ids[15]);
        $this->getJson('/api/v1/pedidos?page=2')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ids[0]);
    }

    private function autenticarCliente(): UsuarioModelo
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken);

        return $cliente;
    }
}
