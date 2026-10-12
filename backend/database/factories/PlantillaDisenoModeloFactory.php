<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PlantillaDisenoModelo> */
class PlantillaDisenoModeloFactory extends Factory
{
    protected $model = PlantillaDisenoModelo::class;

    public function definition(): array
    {
        return [
            'sublimacion_id' => SublimacionModelo::factory(),
            'nombre' => fake()->words(2, true),
            'descripcion' => fake()->optional()->sentence(),
            'costo_adicional' => 2,
            'multimedia_id' => null,
            'activo' => true,
        ];
    }
}
