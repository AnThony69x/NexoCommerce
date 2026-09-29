<?php

declare(strict_types=1);

namespace App\Dominio\Publicaciones\Entidades;

final readonly class ImagenPublicacion
{
    public function __construct(
        public int $id,
        public string $ruta_archivo,
        public int $orden,
    ) {}
}
