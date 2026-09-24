<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionProduccionModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ConfiguracionProduccionModelo> */
class ConfiguracionProduccionModeloFactory extends Factory
{
    protected $model = ConfiguracionProduccionModelo::class;

    public function definition(): array
    {
        return [
            'fecha' => fake()->dateTimeBetween('+1 day', '+1 month')->format('Y-m-d'),
            'categoria_id' => null,
            'capacidad_maxima' => fake()->numberBetween(1, 50),
            'activo' => true,
        ];
    }

    public function inactiva(): static
    {
        return $this->state(['activo' => false]);
    }
}
