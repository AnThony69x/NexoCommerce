<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CategoriaModelo>
 */
class CategoriaModeloFactory extends Factory
{
    protected $model = CategoriaModelo::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'categoria_padre_id' => null,
            'nombre' => fake()->unique()->words(2, true),
            'descripcion' => fake()->optional()->sentence(),
            'imagen_id' => null,
            'activo' => true,
        ];
    }

    public function raiz(): static
    {
        return $this->state(['categoria_padre_id' => null]);
    }

    public function subcategoria(CategoriaModelo|int $padre): static
    {
        $padreId = $padre instanceof CategoriaModelo ? (int) $padre->getKey() : $padre;

        return $this->state(['categoria_padre_id' => $padreId]);
    }

    public function conImagen(MultimediaModelo|int $imagen): static
    {
        $imagenId = $imagen instanceof MultimediaModelo ? (int) $imagen->getKey() : $imagen;

        return $this->state(['imagen_id' => $imagenId]);
    }

    public function inactiva(): static
    {
        return $this->state(['activo' => false]);
    }
}
