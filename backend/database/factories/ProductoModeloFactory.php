<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProductoModelo> */
class ProductoModeloFactory extends Factory
{
    protected $model = ProductoModelo::class;

    public function definition(): array
    {
        return [
            'categoria_id' => CategoriaModelo::factory(),
            'nombre' => fake()->words(3, true),
            'descripcion' => fake()->optional()->sentence(),
            'precio_base' => fake()->randomFloat(2, 1, 100),
            'activo' => true,
        ];
    }

    public function inactivo(): static
    {
        return $this->state(['activo' => false]);
    }
}
