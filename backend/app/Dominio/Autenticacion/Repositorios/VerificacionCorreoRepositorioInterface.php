<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Repositorios;

use App\Dominio\Autenticacion\Entidades\VerificacionCorreo;
use DateTimeImmutable;

interface VerificacionCorreoRepositorioInterface
{
    public function crear(int $usuario_id, string $codigo, DateTimeImmutable $expira_en): VerificacionCorreo;

    /** Busca un registro no expirado y no usado para el usuario y codigo dados. */
    public function buscarCodigoActivo(int $usuario_id, string $codigo): ?VerificacionCorreo;

    public function marcarUsado(int $id): void;
}
