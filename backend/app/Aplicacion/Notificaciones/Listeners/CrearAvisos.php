<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Listeners;

use App\Dominio\Notificaciones\Eventos\EstadoPedidoCambiado;
use App\Dominio\Notificaciones\Eventos\PagoRegistrado;
use App\Dominio\Notificaciones\Eventos\PagoVerificado;
use App\Dominio\Notificaciones\Eventos\PedidoCreado;
use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;

final readonly class CrearAvisos
{
    public function __construct(private NotificacionRepositorioInterface $repositorio) {}

    public function pedidoCreado(PedidoCreado $evento): void
    {
        $titulo = 'Pedido creado';
        $mensaje = "El pedido {$evento->pedidoId} fue creado.";
        $this->repositorio->guardar($evento->usuarioId, $evento->pedidoId, null, 'PEDIDO_CREADO', $titulo, $mensaje);
        foreach ($this->repositorio->administradoresActivos() as $adminId) {
            $this->repositorio->guardar($adminId, $evento->pedidoId, null, 'PEDIDO_CREADO', 'Nuevo pedido', $mensaje);
        }
    }

    public function pagoRegistrado(PagoRegistrado $evento): void
    {
        foreach ($this->repositorio->administradoresActivos() as $adminId) {
            $this->repositorio->guardar(
                $adminId, $evento->pedidoId, $evento->pagoId, 'PAGO_REGISTRADO',
                'Pago pendiente', "Se registro un pago pendiente para el pedido {$evento->pedidoId}.",
            );
        }
    }

    public function pagoVerificado(PagoVerificado $evento): void
    {
        $aprobado = $evento->estado === 'APROBADO';
        $this->repositorio->guardar(
            $evento->usuarioId, $evento->pedidoId, $evento->pagoId,
            $aprobado ? 'PAGO_APROBADO' : 'PAGO_RECHAZADO',
            $aprobado ? 'Pago verificado' : 'Pago rechazado',
            "Tu pago del pedido {$evento->pedidoId} fue ".($aprobado ? 'aprobado.' : 'rechazado.'),
        );
    }

    public function estadoPedidoCambiado(EstadoPedidoCambiado $evento): void
    {
        $titulos = [
            'EN_PREPARACION' => 'Pedido en preparacion',
            'LISTO' => 'Pedido listo',
            'ENTREGADO' => 'Pedido entregado',
        ];
        $this->repositorio->guardar(
            $evento->usuarioId, $evento->pedidoId, null, 'PEDIDO_'.$evento->estado,
            $titulos[$evento->estado], "Tu pedido {$evento->pedidoId} ahora esta {$evento->estado}.",
        );
    }
}
