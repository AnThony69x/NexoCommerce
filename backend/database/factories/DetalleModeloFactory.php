<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DetalleModelo> */
class DetalleModeloFactory extends Factory
{
    protected $model = DetalleModelo::class;

    public function definition(): array
    {
        return ['producto_id' => ProductoModelo::factory(), 'stock' => 10];
    }
}
