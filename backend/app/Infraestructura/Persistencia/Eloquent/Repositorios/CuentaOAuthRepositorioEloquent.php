<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Autenticacion\Entidades\CuentaOAuth;
use App\Dominio\Autenticacion\Repositorios\CuentaOAuthRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CuentaOAuthModelo;
use DateTimeImmutable;

class CuentaOAuthRepositorioEloquent implements CuentaOAuthRepositorioInterface
{
    public function buscarPorProveedor(string $proveedor, string $id_proveedor): ?CuentaOAuth
    {
        $modelo = CuentaOAuthModelo::where('proveedor', $proveedor)
            ->where('id_proveedor', $id_proveedor)
            ->first();

        return $modelo ? $this->mapearAEntidad($modelo) : null;
    }

    public function vincular(int $usuario_id, string $proveedor, string $id_proveedor): CuentaOAuth
    {
        $modelo = CuentaOAuthModelo::create([
            'usuario_id' => $usuario_id,
            'proveedor' => $proveedor,
            'id_proveedor' => $id_proveedor,
        ]);

        return $this->mapearAEntidad($modelo);
    }

    // -------------------------------------------------------------------------

    private function mapearAEntidad(CuentaOAuthModelo $modelo): CuentaOAuth
    {
        return new CuentaOAuth(
            id: $modelo->id,
            usuario_id: $modelo->usuario_id,
            proveedor: $modelo->proveedor,
            id_proveedor: $modelo->id_proveedor,
            creado_en: new DateTimeImmutable($modelo->creado_en->toDateTimeString()),
            actualizado_en: new DateTimeImmutable($modelo->actualizado_en->toDateTimeString()),
        );
    }
}
