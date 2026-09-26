<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\CasosUso;

use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;

final readonly class MarcarTodasLeidas
{
    public function __construct(private NotificacionRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId): int
    {
        return $this->repositorio->marcarTodasLeidas($usuarioId);
    }
}
