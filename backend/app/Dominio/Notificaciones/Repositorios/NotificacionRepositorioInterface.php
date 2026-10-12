<?php

declare(strict_types=1);

namespace App\Dominio\Notificaciones\Repositorios;

use App\Dominio\Notificaciones\Entidades\Notificacion;

interface NotificacionRepositorioInterface
{
    public function guardar(int $usuarioId, ?int $pedidoId, ?int $pagoId, string $tipo, string $titulo, string $mensaje): void;

    /** @return list<int> */
    public function administradoresActivos(): array;

    /** @return array<string, mixed> */
    public function listar(int $usuarioId, ?bool $leida, int $pagina): array;

    public function marcarLeida(int $usuarioId, int $id): Notificacion;

    public function marcarTodasLeidas(int $usuarioId): int;
}
