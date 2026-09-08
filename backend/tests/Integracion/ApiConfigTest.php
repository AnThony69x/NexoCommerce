<?php

namespace Tests\Integracion;

use Tests\TestCase;

class ApiConfigTest extends TestCase
{
    /**
     * Valida que la ruta raiz devuelva respuesta JSON estructurada y no vista HTML.
     */
    public function test_ruta_raiz_retorna_json_de_diagnostico(): void
    {
        $response = $this->getJson('/');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'servicio' => 'NexoCommerce REST API',
                'version' => 'v1',
                'estado' => 'operativo',
            ]);
    }

    /**
     * Valida que el endpoint de salud de la API v1 funcione correctamente.
     */
    public function test_endpoint_salud_v1_retorna_json(): void
    {
        $response = $this->getJson('/api/v1/salud');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'api' => 'NexoCommerce v1',
                'estado' => 'activo',
            ]);
    }

    /**
     * Valida que una ruta inexistente devuelva el envelope JSON estandar 404.
     */
    public function test_ruta_inexistente_retorna_envelope_json_404(): void
    {
        $response = $this->getJson('/api/v1/ruta-completamente-falsa');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'codigo_error' => 'NOT_FOUND',
            ]);
    }
}
