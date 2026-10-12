<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionTiendaModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConfiguracionTiendaModelo>
 */
class ConfiguracionTiendaModeloFactory extends Factory
{
    protected $model = ConfiguracionTiendaModelo::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre_tienda' => 'Dulces Aesca',
            'logo_url' => null,
            'favicon_url' => null,
            'color_primario' => '#8B5CF6',
            'color_secundario' => '#EC4899',
            'color_acento' => '#F59E0B',
            'color_fondo' => '#FFF7ED',
            'color_texto' => '#1F2937',
            'telefono' => null,
            'correo' => null,
            'direccion' => null,
            'activo' => true,
        ];
    }

    public function inactiva(): static
    {
        return $this->state(['activo' => false]);
    }
}
