<?php

declare(strict_types=1);

namespace Tests\Integracion\Productos;

use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProductosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_catalogo_publico_filtra_ordena_y_pagina_solo_activos(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create();
        foreach (range(1, 13) as $numero) {
            $producto = ProductoModelo::factory()->create([
                'categoria_id' => $categoria->id,
                'nombre' => "Torta Chocolate {$numero}",
                'precio_base' => $numero,
            ]);
            TortaModelo::factory()->create([
                'producto_id' => $producto->id,
                'porciones' => $numero + 5,
                'sabor' => 'Chocolate',
            ]);
        }
        $inactivo = ProductoModelo::factory()->inactivo()->create(['categoria_id' => $categoria->id]);
        DetalleModelo::factory()->create(['producto_id' => $inactivo->id]);

        $response = $this->getJson(
            "/api/v1/productos?categoria_id={$categoria->id}&tipo=TORTA&buscar=chocolate&precio_min=1&precio_max=13&porciones_min=6&porciones_max=18&sabor=choco&ordenar=precio_desc",
        )->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(12, 'data')
            ->assertJsonPath('data.0.precio_base', 13)
            ->assertJsonPath('data.0.tipo', 'TORTA')
            ->assertJsonPath('meta.pagina_actual', 1)
            ->assertJsonPath('meta.por_pagina', 12)
            ->assertJsonPath('meta.total', 13)
            ->assertJsonPath('meta.total_paginas', 2);

        $this->assertArrayNotHasKey('slug', $response->json('data.0'));
        $this->assertArrayNotHasKey('stock', $response->json('data.0'));
        $this->getJson('/api/v1/productos?page=2')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_detalle_publico_devuelve_especializacion_diseno_e_imagen_sin_campos_inexistentes(): void
    {
        config(['app.multimedia_public_base_url' => 'https://files.example.test/multimedia']);
        $producto = ProductoModelo::factory()->create();
        $torta = TortaModelo::factory()->create(['producto_id' => $producto->id]);
        $imagen = MultimediaModelo::factory()->create(['ruta_archivo' => 'productos/torta.webp']);
        $producto->multimedia()->attach($imagen->id, ['orden' => 0, 'es_principal' => true]);
        DisenoTortaModelo::factory()->create(['torta_id' => $torta->producto_id, 'nombre' => 'Flores']);
        DisenoTortaModelo::factory()->create(['torta_id' => $torta->producto_id, 'activo' => false]);

        $response = $this->getJson("/api/v1/productos/{$producto->id}")
            ->assertOk()
            ->assertJsonPath('data.tipo', 'TORTA')
            ->assertJsonPath('data.imagenes.0.url', 'https://files.example.test/multimedia/productos/torta.webp')
            ->assertJsonPath('data.torta.sabor', 'Chocolate')
            ->assertJsonPath('data.torta.disenos.0.nombre', 'Flores')
            ->assertJsonCount(1, 'data.torta.disenos')
            ->assertJsonPath('data.detalle', null)
            ->assertJsonPath('data.sublimacion', null);

        $datos = $response->json('data');
        $this->assertArrayNotHasKey('slug', $datos);
        $this->assertArrayNotHasKey('personalizaciones', $datos);
        $this->assertArrayNotHasKey('stock', $datos);
    }

    public function test_producto_inactivo_no_aparece_ni_se_consulta_publicamente(): void
    {
        $producto = ProductoModelo::factory()->inactivo()->create();
        DetalleModelo::factory()->create(['producto_id' => $producto->id]);

        $this->getJson('/api/v1/productos')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/productos/{$producto->id}")
            ->assertNotFound()
            ->assertJsonPath('codigo_error', 'PROD_NO_ENCONTRADO');
    }

    public function test_admin_crea_torta_transaccional_con_imagenes(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $imagen = MultimediaModelo::factory()->create();

        $response = $this->withToken($this->tokenAdmin())->postJson('/api/v1/admin/productos', [
            'categoria_id' => $categoria->id,
            'nombre' => 'Torta Chocolate',
            'descripcion' => 'Bizcocho',
            'precio_base' => 25,
            'activo' => true,
            'tipo' => 'TORTA',
            'torta' => ['tamano' => 'Mediana', 'porciones' => 12, 'sabor' => 'Chocolate'],
            'imagenes' => [['multimedia_id' => $imagen->id, 'orden' => 0, 'es_principal' => true]],
        ])->assertCreated()
            ->assertJsonPath('data.tipo', 'TORTA')
            ->assertJsonPath('data.torta.porciones', 12)
            ->assertJsonPath('data.imagenes.0.es_principal', true);

        $productoId = (int) $response->json('data.id');
        $this->assertDatabaseHas('productos', ['id' => $productoId, 'nombre' => 'Torta Chocolate']);
        $this->assertDatabaseHas('tortas', ['producto_id' => $productoId, 'sabor' => 'Chocolate']);
        $this->assertDatabaseHas('producto_multimedia', [
            'producto_id' => $productoId,
            'multimedia_id' => $imagen->id,
            'es_principal' => true,
        ]);
    }

    public function test_creacion_rechaza_torta_sin_sabor_stock_negativo_especializacion_incompatible_y_multimedia_repetida(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $imagen = MultimediaModelo::factory()->create();
        $otraImagen = MultimediaModelo::factory()->create(['ruta_archivo' => 'productos/otra.png']);
        $base = [
            'categoria_id' => $categoria->id,
            'nombre' => 'Producto invalido',
            'precio_base' => 10,
        ];
        $token = $this->tokenAdmin();

        $this->withToken($token)->postJson('/api/v1/admin/productos', $base + [
            'tipo' => 'TORTA',
            'torta' => ['tamano' => 'Mediana', 'porciones' => 12],
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['torta.sabor']]);

        $this->withToken($token)->postJson('/api/v1/admin/productos', $base + [
            'tipo' => 'DETALLE',
            'detalle' => ['stock' => -1],
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['detalle.stock']]);

        $this->withToken($token)->postJson('/api/v1/admin/productos', $base + [
            'tipo' => 'DETALLE',
            'detalle' => ['stock' => 2],
            'torta' => ['tamano' => 'Mediana', 'porciones' => 12, 'sabor' => 'Vainilla'],
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['torta']]);

        $this->withToken($token)->postJson('/api/v1/admin/productos', $base + [
            'tipo' => 'DETALLE',
            'detalle' => ['stock' => 2],
            'imagenes' => [
                ['multimedia_id' => $imagen->id, 'es_principal' => true],
                ['multimedia_id' => $imagen->id],
            ],
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['imagenes.1.multimedia_id']]);

        $this->withToken($token)->postJson('/api/v1/admin/productos', $base + [
            'tipo' => 'DETALLE',
            'detalle' => ['stock' => 2],
            'imagenes' => [
                ['multimedia_id' => $imagen->id, 'es_principal' => true],
                ['multimedia_id' => $otraImagen->id, 'es_principal' => true],
            ],
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['imagenes']]);

        $this->assertDatabaseMissing('productos', ['nombre' => 'Producto invalido']);
    }

    public function test_repositorio_revierte_alta_completa_si_falla_una_asociacion(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $repositorio = $this->app->make(ProductoRepositorioInterface::class);

        try {
            $repositorio->crear([
                'categoria_id' => $categoria->id,
                'nombre' => 'Debe revertirse',
                'descripcion' => null,
                'precio_base' => 10,
                'activo' => true,
                'tipo' => 'DETALLE',
                'torta' => null,
                'detalle' => ['stock' => 1],
                'sublimacion' => null,
                'imagenes' => [['multimedia_id' => 999999, 'orden' => 0, 'es_principal' => true]],
            ]);
            $this->fail('Se esperaba una violacion de llave foranea.');
        } catch (QueryException) {
            $this->assertDatabaseMissing('productos', ['nombre' => 'Debe revertirse']);
            $this->assertSame(0, DB::table('detalles')->count());
        }
    }

    public function test_put_conserva_omitidos_reemplaza_imagenes_y_tipo_es_inmutable(): void
    {
        $producto = ProductoModelo::factory()->create(['descripcion' => 'Conservar', 'precio_base' => 20]);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 8]);
        $anterior = MultimediaModelo::factory()->create();
        $nueva = MultimediaModelo::factory()->create(['ruta_archivo' => 'productos/nueva.png']);
        $producto->multimedia()->attach($anterior->id, ['orden' => 0, 'es_principal' => true]);
        $token = $this->tokenAdmin();

        $this->withToken($token)->putJson("/api/v1/admin/productos/{$producto->id}", [
            'nombre' => 'Actualizado',
            'detalle' => ['stock' => 4],
        ])->assertOk()
            ->assertJsonPath('data.descripcion', 'Conservar')
            ->assertJsonPath('data.detalle.stock', 4)
            ->assertJsonCount(1, 'data.imagenes');

        $this->withToken($token)->putJson("/api/v1/admin/productos/{$producto->id}", [
            'imagenes' => [['multimedia_id' => $nueva->id, 'orden' => 2, 'es_principal' => true]],
        ])->assertOk()->assertJsonPath('data.imagenes.0.id', $nueva->id);
        $this->assertDatabaseMissing('producto_multimedia', ['producto_id' => $producto->id, 'multimedia_id' => $anterior->id]);

        $this->withToken($token)->putJson("/api/v1/admin/productos/{$producto->id}", ['imagenes' => []])
            ->assertOk()->assertJsonCount(0, 'data.imagenes');

        $this->withToken($token)->putJson("/api/v1/admin/productos/{$producto->id}", ['tipo' => 'TORTA'])
            ->assertBadRequest()
            ->assertJsonPath('codigo_error', 'PROD_TIPO_INMUTABLE');
    }

    public function test_todas_las_rutas_admin_exigen_token_y_rol_admin(): void
    {
        $rutas = [
            ['POST', '/api/v1/admin/productos'],
            ['PUT', '/api/v1/admin/productos/999999'],
            ['DELETE', '/api/v1/admin/productos/999999'],
            ['POST', '/api/v1/admin/tortas/999999/disenos'],
            ['PUT', '/api/v1/admin/disenos-torta/999999'],
            ['DELETE', '/api/v1/admin/disenos-torta/999999'],
            ['POST', '/api/v1/admin/sublimaciones/999999/plantillas'],
            ['PUT', '/api/v1/admin/plantillas-diseno/999999'],
            ['DELETE', '/api/v1/admin/plantillas-diseno/999999'],
        ];

        foreach ($rutas as [$metodo, $ruta]) {
            $this->json($metodo, $ruta)->assertUnauthorized();
        }

        $this->withToken($this->tokenCliente());
        foreach ($rutas as [$metodo, $ruta]) {
            $this->json($metodo, $ruta)
                ->assertForbidden()
                ->assertJsonPath('codigo_error', 'AUTH_FORBIDDEN');
        }
    }

    public function test_ciclo_sublimacion_exige_plantilla_activa_para_activar_y_protege_la_ultima(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $token = $this->tokenAdmin();
        $payload = [
            'categoria_id' => $categoria->id,
            'nombre' => 'Taza borrador',
            'precio_base' => 12.5,
            'tipo' => 'SUBLIMACION',
            'sublimacion' => ['tipo_material' => 'Ceramica'],
        ];

        $this->withToken($token)->postJson('/api/v1/admin/productos', $payload + ['activo' => true])
            ->assertBadRequest()
            ->assertJsonPath('codigo_error', 'PROD_SUBLIMACION_SIN_PLANTILLA');
        $this->assertDatabaseMissing('productos', ['nombre' => 'Taza borrador']);

        $creada = $this->withToken($token)->postJson('/api/v1/admin/productos', $payload)
            ->assertCreated()
            ->assertJsonPath('data.activo', false);
        $productoId = (int) $creada->json('data.id');

        $this->withToken($token)->putJson("/api/v1/admin/productos/{$productoId}", ['activo' => true])
            ->assertBadRequest()
            ->assertJsonPath('codigo_error', 'PROD_SUBLIMACION_SIN_PLANTILLA');

        $plantilla = $this->withToken($token)
            ->postJson("/api/v1/admin/sublimaciones/{$productoId}/plantillas", ['nombre' => 'Logo'])
            ->assertCreated();
        $plantillaId = (int) $plantilla->json('data.id');

        $this->withToken($token)->putJson("/api/v1/admin/productos/{$productoId}", ['activo' => true])
            ->assertOk()->assertJsonPath('data.activo', true);

        $this->withToken($token)->deleteJson("/api/v1/admin/plantillas-diseno/{$plantillaId}")
            ->assertBadRequest()
            ->assertJsonPath('codigo_error', 'PROD_SUBLIMACION_SIN_PLANTILLA');
        $this->assertDatabaseHas('plantillas_diseno', ['id' => $plantillaId, 'activo' => true]);

        $segunda = PlantillaDisenoModelo::factory()->create(['sublimacion_id' => $productoId]);
        $this->withToken($token)->putJson("/api/v1/admin/plantillas-diseno/{$segunda->id}", [
            'nombre' => 'Logo actualizado',
            'descripcion' => null,
        ])->assertOk()->assertJsonPath('data.nombre', 'Logo actualizado');
        $this->withToken($token)->deleteJson("/api/v1/admin/plantillas-diseno/{$plantillaId}")->assertOk();
    }

    public function test_crud_logico_de_diseno_torta_conserva_campos_omitidos(): void
    {
        $producto = ProductoModelo::factory()->create();
        TortaModelo::factory()->create(['producto_id' => $producto->id]);
        $token = $this->tokenAdmin();

        $creado = $this->withToken($token)
            ->postJson("/api/v1/admin/tortas/{$producto->id}/disenos", [
                'nombre' => 'Flores',
                'descripcion' => 'Original',
                'costo_adicional' => 5,
            ])->assertCreated();
        $id = (int) $creado->json('data.id');

        $this->withToken($token)->putJson("/api/v1/admin/disenos-torta/{$id}", ['nombre' => 'Rosas'])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Rosas')
            ->assertJsonPath('data.descripcion', 'Original')
            ->assertJsonPath('data.costo_adicional', 5);
        $this->withToken($token)->deleteJson("/api/v1/admin/disenos-torta/{$id}")->assertOk();
        $this->assertDatabaseHas('disenos_torta', ['id' => $id, 'activo' => false]);
    }

    public function test_diseno_personalizado_asigna_usuario_valida_multimedia_y_aisla_listado(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $otro = UsuarioModelo::factory()->verificado()->create();
        $sublimacion = $this->crearSublimacion();
        $propia = MultimediaModelo::factory()->create(['subido_por_id' => $cliente->id]);
        $ajena = MultimediaModelo::factory()->create(['subido_por_id' => $otro->id]);
        DisenoPersonalizadoModelo::factory()->create([
            'usuario_id' => $otro->id,
            'sublimacion_id' => $sublimacion->producto_id,
            'multimedia_id' => $ajena->id,
        ]);
        $token = $cliente->createToken('test')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/disenos-personalizados', [
            'sublimacion_id' => $sublimacion->producto_id,
            'multimedia_id' => $ajena->id,
        ])->assertForbidden()->assertJsonPath('codigo_error', 'PROD_MULTIMEDIA_NO_AUTORIZADA');

        $creado = $this->withToken($token)->postJson('/api/v1/disenos-personalizados', [
            'sublimacion_id' => $sublimacion->producto_id,
            'multimedia_id' => $propia->id,
            'indicaciones' => 'Colores pastel',
            'usuario_id' => $otro->id,
        ])->assertCreated()
            ->assertJsonPath('data.usuario_id', $cliente->id);
        $this->assertDatabaseHas('disenos_personalizados', [
            'id' => $creado->json('data.id'),
            'usuario_id' => $cliente->id,
            'multimedia_id' => $propia->id,
        ]);

        $this->withToken($token)->getJson('/api/v1/disenos-personalizados')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.usuario_id', $cliente->id);
    }

    public function test_admin_no_puede_usar_endpoints_de_diseno_personalizado(): void
    {
        $this->getJson('/api/v1/disenos-personalizados')->assertUnauthorized();
        $this->withToken($this->tokenAdmin())->getJson('/api/v1/disenos-personalizados')
            ->assertForbidden();
    }

    private function tokenAdmin(): string
    {
        return UsuarioModelo::factory()->admin()->create()->createToken('test')->plainTextToken;
    }

    private function tokenCliente(): string
    {
        return UsuarioModelo::factory()->verificado()->create()->createToken('test')->plainTextToken;
    }

    private function crearSublimacion(): SublimacionModelo
    {
        $producto = ProductoModelo::factory()->create();

        return SublimacionModelo::factory()->create(['producto_id' => $producto->id]);
    }
}
