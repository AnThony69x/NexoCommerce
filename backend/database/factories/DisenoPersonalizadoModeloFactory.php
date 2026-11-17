<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
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
            'producto_id' => ProductoModelo::factory()->state(['tipo' => 'SUBLIMACION']),
            'tipo_producto' => 'SUBLIMACION',
            'estado_cotizacion' => 'NO_REQUIERE',
            'costo_adicional' => 2,
            'multimedia_id' => MultimediaModelo::factory()->state(['modulo' => 'DISENO_CLIENTE', 'ancho' => 1000, 'alto' => 1000]),
            'indicaciones' => fake()->optional()->sentence(),
        ];
    }
}
