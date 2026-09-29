<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Entidades;

use DateTimeImmutable;

/** Entidad de dominio pura. Cero dependencias de Laravel. */
final class VerificacionCorreo
{
    public function __construct(
        public readonly int $id,
        public readonly int $usuario_id,
        public readonly string $codigo,
        public readonly DateTimeImmutable $expira_en,
        public readonly ?DateTimeImmutable $usado_en,
        public readonly DateTimeImmutable $creado_en,
    ) {}

    public function estaExpirado(): bool
    {
        return $this->expira_en < new DateTimeImmutable;
    }

    public function estaUsado(): bool
    {
        return $this->usado_en !== null;
    }

    /** Valido = no expirado y no usado. */
    public function esValido(): bool
    {
        return ! $this->estaUsado() && ! $this->estaExpirado();
    }
}
