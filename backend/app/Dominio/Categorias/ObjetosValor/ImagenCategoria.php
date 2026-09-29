<?php

declare(strict_types=1);

namespace App\Dominio\Categorias\ObjetosValor;

final readonly class ImagenCategoria
{
    public function __construct(
        public int $id,
        public string $ruta_archivo,
    ) {}
}
