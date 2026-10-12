<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Entidades;

use DateTimeImmutable;

final readonly class DisenoPersonalizado
{
    public function __construct(
        public int $id,
        public int $usuario_id,
        public int $sublimacion_id,
        public int $multimedia_id,
        public ?string $indicaciones,
        public DateTimeImmutable $creado_en,
        public DateTimeImmutable $actualizado_en,
    ) {}
}
