<?php

declare(strict_types=1);

namespace App\Dominio\Notificaciones\Entidades;

use DateTimeImmutable;

final readonly class Notificacion
{
    public function __construct(
        public int $id,
        public int $usuarioId,
        public ?int $pedidoId,
        public ?int $pagoId,
        public string $tipo,
        public string $titulo,
        public string $mensaje,
        public bool $leida,
        public ?DateTimeImmutable $fechaLectura,
        public DateTimeImmutable $creadoEn,
    ) {}
}
