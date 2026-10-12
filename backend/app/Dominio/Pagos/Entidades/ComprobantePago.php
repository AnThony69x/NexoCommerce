<?php

declare(strict_types=1);

namespace App\Dominio\Pagos\Entidades;

use DateTimeImmutable;

final readonly class ComprobantePago
{
    public function __construct(
        public int $id,
        public int $multimedia_id,
        public ?int $revisado_por_id,
        public ?DateTimeImmutable $fecha_revision,
        public ?string $comentario_revision,
    ) {}
}
