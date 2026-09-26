<?php

declare(strict_types=1);

namespace App\Aplicacion\Pagos\CasosUso;

use App\Dominio\Pagos\Entidades\Pago;
use App\Dominio\Pagos\Repositorios\PagoRepositorioInterface;

final readonly class ConsultarPagoPedido
{
    public function __construct(private PagoRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, bool $admin, int $pedidoId): ?Pago
    {
        return $this->repositorio->consultar($usuarioId, $admin, $pedidoId);
    }
}
