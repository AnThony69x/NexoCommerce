<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TortaModelo> */
class TortaModeloFactory extends Factory
{
    protected $model = TortaModelo::class;

    public function definition(): array
    {
        return [
            'producto_id' => ProductoModelo::factory(),
            'tamano' => 'Mediana',
            'porciones' => 12,
            'sabor' => 'Chocolate',
        ];
    }
}
