<?php

declare(strict_types=1);

namespace Tests\Integracion\Publicaciones;

use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PublicacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PublicacionesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_listado_publico_pagina_filtra_y_ordena_imagenes_de_publicaciones_activas(): void
    {
        config(['app.multimedia_public_base_url' => 'https://files.example.test/multimedia']);
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $producto = ProductoModelo::factory()->create(['categoria_id' => $categoria->id]);

        foreach (range(1, 11) as $numero) {
            PublicacionModelo::factory()->create([
                'categoria_id' => $categoria->id,
                'titulo' => "Publicacion {$numero}",
            ]);
        }
        PublicacionModelo::factory()->inactiva()->create(['categoria_id' => $categoria->id]);

        $destacada = PublicacionModelo::factory()->create([
            'categoria_id' => $categoria->id,
            'producto_id' => $producto->id,
            'titulo' => 'Promocion destacada',
        ]);
        $segunda = MultimediaModelo::factory()->create(['ruta_archivo' => 'publicaciones/segunda.webp']);
        $primera = MultimediaModelo::factory()->create(['ruta_archivo' => 'publicaciones/primera.webp']);
        $destacada->multimedia()->attach($segunda->id, ['orden' => 2]);
        $destacada->multimedia()->attach($primera->id, ['orden' => 0]);

        $this->getJson("/api/v1/publicaciones?categoria_id={$categoria->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.pagina_actual', 1)
            ->assertJsonPath('meta.por_pagina', 10)
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.total_paginas', 2);

        $this->getJson("/api/v1/publicaciones?producto_id={$producto->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Promocion destacada')
            ->assertJsonPath('data.0.imagenes.0.id', $primera->id)
            ->assertJsonPath('data.0.imagenes.0.orden', 0)
            ->assertJsonPath('data.0.imagenes.0.url', 'https://files.example.test/multimedia/publicaciones/primera.webp')
            ->assertJsonPath('data.0.imagenes.1.id', $segunda->id);

        $this->getJson("/api/v1/publicaciones?categoria_id={$categoria->id}&page=2")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_ve_inactivas_en_rutas_publicas_pero_anonimo_y_cliente_reciben_404(): void
    {
        $publicacion = PublicacionModelo::factory()->inactiva()->create(['titulo' => 'Borrador']);

        $this->getJson('/api/v1/publicaciones')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/publicaciones/{$publicacion->id}")
            ->assertNotFound()
            ->assertJsonPath('codigo_error', 'PUB_NO_ENCONTRADA');

        $this->withToken($this->tokenCliente())->getJson('/api/v1/publicaciones')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->withToken($this->tokenCliente())->getJson("/api/v1/publicaciones/{$publicacion->id}")
            ->assertNotFound();

        $tokenAdmin = $this->tokenAdmin();
        $this->withToken($tokenAdmin)->getJson('/api/v1/publicaciones')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.activo', false);
        $this->withToken($tokenAdmin)->getJson("/api/v1/publicaciones/{$publicacion->id}")
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Borrador');
    }

    public function test_admin_crea_publicacion_sin_categoria_ni_producto_y_autor_sale_del_token(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $otroAdmin = UsuarioModelo::factory()->admin()->create();
        $imagen = MultimediaModelo::factory()->create(['ruta_archivo' => 'publicaciones/promo.webp']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/v1/admin/publicaciones', [
            'titulo' => 'Nuevos sabores',
            'descripcion' => 'Tortas de maracuya.',
            'usuario_id' => $otroAdmin->id,
            'imagenes' => [['multimedia_id' => $imagen->id, 'orden' => 3]],
        ])->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.categoria_id', null)
            ->assertJsonPath('data.producto_id', null)
            ->assertJsonPath('data.imagenes.0.id', $imagen->id);

        $id = (int) $response->json('data.id');
        $this->assertDatabaseHas('publicaciones', [
            'id' => $id,
            'usuario_id' => $admin->id,
            'categoria_id' => null,
            'producto_id' => null,
        ]);
        $this->assertDatabaseHas('publicacion_multimedia', [
            'publicacion_id' => $id,
            'multimedia_id' => $imagen->id,
            'orden' => 3,
        ]);
    }

    public function test_creacion_rechaza_mas_de_ocho_imagenes_y_multimedia_duplicada(): void
    {
        $imagenes = MultimediaModelo::factory()->count(9)->create();
        $token = $this->tokenAdmin();

        $this->withToken($token)->postJson('/api/v1/admin/publicaciones', [
            'titulo' => 'Demasiadas imagenes',
            'imagenes' => $imagenes->map(fn (MultimediaModelo $imagen): array => [
                'multimedia_id' => $imagen->id,
            ])->all(),
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['imagenes']]);

        $this->withToken($token)->postJson('/api/v1/admin/publicaciones', [
            'titulo' => 'Imagen repetida',
            'imagenes' => [
                ['multimedia_id' => $imagenes->first()->id],
                ['multimedia_id' => $imagenes->first()->id],
            ],
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['imagenes.1.multimedia_id']]);

        $this->assertDatabaseMissing('publicaciones', ['titulo' => 'Demasiadas imagenes']);
        $this->assertDatabaseMissing('publicaciones', ['titulo' => 'Imagen repetida']);
    }

    public function test_put_conserva_omitidos_permite_nulos_y_reemplaza_o_limpia_imagenes(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $producto = ProductoModelo::factory()->create(['categoria_id' => $categoria->id]);
        $publicacion = PublicacionModelo::factory()->create([
            'categoria_id' => $categoria->id,
            'producto_id' => $producto->id,
            'descripcion' => 'Conservar',
        ]);
        $anterior = MultimediaModelo::factory()->create();
        $nueva = MultimediaModelo::factory()->create(['ruta_archivo' => 'publicaciones/nueva.webp']);
        $publicacion->multimedia()->attach($anterior->id, ['orden' => 0]);
        $token = $this->tokenAdmin();

        $this->withToken($token)->putJson("/api/v1/admin/publicaciones/{$publicacion->id}", [
            'titulo' => 'Actualizada',
        ])->assertOk()
            ->assertJsonPath('data.descripcion', 'Conservar')
            ->assertJsonCount(1, 'data.imagenes');

        $this->withToken($token)->putJson("/api/v1/admin/publicaciones/{$publicacion->id}", [
            'categoria_id' => null,
            'producto_id' => null,
            'imagenes' => [['multimedia_id' => $nueva->id, 'orden' => 2]],
        ])->assertOk()
            ->assertJsonPath('data.categoria_id', null)
            ->assertJsonPath('data.producto_id', null)
            ->assertJsonPath('data.imagenes.0.id', $nueva->id);
        $this->assertDatabaseMissing('publicacion_multimedia', [
            'publicacion_id' => $publicacion->id,
            'multimedia_id' => $anterior->id,
        ]);

        $this->withToken($token)->putJson("/api/v1/admin/publicaciones/{$publicacion->id}", ['imagenes' => []])
            ->assertOk()
            ->assertJsonCount(0, 'data.imagenes');
    }

    public function test_delete_desactiva_y_no_borra_la_publicacion(): void
    {
        $publicacion = PublicacionModelo::factory()->create();

        $this->withToken($this->tokenAdmin())
            ->deleteJson("/api/v1/admin/publicaciones/{$publicacion->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('publicaciones', ['id' => $publicacion->id, 'activo' => false]);
        $this->withHeaders(['Authorization' => ''])->getJson("/api/v1/publicaciones/{$publicacion->id}")
            ->assertNotFound()
            ->assertJsonPath('codigo_error', 'PUB_NO_ENCONTRADA');
    }

    public function test_rutas_administrativas_exigen_token_y_rol_admin(): void
    {
        $rutas = [
            ['POST', '/api/v1/admin/publicaciones'],
            ['PUT', '/api/v1/admin/publicaciones/999999'],
            ['DELETE', '/api/v1/admin/publicaciones/999999'],
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

    public function test_repositorio_revierte_publicacion_si_falla_asociacion_multimedia(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $repositorio = $this->app->make(PublicacionRepositorioInterface::class);

        try {
            $repositorio->crear($admin->id, [
                'titulo' => 'Debe revertirse',
                'descripcion' => null,
                'categoria_id' => null,
                'producto_id' => null,
                'activo' => true,
                'imagenes' => [['multimedia_id' => 999999, 'orden' => 0]],
            ]);
            $this->fail('Se esperaba una violacion de llave foranea.');
        } catch (QueryException) {
            $this->assertDatabaseMissing('publicaciones', ['titulo' => 'Debe revertirse']);
            $this->assertSame(0, DB::table('publicacion_multimedia')->count());
        }
    }

    private function tokenAdmin(): string
    {
        return UsuarioModelo::factory()->admin()->create()->createToken('test')->plainTextToken;
    }

    private function tokenCliente(): string
    {
        return UsuarioModelo::factory()->verificado()->create()->createToken('test')->plainTextToken;
    }
}
