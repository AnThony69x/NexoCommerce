<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DisenoTortaModelo> */
class DisenoTortaModeloFactory extends Factory
{
    protected $model = DisenoTortaModelo::class;

    public function definition(): array
    {
        return [
            'torta_id' => TortaModelo::factory(),
            'nombre' => fake()->words(2, true),
            'descripcion' => fake()->optional()->sentence(),
            'costo_adicional' => 5,
            'multimedia_id' => null,
            'activo' => true,
        ];
    }
}
