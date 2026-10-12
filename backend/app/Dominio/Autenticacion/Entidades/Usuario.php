<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Entidades;

use DateTimeImmutable;

/**
 * Entidad de dominio pura. Cero dependencias de Laravel.
 *
 * @phpstan-type UsuarioArray array{
 *   id: int,
 *   rol_id: int,
 *   nombre_completo: string,
 *   correo: string,
 *   telefono: string|null,
 *   password_hash: string|null,
 *   correo_verificado: bool,
 *   intentos_fallidos: int,
 *   bloqueado_hasta: DateTimeImmutable|null,
 *   terminos_aceptados: bool,
 *   version_terminos: string|null,
 *   terminos_aceptados_en: DateTimeImmutable|null,
 *   activo: bool,
 *   creado_en: DateTimeImmutable,
 *   actualizado_en: DateTimeImmutable,
 *   rol: string
 * }
 */
final class Usuario
{
    public function __construct(
        public readonly int $id,
        public readonly int $rol_id,
        public readonly string $nombre_completo,
        public readonly string $correo,
        public readonly ?string $telefono,
        public readonly ?string $password_hash,
        public readonly bool $correo_verificado,
        public readonly int $intentos_fallidos,
        public readonly ?DateTimeImmutable $bloqueado_hasta,
        public readonly bool $terminos_aceptados,
        public readonly ?string $version_terminos,
        public readonly ?DateTimeImmutable $terminos_aceptados_en,
        public readonly bool $activo,
        public readonly DateTimeImmutable $creado_en,
        public readonly DateTimeImmutable $actualizado_en,
        /** Nombre del rol: ADMIN | CLIENTE */
        public readonly string $rol,
    ) {}

    /** RN-AUTH-06: Cuenta bloqueada si bloqueado_hasta es futuro. */
    public function estaBloqueado(): bool
    {
        if ($this->bloqueado_hasta === null) {
            return false;
        }

        return $this->bloqueado_hasta > new DateTimeImmutable;
    }

    /** RN-USR-05: Cuenta creada solo via OAuth (sin password local). */
    public function esSoloOAuth(): bool
    {
        return $this->password_hash === null;
    }

    public function esAdmin(): bool
    {
        return $this->rol === 'ADMIN';
    }
}
