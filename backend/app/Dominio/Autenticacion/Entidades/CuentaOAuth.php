<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Entidades;

use DateTimeImmutable;

/** Entidad de dominio pura. Cero dependencias de Laravel. */
final class CuentaOAuth
{
    public function __construct(
        public readonly int $id,
        public readonly int $usuario_id,
        /** Solo GOOGLE (RN-AUTH-09) */
        public readonly string $proveedor,
        public readonly string $id_proveedor,
        public readonly DateTimeImmutable $creado_en,
        public readonly DateTimeImmutable $actualizado_en,
    ) {}
}
