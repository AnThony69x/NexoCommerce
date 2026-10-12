<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SublimacionModelo> */
class SublimacionModeloFactory extends Factory
{
    protected $model = SublimacionModelo::class;

    public function definition(): array
    {
        return ['producto_id' => ProductoModelo::factory(), 'tipo_material' => 'Ceramica'];
    }
}
