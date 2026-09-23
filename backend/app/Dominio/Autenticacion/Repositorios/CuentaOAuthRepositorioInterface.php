<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Repositorios;

use App\Dominio\Autenticacion\Entidades\CuentaOAuth;

interface CuentaOAuthRepositorioInterface
{
    /** Busca el par unico (proveedor, id_proveedor). */
    public function buscarPorProveedor(string $proveedor, string $id_proveedor): ?CuentaOAuth;

    /** Vincula una cuenta OAuth a un usuario existente. */
    public function vincular(int $usuario_id, string $proveedor, string $id_proveedor): CuentaOAuth;
}
