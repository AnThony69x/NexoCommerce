<?php

declare(strict_types=1);

namespace App\Dominio\Tienda\Entidades;

use DateTimeImmutable;

/**
 * Entidad de dominio pura para la configuracion de la tienda.
 * Representa las columnas reales de `configuracion_tienda`.
 */
final class ConfiguracionTienda
{
    public function __construct(
        public readonly int $id,
        public readonly string $nombre_tienda,
        public readonly ?string $logo_url,
        public readonly ?string $favicon_url,
        public readonly string $color_primario,
        public readonly string $color_secundario,
        public readonly ?string $color_acento,
        public readonly ?string $color_fondo,
        public readonly ?string $color_texto,
        public readonly ?string $telefono,
        public readonly ?string $correo,
        public readonly ?string $direccion,
        public readonly bool $activo,
        public readonly DateTimeImmutable $creado_en,
        public readonly DateTimeImmutable $actualizado_en,
    ) {}

    public function estaActiva(): bool
    {
        return $this->activo;
    }
}
