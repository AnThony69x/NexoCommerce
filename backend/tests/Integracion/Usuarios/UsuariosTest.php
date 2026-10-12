<?php

declare(strict_types=1);

namespace Tests\Integracion\Usuarios;

use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pruebas de integracion HTTP para /api/v1/usuarios y /api/v1/admin/usuarios (Modulo 02).
 *
 * Cubre los criterios de aceptacion de la spec 02-usuarios.spec.md.
 */
class UsuariosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    // -------------------------------------------------------------------------
    // TC-07: CLIENTE en ruta admin → 403
    // -------------------------------------------------------------------------

    /** TC-07: CLIENTE en GET /admin/usuarios → 403 AUTH_FORBIDDEN. */
    public function test_cliente_en_ruta_admin_retorna_403(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $token = $cliente->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/admin/usuarios')
            ->assertStatus(403)
            ->assertJsonPath('success', false)
            ->assertJsonPath('codigo_error', 'AUTH_FORBIDDEN');
    }

    /** ADMIN puede listar usuarios con paginacion. */
    public function test_admin_lista_usuarios_con_paginacion(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        UsuarioModelo::factory()->count(3)->create();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/admin/usuarios');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data',
                'meta' => ['pagina_actual', 'por_pagina', 'total', 'total_paginas'],
            ]);
    }

    /** ADMIN puede filtrar por rol. */
    public function test_admin_filtra_usuarios_por_rol(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        UsuarioModelo::factory()->count(2)->create();
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/admin/usuarios?rol=CLIENTE');

        $response->assertStatus(200);
        foreach ($response->json('data') as $u) {
            $this->assertSame('CLIENTE', $u['rol']);
        }
    }

    // -------------------------------------------------------------------------
    // TC-08: Cambiar password con actual incorrecta → 400
    // -------------------------------------------------------------------------

    /** TC-08: PUT /usuarios/cambiar-password con password actual incorrecta → 400. */
    public function test_cambiar_password_con_actual_incorrecta_retorna_400(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create([
            'password_hash' => password_hash('Password123*', PASSWORD_BCRYPT),
        ]);
        $token = $usuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson('/api/v1/usuarios/cambiar-password', [
                'password_actual' => 'WrongPass999',
                'password_nueva' => 'NuevoPass456*',
                'password_nueva_confirmation' => 'NuevoPass456*',
            ])
            ->assertStatus(400)
            ->assertJsonPath('codigo_error', 'AUTH_PASSWORD_ACTUAL_INCORRECTO');
    }

    /** TC-08b: Cambiar password con actual correcta → 200. */
    public function test_cambiar_password_con_actual_correcta_retorna_200(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create([
            'password_hash' => password_hash('Password123*', PASSWORD_BCRYPT),
        ]);
        $token = $usuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson('/api/v1/usuarios/cambiar-password', [
                'password_actual' => 'Password123*',
                'password_nueva' => 'NuevoPass456*',
                'password_nueva_confirmation' => 'NuevoPass456*',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $actualizado = UsuarioModelo::find($usuario->id);
        $this->assertTrue(password_verify('NuevoPass456*', $actualizado->password_hash));
    }

    // -------------------------------------------------------------------------
    // TC-09: No dejar sistema sin ADMIN activo → 400
    // -------------------------------------------------------------------------

    /** TC-09: Desactivar unico ADMIN activo → 400 USR_ULTIMO_ADMIN. */
    public function test_desactivar_unico_admin_retorna_400(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/v1/admin/usuarios/{$admin->id}", ['activo' => false])
            ->assertStatus(400)
            ->assertJsonPath('codigo_error', 'USR_ULTIMO_ADMIN');
    }

    /** TC-09b: Con dos ADMINs, se puede desactivar uno. */
    public function test_con_dos_admins_puede_desactivar_uno(): void
    {
        $admin1 = UsuarioModelo::factory()->admin()->create();
        $admin2 = UsuarioModelo::factory()->admin()->create();
        $token = $admin1->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/v1/admin/usuarios/{$admin2->id}", ['activo' => false])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('usuarios', ['id' => $admin2->id, 'activo' => false]);
    }

    // -------------------------------------------------------------------------
    // Actualizar perfil propio
    // -------------------------------------------------------------------------

    /** TC-02 spec 02: PUT perfil persiste nombre_completo y telefono. */
    public function test_actualizar_perfil_persiste_nombre_y_telefono(): void
    {
        $usuario = UsuarioModelo::factory()->verificado()->create();
        $token = $usuario->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson('/api/v1/usuarios/perfil', [
                'nombre_completo' => 'Nombre Actualizado',
                'telefono' => '0991234567',
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nombre_completo', 'Nombre Actualizado');

        $this->assertDatabaseHas('usuarios', [
            'id' => $usuario->id,
            'nombre_completo' => 'Nombre Actualizado',
            'telefono' => '0991234567',
        ]);
    }

    /** Ruta sin token retorna 401. */
    public function test_ruta_protegida_sin_token_retorna_401(): void
    {
        $this->getJson('/api/v1/admin/usuarios')
            ->assertStatus(401);
    }
}
