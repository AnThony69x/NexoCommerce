<?php

declare(strict_types=1);

namespace Tests\Integracion\Categorias;

use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CategoriasTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_get_publico_devuelve_arbol_con_imagen_y_nombres_sql(): void
    {
        config(['app.multimedia_public_base_url' => 'https://files.example.test/multimedia']);
        $imagen = MultimediaModelo::factory()->create([
            'ruta_archivo' => 'categorias/reposteria.webp',
        ]);
        $raiz = CategoriaModelo::factory()->raiz()->conImagen($imagen)->create([
            'nombre' => 'Reposteria',
        ]);
        $hija = CategoriaModelo::factory()->subcategoria($raiz)->create([
            'nombre' => 'Tortas',
        ]);
        CategoriaModelo::factory()->subcategoria($hija)->create([
            'nombre' => 'Cumpleanos',
        ]);

        $response = $this->getJson('/api/v1/categorias')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id', $raiz->id)
            ->assertJsonPath('data.0.categoria_padre_id', null)
            ->assertJsonPath('data.0.imagen.id', $imagen->id)
            ->assertJsonPath('data.0.imagen.ruta_archivo', 'categorias/reposteria.webp')
            ->assertJsonPath('data.0.imagen.url', 'https://files.example.test/multimedia/categorias/reposteria.webp')
            ->assertJsonPath('data.0.subcategorias.0.id', $hija->id)
            ->assertJsonPath('data.0.subcategorias.0.subcategorias.0.nombre', 'Cumpleanos');

        $data = $response->json('data.0');
        $this->assertArrayNotHasKey('parent_id', $data);
        $this->assertArrayNotHasKey('slug', $data);
    }

    public function test_solo_activas_oculta_rama_inactiva_y_false_la_incluye(): void
    {
        $padreInactivo = CategoriaModelo::factory()->raiz()->inactiva()->create([
            'nombre' => 'Oculta',
        ]);
        $hijaActiva = CategoriaModelo::factory()->subcategoria($padreInactivo)->create([
            'nombre' => 'Hija activa',
        ]);
        $visible = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Visible']);

        $this->getJson('/api/v1/categorias')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id);

        $this->getJson('/api/v1/categorias?solo_activas=false')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $padreInactivo->id)
            ->assertJsonPath('data.0.subcategorias.0.id', $hijaActiva->id);
    }

    public function test_solo_activas_invalido_retorna_422(): void
    {
        $this->getJson('/api/v1/categorias?solo_activas=quizas')
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['solo_activas']]);
    }

    public function test_admin_crea_subcategoria(): void
    {
        $padre = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Sublimacion']);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/admin/categorias', [
                'categoria_padre_id' => $padre->id,
                'nombre' => 'Tazas',
                'descripcion' => 'Tazas personalizadas',
                'activo' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.categoria_padre_id', $padre->id)
            ->assertJsonPath('data.nombre', 'Tazas');

        $this->assertDatabaseHas('categorias', [
            'categoria_padre_id' => $padre->id,
            'nombre' => 'Tazas',
            'activo' => true,
        ]);
    }

    public function test_raiz_duplicada_retorna_422(): void
    {
        CategoriaModelo::factory()->raiz()->create(['nombre' => 'Detalles']);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/admin/categorias', ['nombre' => 'Detalles'])
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['nombre']]);

        $this->assertSame(1, CategoriaModelo::query()->where('nombre', 'Detalles')->count());
    }

    public function test_mismo_nombre_en_padres_distintos_es_valido(): void
    {
        $padreUno = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Padre uno']);
        $padreDos = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Padre dos']);
        CategoriaModelo::factory()->subcategoria($padreUno)->create(['nombre' => 'Accesorios']);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/admin/categorias', [
                'categoria_padre_id' => $padreDos->id,
                'nombre' => 'Accesorios',
            ])
            ->assertCreated();

        $this->assertSame(2, CategoriaModelo::query()->where('nombre', 'Accesorios')->count());
    }

    public function test_nombre_duplicado_en_el_mismo_padre_retorna_422(): void
    {
        $padre = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Sublimacion']);
        CategoriaModelo::factory()->subcategoria($padre)->create(['nombre' => 'Tazas']);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/admin/categorias', [
                'categoria_padre_id' => $padre->id,
                'nombre' => 'Tazas',
            ])
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['nombre']]);

        $this->assertSame(1, CategoriaModelo::query()->where('nombre', 'Tazas')->count());
    }

    public function test_padre_inexistente_retorna_422(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/admin/categorias', [
                'categoria_padre_id' => 999999,
                'nombre' => 'Huerfana',
            ])
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['categoria_padre_id']]);

        $this->assertDatabaseMissing('categorias', ['nombre' => 'Huerfana']);
    }

    public function test_imagen_inexistente_retorna_422(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/admin/categorias', [
                'nombre' => 'Con imagen invalida',
                'imagen_id' => 999999,
            ])
            ->assertUnprocessable()
            ->assertJsonStructure(['errors' => ['imagen_id']]);

        $this->assertDatabaseMissing('categorias', ['nombre' => 'Con imagen invalida']);
    }

    public function test_cliente_no_puede_crear_categoria(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $token = $cliente->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/admin/categorias', ['nombre' => 'No permitida'])
            ->assertForbidden()
            ->assertJsonPath('codigo_error', 'AUTH_FORBIDDEN');

        $this->assertDatabaseMissing('categorias', ['nombre' => 'No permitida']);
    }

    public function test_escritura_sin_token_retorna_401(): void
    {
        $this->postJson('/api/v1/admin/categorias', ['nombre' => 'Sin token'])
            ->assertUnauthorized();
    }

    public function test_put_conserva_campos_opcionales_omitidos(): void
    {
        $padre = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Padre']);
        $imagen = MultimediaModelo::factory()->create();
        $categoria = CategoriaModelo::factory()->subcategoria($padre)->conImagen($imagen)->create([
            'nombre' => 'Original',
            'descripcion' => 'Se conserva',
            'activo' => false,
        ]);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson("/api/v1/admin/categorias/{$categoria->id}", ['nombre' => 'Actualizada'])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Actualizada')
            ->assertJsonPath('data.categoria_padre_id', $padre->id)
            ->assertJsonPath('data.imagen_id', $imagen->id)
            ->assertJsonPath('data.activo', false);

        $this->assertDatabaseHas('categorias', [
            'id' => $categoria->id,
            'descripcion' => 'Se conserva',
            'categoria_padre_id' => $padre->id,
            'imagen_id' => $imagen->id,
            'activo' => false,
        ]);
    }

    public function test_put_con_null_limpia_campos_anulables(): void
    {
        $padre = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Padre']);
        $imagen = MultimediaModelo::factory()->create();
        $categoria = CategoriaModelo::factory()->subcategoria($padre)->conImagen($imagen)->create([
            'nombre' => 'Original',
            'descripcion' => 'Descripcion',
        ]);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson("/api/v1/admin/categorias/{$categoria->id}", [
                'nombre' => 'Nueva raiz',
                'categoria_padre_id' => null,
                'descripcion' => null,
                'imagen_id' => null,
            ])
            ->assertOk()
            ->assertJsonPath('data.categoria_padre_id', null)
            ->assertJsonPath('data.imagen_id', null);

        $this->assertDatabaseHas('categorias', [
            'id' => $categoria->id,
            'categoria_padre_id' => null,
            'descripcion' => null,
            'imagen_id' => null,
        ]);
    }

    public function test_put_rechaza_ciclo_con_descendiente(): void
    {
        $raiz = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Raiz']);
        $hija = CategoriaModelo::factory()->subcategoria($raiz)->create(['nombre' => 'Hija']);
        $nieta = CategoriaModelo::factory()->subcategoria($hija)->create(['nombre' => 'Nieta']);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson("/api/v1/admin/categorias/{$raiz->id}", [
                'nombre' => 'Raiz',
                'categoria_padre_id' => $nieta->id,
            ])
            ->assertUnprocessable()
            ->assertJsonPath('codigo_error', 'CAT_PADRE_INVALIDO');

        $this->assertDatabaseHas('categorias', [
            'id' => $raiz->id,
            'categoria_padre_id' => null,
        ]);
    }

    public function test_put_rechaza_categoria_como_su_propio_padre(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Raiz']);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson("/api/v1/admin/categorias/{$categoria->id}", [
                'nombre' => 'Raiz',
                'categoria_padre_id' => $categoria->id,
            ])
            ->assertUnprocessable()
            ->assertJsonPath('codigo_error', 'CAT_PADRE_INVALIDO');
    }

    public function test_delete_con_productos_activos_retorna_400_y_no_desactiva(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Reposteria']);
        DB::table('productos')->insert([
            'categoria_id' => $categoria->id,
            'nombre' => 'Torta activa',
            'precio_base' => 20,
            'activo' => true,
        ]);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/v1/admin/categorias/{$categoria->id}")
            ->assertStatus(400)
            ->assertJsonPath('codigo_error', 'CAT_CON_PRODUCTOS');

        $this->assertDatabaseHas('categorias', [
            'id' => $categoria->id,
            'activo' => true,
        ]);
    }

    public function test_delete_sin_productos_desactiva_sin_borrar(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create(['nombre' => 'Detalles']);
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/v1/admin/categorias/{$categoria->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Categoria desactivada.');

        $this->assertDatabaseCount('categorias', 1);
        $this->assertDatabaseHas('categorias', [
            'id' => $categoria->id,
            'activo' => false,
        ]);
    }

    public function test_put_categoria_inexistente_retorna_404(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson('/api/v1/admin/categorias/999999', ['nombre' => 'No existe'])
            ->assertNotFound()
            ->assertJsonPath('codigo_error', 'CAT_NO_ENCONTRADA');
    }
}
