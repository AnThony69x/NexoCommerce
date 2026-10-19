<?php

declare(strict_types=1);

namespace Tests\Integracion;

use Tests\TestCase;

class VerificarBaseDatosTest extends TestCase
{
    public function test_reconoce_una_base_con_el_esquema_ya_instalado(): void
    {
        $this->artisan('bd:verificar')
            ->expectsOutputToContain('Esquema instalado')
            ->assertExitCode(0);
    }

    public function test_servidor_inaccesible_falla_con_mensaje_claro(): void
    {
        config(['database.connections.inaccesible' => array_merge(config('database.connections.pgsql'), ['port' => 1])]);

        $this->artisan('bd:verificar', ['--connection' => 'inaccesible'])
            ->expectsOutputToContain('No hay conexion a')
            ->assertExitCode(1);
    }
}
