<?php

declare(strict_types=1);

namespace Tests\Integracion\Multimedia;

use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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
        $this->assertSame(
            'https://files.example.test/multimedia/'.$ruta,
            $response->json('data.url'),
        );
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
                'destino' => 'productos',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.archivo.0', 'El archivo no puede superar los 5 MB.');

        $this->assertDatabaseCount('multimedia', 0);
        Storage::disk('multimedia')->assertEmpty();
    }

    public function test_pdf_fuera_de_comprobantes_retorna_422(): void
    {
        Storage::fake('multimedia');

        $usuario = UsuarioModelo::factory()->verificado()->create();
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
