<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Entidades;

final readonly class Torta
{
    /** @param list<DisenoTorta> $disenos */
    public function __construct(
        public int $producto_id,
        public string $tamano,
        public int $porciones,
        public string $sabor,
        public array $disenos = [],
    ) {}
}
