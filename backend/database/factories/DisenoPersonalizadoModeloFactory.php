<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DisenoPersonalizadoModelo> */
class DisenoPersonalizadoModeloFactory extends Factory
{
    protected $model = DisenoPersonalizadoModelo::class;

    public function definition(): array
    {
        return [
            'usuario_id' => UsuarioModelo::factory(),
            'sublimacion_id' => SublimacionModelo::factory(),
            'multimedia_id' => MultimediaModelo::factory(),
            'indicaciones' => fake()->optional()->sentence(),
        ];
    }
}
