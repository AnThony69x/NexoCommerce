<?php

declare(strict_types=1);

namespace Tests\Integracion\Multimedia;

use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MultimediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_subir_archivo_retorna_201_con_id_url_y_metadatos(): void
    {
        Storage::fake('multimedia');
        config(['app.multimedia_public_base_url' => 'https://files.example.test/multimedia']);

        $usuario = UsuarioModelo::factory()->verificado()->create();
        $token = $usuario->createToken('test')->plainTextToken;
        $archivo = UploadedFile::fake()->create('foto.png', 100, 'image/png');

        $response = $this->withToken($token)->post('/api/v1/multimedia', [
            'archivo' => $archivo,
            'destino' => 'personalizaciones',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'nombre_archivo',
                    'ruta_archivo',
                    'tipo_mime',
                    'tamano_bytes',
                    'ancho',
                    'alto',
                    'activo',
                    'subido_por_id',
                    'url',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Archivo registrado.')
            ->assertJsonPath('data.subido_por_id', $usuario->id)
            ->assertJsonPath('data.tipo_mime', 'image/png');

        $ruta = $response->json('data.ruta_archivo');

        $this->assertIsString($ruta);
        $this->assertStringStartsWith('personalizaciones/', $ruta);
        $this->assertNull($response->json('data.url'));
        $this->assertDatabaseHas('multimedia', [
            'id' => $response->json('data.id'),
            'subido_por_id' => $usuario->id,
            'tamano_bytes' => 102400,
            'tipo_mime' => 'image/png',
        ]);
        Storage::disk('multimedia')->assertExists($ruta);
    }

    public function test_archivo_mayor_a_5_mb_retorna_422(): void
    {
        Storage::fake('multimedia');

        $usuario = UsuarioModelo::factory()->verificado()->create();
        $token = $usuario->createToken('test')->plainTextToken;
        $archivo = UploadedFile::fake()->create('grande.png', 5121, 'image/png');

        $this->withToken($token)
            ->post('/api/v1/multimedia', [
                'archivo' => $archivo,
                'destino' => 'comprobantes',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.archivo.0', 'El archivo no puede superar los 5 MB.');

        $this->assertDatabaseCount('multimedia', 0);
        Storage::disk('multimedia')->assertEmpty();
    }

    public function test_imagen_publica_se_sirve_sin_token_y_rechaza_rutas_privadas_o_inactivas(): void
    {
        Storage::fake('multimedia');
        $imagen = MultimediaModelo::factory()->create(['ruta_archivo' => 'productos/demo.png']);
        Storage::disk('multimedia')->put($imagen->ruta_archivo, 'imagen-demo');
        $inactiva = MultimediaModelo::factory()->inactivo()->create(['ruta_archivo' => 'categorias/inactiva.png']);
        Storage::disk('multimedia')->put($inactiva->ruta_archivo, 'inactiva');
        $falso = MultimediaModelo::factory()->create(['ruta_archivo' => 'productos/falso.png', 'tipo_mime' => 'application/pdf']);
        Storage::disk('multimedia')->put($falso->ruta_archivo, '%PDF-falso');
        $this->get('/api/v1/multimedia/publico/productos/demo.png')->assertOk()
            ->assertHeader('Content-Type', 'image/png')->assertSee('imagen-demo');
        $this->get('/api/v1/multimedia/publico/categorias/inactiva.png')->assertNotFound();
        $this->get('/api/v1/multimedia/publico/productos/falso.png')->assertNotFound();
        $this->get('/api/v1/multimedia/publico/comprobantes/demo.png')->assertNotFound();
        $this->get('/api/v1/multimedia/publico/productos/../demo.png')->assertNotFound();
        Storage::disk('multimedia')->delete($imagen->ruta_archivo);
        $this->get('/api/v1/multimedia/publico/productos/demo.png')->assertNotFound();
    }

    public function test_cliente_no_puede_subir_a_destinos_publicos_y_admin_si(): void
    {
        Storage::fake('multimedia');
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $this->withToken($cliente->createToken('test')->plainTextToken)
            ->post('/api/v1/multimedia', [
                'archivo' => UploadedFile::fake()->create('publica.png', 100, 'image/png'), 'destino' => 'productos',
            ])->assertForbidden();
        $this->assertDatabaseCount('multimedia', 0);

        Auth::forgetGuards();
        $admin = UsuarioModelo::factory()->admin()->create();
        $respuesta = $this->withToken($admin->createToken('test')->plainTextToken)
            ->post('/api/v1/multimedia', [
                'archivo' => UploadedFile::fake()->create('publica.png', 100, 'image/png'), 'destino' => 'productos',
            ])->assertCreated();
        $this->assertStringContainsString('/productos/', (string) $respuesta->json('data.url'));
    }

    public function test_archivo_privado_exige_dueno_o_admin_y_no_expone_url_publica(): void
    {
        Storage::fake('multimedia');
        $dueno = UsuarioModelo::factory()->verificado()->create();
        $otro = UsuarioModelo::factory()->verificado()->create();
        $admin = UsuarioModelo::factory()->admin()->create();
        $archivo = MultimediaModelo::factory()->pdf()->create(['subido_por_id' => $dueno->id]);
        Storage::disk('multimedia')->put($archivo->ruta_archivo, '%PDF-demo');
        $ruta = '/api/v1/multimedia/'.$archivo->id.'/archivo';
        $this->get($ruta)->assertUnauthorized();
        $this->withToken($otro->createToken('test')->plainTextToken);
        $this->get($ruta)->assertForbidden();
        $this->getJson('/api/v1/multimedia/'.$archivo->id)->assertForbidden();
        Auth::forgetGuards();
        $this->withToken($dueno->createToken('test')->plainTextToken);
        $respuesta = $this->get($ruta)->assertOk()->assertHeader('Content-Type', 'application/pdf')->assertSee('%PDF-demo');
        $this->assertStringContainsString('no-store', (string) $respuesta->headers->get('Cache-Control'));
        $this->getJson('/api/v1/multimedia/'.$archivo->id)->assertOk()->assertJsonPath('data.url', null);
        Auth::forgetGuards();
        $this->withToken($admin->createToken('test')->plainTextToken);
        $this->get($ruta)->assertOk();
        Storage::disk('multimedia')->delete($archivo->ruta_archivo);
        $this->get($ruta)->assertNotFound();
        Storage::disk('multimedia')->put($archivo->ruta_archivo, '%PDF-demo');
        $archivo->update(['activo' => false]);
        $this->get($ruta)->assertNotFound();
    }

    public function test_pdf_fuera_de_comprobantes_retorna_422(): void
    {
        Storage::fake('multimedia');

        $usuario = UsuarioModelo::factory()->admin()->create();
        $token = $usuario->createToken('test')->plainTextToken;
        $archivo = UploadedFile::fake()->create('diseno.pdf', 100, 'application/pdf');

        $this->withToken($token)
            ->post('/api/v1/multimedia', [
                'archivo' => $archivo,
                'destino' => 'disenos',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.destino.0', 'Los archivos PDF solo pueden registrarse como comprobantes.');

        $this->assertDatabaseCount('multimedia', 0);
        Storage::disk('multimedia')->assertEmpty();
    }

    public function test_obtener_multimedia_inactiva_retorna_404(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create();
        $multimedia = MultimediaModelo::factory()
            ->inactivo()
            ->create(['subido_por_id' => $usuario->id]);
        $token = $usuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson("/api/v1/multimedia/{$multimedia->id}")
            ->assertNotFound()
            ->assertJsonPath('codigo_error', 'MED_NO_ENCONTRADO');
    }

    public function test_dueno_puede_desactivar_multimedia(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create();
        $multimedia = MultimediaModelo::factory()->create(['subido_por_id' => $usuario->id]);
        $token = $usuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/v1/multimedia/{$multimedia->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('multimedia', [
            'id' => $multimedia->id,
            'activo' => false,
        ]);
    }

    public function test_admin_puede_desactivar_multimedia_de_otro_usuario(): void
    {
        $dueno = UsuarioModelo::factory()->verificado()->create();
        $admin = UsuarioModelo::factory()->admin()->create();
        $multimedia = MultimediaModelo::factory()->create(['subido_por_id' => $dueno->id]);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/v1/multimedia/{$multimedia->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('multimedia', [
            'id' => $multimedia->id,
            'activo' => false,
        ]);
    }

    public function test_usuario_distinto_al_dueno_no_puede_desactivar_multimedia(): void
    {
        $dueno = UsuarioModelo::factory()->verificado()->create();
        $otroUsuario = UsuarioModelo::factory()->verificado()->create();
        $multimedia = MultimediaModelo::factory()->create(['subido_por_id' => $dueno->id]);
        $token = $otroUsuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/v1/multimedia/{$multimedia->id}")
            ->assertForbidden()
            ->assertJsonPath('codigo_error', 'MED_NO_AUTORIZADO');

        $this->assertDatabaseHas('multimedia', [
            'id' => $multimedia->id,
            'activo' => true,
        ]);
    }

    public function test_eliminar_sin_token_retorna_401(): void
    {
        $this->deleteJson('/api/v1/multimedia/1')
            ->assertUnauthorized();
    }
}
