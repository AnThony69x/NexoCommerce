<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Listeners;

use App\Aplicacion\Notificaciones\Enrutamiento\ProcesarMensajePedido;
use App\Dominio\Notificaciones\Eventos\EstadoPedidoCambiado;
use Illuminate\Http\Request;
use Psr\Log\LoggerInterface;

final readonly class DistribuirAvisoEstadoPedido
{
    public function __construct(
        private ProcesarMensajePedido $procesador,
        private LoggerInterface $logger,
        private Request $solicitud,
    ) {}

    public function handle(EstadoPedidoCambiado $evento): void
    {
        $mensaje = $evento->mensaje();
        $correlacion = $this->solicitud->header('X-Request-Id');
        $contexto = ['id' => $mensaje['id'], 'tipo' => $mensaje['tipo']];
        if (is_string($correlacion) && trim($correlacion) !== '' && strlen($correlacion) <= 100) {
            $contexto['correlacion_id'] = $mensaje['correlacion_id'] = $correlacion;
        }

        $resultado = $this->procesador->ejecutar($mensaje);
        $this->logger->log(
            $resultado['resultado'] === 'procesado' ? 'info' : 'warning',
            'notificaciones.estado_pedido',
            [...$contexto, ...$resultado],
        );
    }
}
