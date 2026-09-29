<?php

namespace Tests\Integracion;

use Tests\TestCase;

class ApiConfigTest extends TestCase
{
    public function test_ruta_raiz_retorna_json_de_diagnostico(): void
    {
        $response = $this->getJson('/');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'servicio' => 'NexoCommerce REST API',
                'version' => 'v1',
                'estado' => 'operativo',
            ]);
    }

    public function test_ruta_raiz_sin_cabecera_accept_retorna_json_y_no_html(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'servicio' => 'NexoCommerce REST API',
            ]);

        $this->assertStringContainsString('application/json', (string) $response->headers->get('content-type'));
        $this->assertStringNotContainsString('<html', $response->getContent());
    }

    public function test_endpoint_salud_v1_retorna_json(): void
    {
        $response = $this->getJson('/api/v1/salud');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'api' => 'NexoCommerce v1',
                'estado' => 'activo',
            ]);
    }

    public function test_healthcheck_up_retorna_json(): void
    {
        $response = $this->get('/up');

        $response->assertOk()
            ->assertJson([
                'status' => 'up',
            ]);
    }

    public function test_ruta_inexistente_retorna_envelope_json_404(): void
    {
        $response = $this->getJson('/api/v1/ruta-completamente-falsa');

        $response->assertNotFound()
            ->assertJson([
                'success' => false,
                'codigo_error' => 'NOT_FOUND',
            ]);
    }

    public function test_ruta_csrf_cookie_de_sanctum_no_esta_expuesta(): void
    {
        $response = $this->getJson('/sanctum/csrf-cookie');

        $response->assertNotFound()
            ->assertJson([
                'success' => false,
                'codigo_error' => 'NOT_FOUND',
            ]);
    }

    public function test_cors_acepta_origen_web_configurado(): void
    {
        config(['cors.allowed_origins' => ['http://localhost:5173']]);
        $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'GET',
            'Access-Control-Request-Headers' => 'Authorization',
        ])->options('/api/v1/productos')->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

    }

    public function test_cors_no_habilita_origen_web_ajeno(): void
    {
        config(['cors.allowed_origins' => ['http://localhost:5173']]);
        $this->withHeaders([
            'Origin' => 'http://sitio-ajeno.test',
            'Access-Control-Request-Method' => 'GET',
            'Access-Control-Request-Headers' => 'Authorization',
        ])->options('/api/v1/productos')->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
