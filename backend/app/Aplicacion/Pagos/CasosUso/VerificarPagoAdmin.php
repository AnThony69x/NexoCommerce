<?php

declare(strict_types=1);

namespace App\Aplicacion\Pagos\CasosUso;

use App\Dominio\Pagos\Entidades\Pago;
use App\Dominio\Pagos\Repositorios\PagoRepositorioInterface;

final readonly class VerificarPagoAdmin
{
    public function __construct(private PagoRepositorioInterface $repositorio) {}

    public function execute(int $adminId, int $pagoId, string $estado, ?string $comentario): Pago
    {
        return $this->repositorio->verificar($adminId, $pagoId, $estado, $comentario);
    }
}
