<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Enrutamiento;

use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;

final readonly class AvisarEntrega
{
    public function __construct(private NotificacionRepositorioInterface $repositorio) {}

    public function procesar(string $tipo, int $pedidoId, int $usuarioId): string
    {
        $listo = $tipo === 'PEDIDO_LISTO';
        $titulo = $listo ? 'Pedido listo' : 'Pedido entregado';
        $estado = $listo ? 'LISTO' : 'ENTREGADO';
        $this->repositorio->guardar(
            $usuarioId, $pedidoId, null, $tipo, $titulo,
            "Tu pedido {$pedidoId} ahora esta {$estado}.",
        );

        return 'entrega';
    }
}
