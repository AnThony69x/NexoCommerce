<?php

declare(strict_types=1);

namespace Tests\Integracion\Carrito;

use App\Infraestructura\Persistencia\Eloquent\Modelos\CarritoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class CarritoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_rutas_exigen_autenticacion_y_crean_un_solo_carrito_por_usuario(): void
    {
        $this->getJson('/api/v1/carrito')->assertUnauthorized();
        $this->postJson('/api/v1/carrito/items', [])->assertUnauthorized();
        $this->putJson('/api/v1/carrito/items/1', ['cantidad' => 1])->assertUnauthorized();
        $this->deleteJson('/api/v1/carrito/items/1')->assertUnauthorized();
        $this->deleteJson('/api/v1/carrito')->assertUnauthorized();
        $cliente = UsuarioModelo::factory()->verificado()->create();

        $this->withToken($cliente->createToken('test')->plainTextToken)->getJson('/api/v1/carrito')
            ->assertOk()->assertJsonPath('data.usuario_id', $cliente->id)->assertJsonPath('data.total', 0);
        $this->getJson('/api/v1/carrito')->assertOk();
        $this->assertSame(1, CarritoModelo::query()->where('usuario_id', $cliente->id)->count());
    }

    public function test_detalle_fusion_stock_acumulado_y_operaciones_de_eliminacion(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken);
        $producto = ProductoModelo::factory()->create(['precio_base' => '10.05']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 5]);
        $url = '/api/v1/carrito/items';

        $this->postJson($url, ['producto_id' => $producto->id, 'cantidad' => 2, 'comentario' => 'A', 'precio_unitario' => 0])
            ->assertCreated()->assertJsonPath('data.items.0.precio_unitario', 10.05);
        $this->postJson($url, ['producto_id' => $producto->id, 'cantidad' => 2, 'comentario' => 'A'])
            ->assertCreated()->assertJsonCount(1, 'data.items')->assertJsonPath('data.items.0.cantidad', 4);
        $this->postJson($url, ['producto_id' => $producto->id, 'cantidad' => 1, 'comentario' => 'B'])
            ->assertCreated()->assertJsonCount(2, 'data.items');
        $this->postJson($url, ['producto_id' => $producto->id, 'cantidad' => 1, 'comentario' => 'A'])
            ->assertBadRequest()->assertJsonPath('codigo_error', 'CAR_SIN_STOCK');
        $items = $this->getJson('/api/v1/carrito')->json('data.items');
        $this->assertCount(2, $items);
        $this->putJson($url.'/'.$items[0]['id'], ['cantidad' => 5])->assertBadRequest();
        $this->putJson($url.'/'.$items[0]['id'], ['cantidad' => 3])
            ->assertOk()->assertJsonPath('data.items.0.cantidad', 3);
        $this->deleteJson($url.'/'.$items[1]['id'])->assertOk()->assertJsonCount(1, 'data.items');
        $this->deleteJson('/api/v1/carrito')->assertOk()->assertJsonCount(0, 'data.items');
        $this->assertDatabaseCount('detalles_carrito', 0);
        $this->assertDatabaseHas('carritos', ['usuario_id' => $cliente->id, 'activo' => true]);
    }

    public function test_configuracion_por_tipo_y_propiedad_de_diseno(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken);
        $torta = ProductoModelo::factory()->create(['precio_base' => '12.35']);
        TortaModelo::factory()->create(['producto_id' => $torta->id]);
        $diseno = DisenoTortaModelo::factory()->create(['torta_id' => $torta->id, 'costo_adicional' => '1.50']);
        $otroDiseno = DisenoTortaModelo::factory()->create();
        $sublimacion = ProductoModelo::factory()->create(['precio_base' => '8.10']);
        SublimacionModelo::factory()->create(['producto_id' => $sublimacion->id]);
        $plantilla = PlantillaDisenoModelo::factory()->create(['sublimacion_id' => $sublimacion->id, 'costo_adicional' => '0.20']);
        $personalizado = DisenoPersonalizadoModelo::factory()->create(['usuario_id' => $cliente->id, 'sublimacion_id' => $sublimacion->id]);
        $ajeno = DisenoPersonalizadoModelo::factory()->create(['sublimacion_id' => $sublimacion->id]);
        $url = '/api/v1/carrito/items';

        $this->postJson($url, ['producto_id' => $sublimacion->id, 'cantidad' => 1])->assertBadRequest();
        $this->postJson($url, ['producto_id' => $torta->id, 'cantidad' => 1, 'diseno_torta_id' => $diseno->id, 'plantilla_diseno_id' => $plantilla->id])->assertUnprocessable();
        $this->postJson($url, ['producto_id' => $torta->id, 'cantidad' => 1, 'diseno_torta_id' => $otroDiseno->id])->assertBadRequest();
        $this->postJson($url, ['producto_id' => $sublimacion->id, 'cantidad' => 1, 'diseno_personalizado_id' => $ajeno->id])->assertBadRequest();
        $this->postJson($url, ['producto_id' => $torta->id, 'cantidad' => 1, 'diseno_torta_id' => $diseno->id])
            ->assertCreated()->assertJsonPath('data.items.0.precio_unitario', 13.85);
        $this->postJson($url, ['producto_id' => $sublimacion->id, 'cantidad' => 1, 'plantilla_diseno_id' => $plantilla->id])
            ->assertCreated()->assertJsonPath('data.items.1.precio_unitario', 8.3);
        $this->postJson($url, ['producto_id' => $sublimacion->id, 'cantidad' => 1, 'diseno_personalizado_id' => $personalizado->id])
            ->assertCreated()->assertJsonPath('data.items.2.precio_unitario', 8.1);
        $this->assertDatabaseCount('detalles_carrito', 3);
    }

    public function test_precio_vigente_avisos_y_aislamiento_entre_usuarios(): void
    {
        $primero = UsuarioModelo::factory()->verificado()->create();
        $segundo = UsuarioModelo::factory()->admin()->create();
        $producto = ProductoModelo::factory()->create(['precio_base' => '10.00']);
        $detalle = DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 3]);
        $this->withToken($primero->createToken('test')->plainTextToken);
        $creado = $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2])->assertCreated();
        $id = $creado->json('data.items.0.id');
        $producto->update(['precio_base' => '11.25']);
        $detalle->update(['stock' => 1]);

        $this->getJson('/api/v1/carrito')->assertOk()
            ->assertJsonPath('data.items.0.precio_actualizado', true)
            ->assertJsonPath('data.precios_actualizados.0', $id)
            ->assertJsonPath('data.items.0.avisos.0', 'STOCK_INSUFICIENTE')
            ->assertJsonPath('data.total', 22.5);
        $this->assertDatabaseHas('detalles_carrito', ['id' => $id, 'precio_unitario' => '11.25', 'cantidad' => 2]);
        Auth::forgetGuards();
        $this->withToken($segundo->createToken('test')->plainTextToken)
            ->putJson('/api/v1/carrito/items/'.$id, ['cantidad' => 1])->assertForbidden();
        $this->deleteJson('/api/v1/carrito/items/'.$id)->assertForbidden();
        $this->getJson('/api/v1/carrito')->assertOk()->assertJsonCount(0, 'data.items');
        $producto->update(['activo' => false]);
        Auth::forgetGuards();
        $this->withToken($primero->createToken('test-2')->plainTextToken)
            ->getJson('/api/v1/carrito')->assertOk()->assertJsonPath('data.items.0.avisos.0', 'PRODUCTO_INACTIVO');
        $this->assertDatabaseHas('detalles_carrito', ['id' => $id]);
    }

    public function test_plantilla_desactivada_permanece_visible_y_update_informa_cambio_de_precio(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken);
        $producto = ProductoModelo::factory()->create(['precio_base' => '9.00']);
        SublimacionModelo::factory()->create(['producto_id' => $producto->id]);
        $plantilla = PlantillaDisenoModelo::factory()->create(['sublimacion_id' => $producto->id, 'costo_adicional' => '1.00']);
        $creado = $this->postJson('/api/v1/carrito/items', [
            'producto_id' => $producto->id, 'cantidad' => 1, 'plantilla_diseno_id' => $plantilla->id,
        ])->assertCreated();
        $id = $creado->json('data.items.0.id');
        $plantilla->update(['costo_adicional' => '2.00']);

        $this->putJson('/api/v1/carrito/items/'.$id, ['cantidad' => 2])->assertOk()
            ->assertJsonPath('data.items.0.precio_actualizado', true)
            ->assertJsonPath('data.items.0.precio_unitario', 11)
            ->assertJsonPath('data.precios_actualizados.0', $id);
        $plantilla->update(['activo' => false]);
        $this->getJson('/api/v1/carrito')->assertOk()
            ->assertJsonPath('data.items.0.disponible', false)
            ->assertJsonPath('data.items.0.avisos.0', 'PLANTILLA_NO_DISPONIBLE');
        $this->putJson('/api/v1/carrito/items/'.$id, ['cantidad' => 3])->assertBadRequest();
        $this->assertDatabaseHas('detalles_carrito', ['id' => $id, 'cantidad' => 2]);
    }

    public function test_error_no_persiste_cambios_parciales_y_cantidad_debe_ser_positiva(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken);
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 1]);
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 0])->assertUnprocessable();
        $this->postJson('/api/v1/carrito/items', ['producto_id' => $producto->id, 'cantidad' => 2])->assertBadRequest();
        $this->assertDatabaseCount('detalles_carrito', 0);
        $this->assertDatabaseCount('carritos', 0);
    }
}
