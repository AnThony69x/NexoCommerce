<?php

declare(strict_types=1);

namespace Tests\Integracion\Integracion;

use Database\Seeders\IntegrationDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class IntegrationDemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_crea_cuentas_y_catalogo_repetibles_en_base_aislada(): void
    {
        if (! preg_match('/_(?:demo|test)\z/i', (string) config('database.connections.pgsql.database'))) {
            $this->markTestSkipped('Requiere una base PostgreSQL aislada terminada en _demo o _test.');
        }

        $variables = [
            'INTEGRATION_ADMIN_EMAIL' => 'admin-demo@example.test',
            'INTEGRATION_ADMIN_PASSWORD' => 'DemoAdmin123!',
            'INTEGRATION_CLIENT_EMAIL' => 'cliente-demo@example.test',
            'INTEGRATION_CLIENT_PASSWORD' => 'DemoCliente123!',
        ];
        $anteriores = [];
        foreach ($variables as $nombre => $valor) {
            $anteriores[$nombre] = [$_ENV[$nombre] ?? null, $_SERVER[$nombre] ?? null, getenv($nombre)];
            $_ENV[$nombre] = $valor;
            $_SERVER[$nombre] = $valor;
            putenv($nombre.'='.$valor);
        }

        try {
            $this->seed(IntegrationDemoSeeder::class);
            $this->seed(IntegrationDemoSeeder::class);
            $this->assertDatabaseCount('usuarios', 2);
            $this->assertDatabaseCount('productos', 3);
            $this->assertDatabaseCount('detalles', 1);
            $this->assertDatabaseCount('tortas', 1);
            $this->assertDatabaseCount('sublimaciones', 1);
            $this->assertDatabaseCount('configuracion_produccion', 30);
            $this->postJson('/api/v1/auth/login', ['correo' => $variables['INTEGRATION_CLIENT_EMAIL'], 'password' => $variables['INTEGRATION_CLIENT_PASSWORD']])
                ->assertOk()->assertJsonPath('data.usuario.rol', 'CLIENTE');
            $this->postJson('/api/v1/auth/login', ['correo' => $variables['INTEGRATION_ADMIN_EMAIL'], 'password' => $variables['INTEGRATION_ADMIN_PASSWORD']])
                ->assertOk()->assertJsonPath('data.usuario.rol', 'ADMIN');
            $this->getJson('/api/v1/productos')->assertOk()->assertJsonPath('meta.total', 3);
        } finally {
            foreach ($anteriores as $nombre => [$env, $server, $getenv]) {
                if ($env === null) {
                    unset($_ENV[$nombre]);
                } else {
                    $_ENV[$nombre] = $env;
                }
                if ($server === null) {
                    unset($_SERVER[$nombre]);
                } else {
                    $_SERVER[$nombre] = $server;
                }
                if ($getenv === false) {
                    putenv($nombre);
                } else {
                    putenv($nombre.'='.$getenv);
                }
            }
        }
    }

    public function test_rechaza_base_sin_sufijo_demo_o_test(): void
    {
        $conexion = DB::connection();
        $nombreOriginal = $conexion->getDatabaseName();
        $conexion->setDatabaseName('postgres');

        try {
            $this->expectException(RuntimeException::class);
            (new IntegrationDemoSeeder)->run();
        } finally {
            $conexion->setDatabaseName($nombreOriginal);
        }
    }
}
