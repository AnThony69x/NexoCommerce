<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infraestructura\Persistencia\Eloquent\Modelos\RolModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UsuarioModelo>
 */
class UsuarioModeloFactory extends Factory
{
    protected $model = UsuarioModelo::class;

    public function definition(): array
    {
        return [
            'rol_id' => fn () => RolModelo::where('nombre', 'CLIENTE')->value('id') ?? 2,
            'nombre_completo' => fake()->name(),
            'correo' => fake()->unique()->safeEmail(),
            'telefono' => fake()->optional()->numerify('09########'),
            'password_hash' => password_hash('Password123*', PASSWORD_BCRYPT),
            'correo_verificado' => false,
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
            'terminos_aceptados' => true,
            'version_terminos' => '1.0',
            'terminos_aceptados_en' => now(),
            'activo' => true,
        ];
    }

    /** Estado: usuario con correo verificado. */
    public function verificado(): static
    {
        return $this->state(['correo_verificado' => true]);
    }

    /** Estado: usuario con rol ADMIN. */
    public function admin(): static
    {
        return $this->state(fn () => [
            'rol_id' => RolModelo::where('nombre', 'ADMIN')->value('id') ?? 1,
            'correo_verificado' => true,
        ]);
    }

    /** Estado: usuario solo OAuth (sin password local). */
    public function soloOAuth(): static
    {
        return $this->state([
            'password_hash' => null,
            'correo_verificado' => true,
        ]);
    }

    /** Estado: usuario desactivado. */
    public function inactivo(): static
    {
        return $this->state(['activo' => false]);
    }

    /** Estado: cuenta bloqueada por intentos fallidos. */
    public function bloqueado(): static
    {
        return $this->state([
            'intentos_fallidos' => 5,
            'bloqueado_hasta' => now()->addMinutes(15),
        ]);
    }
}
