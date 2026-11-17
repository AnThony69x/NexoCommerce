<?php

declare(strict_types=1);

namespace Tests\Integracion\Autenticacion;

use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class RegistroMayusculasTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_correo_repetido_con_otras_mayusculas_responde_422(): void
    {
        $datos = [
            'nombre_completo' => 'Usuario Mayusculas', 'password' => 'Clave12345', 'password_confirmation' => 'Clave12345',
            'terminos_aceptados' => true, 'version_terminos' => '1.0',
        ];

        $this->postJson('/api/v1/auth/registro', $datos + ['correo' => 'Caso.Mayus@Example.com'])->assertCreated();

        $this->postJson('/api/v1/auth/registro', $datos + ['correo' => 'caso.mayus@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors(['correo']);
        $this->postJson('/api/v1/auth/registro', $datos + ['correo' => 'CASO.MAYUS@EXAMPLE.COM'])
            ->assertUnprocessable()->assertJsonValidationErrors(['correo']);
    }
}
