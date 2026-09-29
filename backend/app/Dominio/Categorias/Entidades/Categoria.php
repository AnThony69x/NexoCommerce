<?php

declare(strict_types=1);

namespace App\Dominio\Categorias\Entidades;

use App\Dominio\Categorias\ObjetosValor\ImagenCategoria;
use DateTimeImmutable;

/**
 * Entidad de dominio pura para la tabla `categorias`.
 */
final class Categoria
{
    public function __construct(
        public readonly int $id,
        public readonly ?int $categoria_padre_id,
        public readonly string $nombre,
        public readonly ?string $descripcion,
        public readonly ?int $imagen_id,
        public readonly bool $activo,
        public readonly DateTimeImmutable $creado_en,
        public readonly DateTimeImmutable $actualizado_en,
        public readonly ?ImagenCategoria $imagen = null,
    ) {}
}
