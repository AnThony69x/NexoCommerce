<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\CasosUso;

use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;
use DateTimeImmutable;

/**
 * Inserta un nuevo registro en verificaciones_correo para el usuario autenticado.
 * No invalida codigos anteriores (pueden expirar solos).
 */
final class ReenviarVerificacion
{
    public function __construct(
        private readonly VerificacionCorreoRepositorioInterface $verificacionRepo,
    ) {}

    public function execute(int $usuario_id): void
    {
        $codigo = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiraEn = new DateTimeImmutable('+24 hours');

        $this->verificacionRepo->crear($usuario_id, $codigo, $expiraEn);
    }
}
