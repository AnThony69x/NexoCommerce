<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Entidades;

final readonly class ImagenProducto
{
    public function __construct(
        public int $id,
        public string $ruta_archivo,
        public int $orden,
        public bool $es_principal,
    ) {}
}
