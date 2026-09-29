<?php

declare(strict_types=1);

namespace App\Dominio\Multimedia\Entidades;

use DateTimeImmutable;

/**
 * Entidad de dominio pura. Cero dependencias de Laravel.
 * Columnas reales de la tabla `multimedia`.
 */
final class Multimedia
{
    public function __construct(
        public readonly int $id,
        public readonly string $nombre_archivo,
        public readonly string $ruta_archivo,
        public readonly string $tipo_mime,
        public readonly int $tamano_bytes,
        public readonly ?int $ancho,
        public readonly ?int $alto,
        public readonly bool $activo,
        public readonly ?int $subido_por_id,
        public readonly DateTimeImmutable $creado_en,
        public readonly DateTimeImmutable $actualizado_en,
    ) {}

    /** RN-MED-05: solo activo es accesible publicamente. */
    public function estaActivo(): bool
    {
        return $this->activo;
    }

    /** Indica si el archivo es una imagen (tiene dimensiones). */
    public function esImagen(): bool
    {
        return $this->ancho !== null && $this->alto !== null;
    }

    /** Indica si el propietario del archivo coincide con el usuario dado. */
    public function esDueno(int $usuarioId): bool
    {
        return $this->subido_por_id === $usuarioId;
    }
}
