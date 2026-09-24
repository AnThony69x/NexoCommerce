<?php

declare(strict_types=1);

namespace Tests\Integracion\Tienda;

use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionTiendaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\ConfiguracionTiendaSeeder;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConfiguracionTiendaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolesSeeder::class, ConfiguracionTiendaSeeder::class]);
    }

    public function test_get_publico_retorna_seed_de_dulces_aesca(): void
    {
        $this->getJson('/api/v1/tienda/configuracion')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nombre_tienda', 'Dulces Aesca')
            ->assertJsonPath('data.color_primario', '#8B5CF6')
            ->assertJsonPath('data.color_secundario', '#EC4899');
    }

    public function test_get_expone_colores_contacto_y_no_campos_fuera_del_contrato(): void
    {
        ConfiguracionTiendaModelo::query()->update([
            'telefono' => '0991234567',
            'correo' => 'hola@dulcesaesca.com',
            'direccion' => 'Manta, Manabi, Ecuador',
        ]);

        $response = $this->getJson('/api/v1/tienda/configuracion')
            ->assertOk()
            ->assertJsonPath('data.telefono', '0991234567')
            ->assertJsonPath('data.correo', 'hola@dulcesaesca.com')
            ->assertJsonPath('data.direccion', 'Manta, Manabi, Ecuador');

        $data = $response->json('data');
        $this->assertArrayNotHasKey('lema', $data);
        $this->assertArrayNotHasKey('moneda_codigo', $data);
        $this->assertArrayNotHasKey('tipo_negocio', $data);
    }

    public function test_put_sin_token_retorna_401(): void
    {
        $this->putJson('/api/v1/admin/tienda/configuracion', $this->datosActualizacion())
            ->assertUnauthorized();
    }

    public function test_cliente_en_put_retorna_403(): void
    {
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $token = $cliente->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson('/api/v1/admin/tienda/configuracion', $this->datosActualizacion())
            ->assertForbidden()
            ->assertJsonPath('codigo_error', 'AUTH_FORBIDDEN');
    }

    public function test_put_sin_color_primario_retorna_422_y_no_modifica(): void
    {
        $antes = ConfiguracionTiendaModelo::query()->firstOrFail();
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;
        $datos = $this->datosActualizacion();
        unset($datos['color_primario']);

        $this->withToken($token)
            ->putJson('/api/v1/admin/tienda/configuracion', $datos)
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['color_primario']]);

        $this->assertDatabaseHas('configuracion_tienda', [
            'id' => $antes->id,
            'nombre_tienda' => $antes->nombre_tienda,
            'color_primario' => $antes->color_primario,
        ]);
    }

    public function test_admin_actualiza_la_unica_fila_y_conserva_activo_true(): void
    {
        $admin = UsuarioModelo::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->putJson('/api/v1/admin/tienda/configuracion', [
                ...$this->datosActualizacion(),
                'activo' => false,
            ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nombre_tienda', 'Tienda Actualizada')
            ->assertJsonPath('data.activo', true);

        $this->assertDatabaseCount('configuracion_tienda', 1);
        $this->assertDatabaseHas('configuracion_tienda', [
            'nombre_tienda' => 'Tienda Actualizada',
            'color_primario' => '#111111',
            'activo' => true,
        ]);
    }

    public function test_seed_inicial_permanece_correcto(): void
    {
        $this->assertDatabaseHas('configuracion_tienda', [
            'nombre_tienda' => 'Dulces Aesca',
            'color_primario' => '#8B5CF6',
            'color_secundario' => '#EC4899',
            'activo' => true,
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function datosActualizacion(): array
    {
        return [
            'nombre_tienda' => 'Tienda Actualizada',
            'logo_url' => 'tienda/logo.png',
            'favicon_url' => 'tienda/favicon.ico',
            'color_primario' => '#111111',
            'color_secundario' => '#222222',
            'color_acento' => '#333333',
            'color_fondo' => '#FFFFFF',
            'color_texto' => '#000000',
            'telefono' => '0998765432',
            'correo' => 'hola@dulcesaesca.com',
            'direccion' => 'Manta, Manabi, Ecuador',
        ];
    }
}
