<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\PublicacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PublicacionModelo> */
class PublicacionModeloFactory extends Factory
{
    protected $model = PublicacionModelo::class;

    public function definition(): array
    {
        return [
            'usuario_id' => UsuarioModelo::factory()->admin(),
            'categoria_id' => null,
            'producto_id' => null,
            'titulo' => fake()->sentence(4),
            'descripcion' => fake()->optional()->paragraph(),
            'activo' => true,
        ];
    }

    public function inactiva(): static
    {
        return $this->state(['activo' => false]);
    }
}
