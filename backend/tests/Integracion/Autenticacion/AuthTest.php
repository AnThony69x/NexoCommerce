<?php

declare(strict_types=1);

namespace Tests\Integracion\Autenticacion;

use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\VerificacionCorreoModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pruebas de integracion HTTP para /api/v1/auth (Modulo 01).
 *
 * Cubre los criterios de aceptacion de la spec 01-autenticacion.spec.md
 * contra PostgreSQL real (Supabase dev).
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    // -------------------------------------------------------------------------
    // TC-01: Registro valido
    // -------------------------------------------------------------------------

    /** TC-01: Registro valido → 201, usuario CLIENTE, verificaciones_correo en DB. */
    public function test_registro_valido_retorna_201_con_token_y_usuario_cliente(): void
    {
        $payload = [
            'nombre_completo' => 'Juan Perez',
            'correo' => 'juan@example.com',
            'password' => 'Password123*',
            'password_confirmation' => 'Password123*',
            'terminos_aceptados' => true,
            'version_terminos' => '1.0',
        ];

        $response = $this->postJson('/api/v1/auth/registro', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'usuario' => ['id', 'nombre_completo', 'correo', 'rol', 'correo_verificado', 'activo'],
                    'token',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.usuario.rol', 'CLIENTE')
            ->assertJsonPath('data.usuario.correo_verificado', false)
            ->assertJsonPath('data.usuario.activo', true);

        $this->assertDatabaseHas('usuarios', [
            'correo' => 'juan@example.com',
        ]);

        $usuario = UsuarioModelo::where('correo', 'juan@example.com')->first();
        $this->assertNotNull($usuario);
        $this->assertDatabaseHas('verificaciones_correo', ['usuario_id' => $usuario->id]);
        $this->assertNotEmpty($response->json('data.token'));
    }

    // -------------------------------------------------------------------------
    // TC-02: Correo duplicado
    // -------------------------------------------------------------------------

    /** TC-02: Correo duplicado en registro → 422 con error en campo correo. */
    public function test_registro_correo_duplicado_retorna_422(): void
    {
        UsuarioModelo::factory()->create(['correo' => 'duplicado@example.com']);

        $response = $this->postJson('/api/v1/auth/registro', [
            'nombre_completo' => 'Otro Usuario',
            'correo' => 'duplicado@example.com',
            'password' => 'Password123*',
            'password_confirmation' => 'Password123*',
            'terminos_aceptados' => true,
            'version_terminos' => '1.0',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['correo']]);
    }

    // -------------------------------------------------------------------------
    // TC-03 / TC-04: Bloqueo por intentos fallidos
    // -------------------------------------------------------------------------

    /** TC-03: Password incorrecto → 401 AUTH_CREDENCIALES_INVALIDAS. */
    public function test_login_con_password_incorrecto_retorna_401(): void
    {
        UsuarioModelo::factory()->verificado()->create(['correo' => 'juan@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'correo' => 'juan@example.com',
            'password' => 'WrongPass',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('codigo_error', 'AUTH_CREDENCIALES_INVALIDAS');
    }

    /** TC-04a: 5 fallos consecutivos bloquean la cuenta (bloqueado_hasta se setea). */
    public function test_cinco_fallos_consecutivos_bloquean_cuenta(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create([
            'correo' => 'blocked@example.com',
            'password_hash' => password_hash('Password123*', PASSWORD_BCRYPT),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'correo' => 'blocked@example.com',
                'password' => 'WrongPass',
            ]);
        }

        $this->assertDatabaseMissing('usuarios', [
            'id' => $usuario->id,
            'bloqueado_hasta' => null,
        ]);
    }

    /** TC-04b: Login en cuenta bloqueada → 429 AUTH_CUENTA_BLOQUEADA. */
    public function test_login_en_cuenta_bloqueada_retorna_429(): void
    {
        UsuarioModelo::factory()->bloqueado()->create(['correo' => 'locked@example.com']);

        $response = $this->postJson('/api/v1/auth/login', [
            'correo' => 'locked@example.com',
            'password' => 'CualquierCosa',
        ]);

        $response->assertStatus(429)
            ->assertJsonPath('success', false)
            ->assertJsonPath('codigo_error', 'AUTH_CUENTA_BLOQUEADA');
    }

    // -------------------------------------------------------------------------
    // TC-05: Logout sin token
    // -------------------------------------------------------------------------

    /** TC-05: POST /auth/logout sin token Bearer → 401. */
    public function test_logout_sin_token_retorna_401(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401);
    }

    /** Logout con token valido revoca el token → 200. */
    public function test_logout_con_token_valido_revoca_y_retorna_200(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create();
        $token = $usuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    // -------------------------------------------------------------------------
    // TC-06: OAuth proveedor invalido
    // -------------------------------------------------------------------------

    /** TC-06: OAuth con proveedor invalido → 422. */
    public function test_oauth_proveedor_invalido_retorna_422(): void
    {
        $response = $this->postJson('/api/v1/auth/oauth', [
            'proveedor' => 'TWITTER',
            'id_proveedor' => '12345',
            'nombre_completo' => 'Juan',
            'correo' => 'juan@example.com',
            'terminos_aceptados' => true,
            'version_terminos' => '1.0',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['proveedor']]);
    }

    // -------------------------------------------------------------------------
    // Perfil autenticado
    // -------------------------------------------------------------------------

    /** GET /auth/perfil devuelve los datos del usuario autenticado. */
    public function test_perfil_autenticado_retorna_datos_usuario(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create();
        $token = $usuario->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/auth/perfil');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'id', 'nombre_completo', 'correo', 'rol',
                    'correo_verificado', 'activo', 'creado_en',
                    'terminos_aceptados', 'version_terminos',
                ],
            ]);
    }

    // -------------------------------------------------------------------------
    // Verificar correo
    // -------------------------------------------------------------------------

    /** Verificar correo con codigo valido → 200. */
    public function test_verificar_correo_con_codigo_valido_retorna_200(): void
    {
        $usuario = UsuarioModelo::factory()->create(['correo_verificado' => false]);
        $token = $usuario->createToken('test')->plainTextToken;

        VerificacionCorreoModelo::create([
            'usuario_id' => $usuario->id,
            'codigo' => '654321',
            'expira_en' => now()->addHours(24)->format('Y-m-d H:i:s'),
        ]);

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/verificar-correo', ['codigo' => '654321']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('usuarios', [
            'id' => $usuario->id,
            'correo_verificado' => true,
        ]);
    }

    /** Verificar correo con codigo incorrecto → 400 AUTH_CODIGO_INVALIDO. */
    public function test_verificar_correo_con_codigo_invalido_retorna_400(): void
    {
        $usuario = UsuarioModelo::factory()->create(['correo_verificado' => false]);
        $token = $usuario->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/verificar-correo', ['codigo' => '000000']);

        $response->assertStatus(400)
            ->assertJsonPath('codigo_error', 'AUTH_CODIGO_INVALIDO');
    }
}
