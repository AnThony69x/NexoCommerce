<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\CasosUso;

use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;

final readonly class ListarNotificaciones
{
    public function __construct(private NotificacionRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, ?bool $leida, int $pagina): array
    {
        return $this->repositorio->listar($usuarioId, $leida, $pagina);
    }
}
