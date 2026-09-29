<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\CasosUso;

use App\Aplicacion\Autenticacion\Contratos\NotificacionServiceInterface;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;
use DateTimeImmutable;

/**
 * Inserta un nuevo registro en verificaciones_correo y envia el codigo al correo del usuario.
 * No invalida codigos anteriores (pueden expirar solos).
 */
final class ReenviarVerificacion
{
    public function __construct(
        private readonly VerificacionCorreoRepositorioInterface $verificacionRepo,
        private readonly NotificacionServiceInterface $notificacion,
    ) {}

    public function execute(Usuario $usuario): void
    {
        $codigo = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiraEn = new DateTimeImmutable('+24 hours');

        $this->verificacionRepo->crear($usuario->id, $codigo, $expiraEn);

        $this->notificacion->enviarCodigoVerificacion(
            correo: $usuario->correo,
            nombre: $usuario->nombre_completo,
            codigo: $codigo,
        );
    }
}
