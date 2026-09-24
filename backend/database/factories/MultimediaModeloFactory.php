<?php

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MultimediaModelo>
 */
class MultimediaModeloFactory extends Factory
{
    protected $model = MultimediaModelo::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre_archivo' => 'archivo.png',
            'ruta_archivo' => 'productos/20260923_archivo.png',
            'tipo_mime' => 'image/png',
            'tamano_bytes' => 1024,
            'ancho' => 100,
            'alto' => 100,
            'activo' => true,
            'subido_por_id' => null,
        ];
    }

    public function inactivo(): static
    {
        return $this->state(['activo' => false]);
    }

    public function pdf(): static
    {
        return $this->state([
            'nombre_archivo' => 'comprobante.pdf',
            'ruta_archivo' => 'comprobantes/20260923_comprobante.pdf',
            'tipo_mime' => 'application/pdf',
            'ancho' => null,
            'alto' => null,
        ]);
    }
}
