<?php

declare(strict_types=1);

namespace App\Dominio\Pagos\Repositorios;

use App\Dominio\Pagos\Entidades\Pago;

interface PagoRepositorioInterface
{
    public function registrar(int $usuarioId, int $pedidoId, string $metodo, string $monto, ?string $referenciaPasarela, ?int $multimediaId): Pago;

    public function consultar(int $usuarioId, bool $admin, int $pedidoId): ?Pago;

    public function verificar(int $adminId, int $pagoId, string $estado, ?string $comentario): Pago;
}
