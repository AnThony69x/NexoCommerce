<?php

declare(strict_types=1);

namespace App\Aplicacion\Categorias\DTOs;

use App\Dominio\Categorias\Entidades\Categoria;

final readonly class CategoriaArbolDTO
{
    /**
     * @param  list<CategoriaArbolDTO>  $subcategorias
     */
    public function __construct(
        public Categoria $categoria,
        public array $subcategorias,
    ) {}
}
