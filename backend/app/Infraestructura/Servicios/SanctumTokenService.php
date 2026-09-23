<?php

declare(strict_types=1);

namespace App\Infraestructura\Servicios;

use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;

class SanctumTokenService implements TokenServiceInterface
{
    public function emitir(int $usuario_id, ?string $nombreDispositivo): string
    {
        /** @var UsuarioModelo $modelo */
        $modelo = UsuarioModelo::findOrFail($usuario_id);

        return $modelo->createToken($nombreDispositivo ?? 'api')->plainTextToken;
    }

    public function revocarTodos(int $usuario_id): void
    {
        /** @var UsuarioModelo $modelo */
        $modelo = UsuarioModelo::findOrFail($usuario_id);
        $modelo->tokens()->delete();
    }
}
