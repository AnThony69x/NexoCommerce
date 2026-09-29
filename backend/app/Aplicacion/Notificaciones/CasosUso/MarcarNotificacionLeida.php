<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\CasosUso;

use App\Dominio\Notificaciones\Entidades\Notificacion;
use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;

final readonly class MarcarNotificacionLeida
{
    public function __construct(private NotificacionRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, int $id): Notificacion
    {
        return $this->repositorio->marcarLeida($usuarioId, $id);
    }
}
