<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\DTOs;

use App\Dominio\Autenticacion\Entidades\Usuario;

/** DTO de salida para los endpoints que responden con usuario + token. */
final readonly class SesionIniciadaDTO
{
    public function __construct(
        public Usuario $usuario,
        public string $token,
    ) {}
}
