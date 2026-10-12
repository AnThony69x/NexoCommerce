<?php

declare(strict_types=1);

namespace App\Aplicacion\Pagos\CasosUso;

use App\Aplicacion\Pagos\DTOs\RegistrarPagoDTO;
use App\Dominio\Pagos\Entidades\Pago;
use App\Dominio\Pagos\Repositorios\PagoRepositorioInterface;

final readonly class RegistrarPago
{
    public function __construct(private PagoRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, RegistrarPagoDTO $datos): Pago
    {
        return $this->repositorio->registrar(
            $usuarioId, $datos->pedido_id, $datos->metodo, $datos->monto,
            $datos->referencia_pasarela, $datos->multimedia_id,
        );
    }
}
