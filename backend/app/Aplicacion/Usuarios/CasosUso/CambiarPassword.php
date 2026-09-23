<?php

declare(strict_types=1);

namespace App\Aplicacion\Usuarios\CasosUso;

use App\Aplicacion\Usuarios\DTOs\CambiarPasswordDTO;
use App\Dominio\Autenticacion\Excepciones\PasswordActualIncorrectoException;
use App\Dominio\Autenticacion\Excepciones\SinPasswordLocalException;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * RN-USR-05: Exige password_actual. Falla con 400 si la cuenta es solo OAuth.
 */
final class CambiarPassword
{
    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
    ) {}

    public function execute(int $usuario_id, CambiarPasswordDTO $dto): void
    {
        $usuario = $this->usuarioRepo->buscarPorId($usuario_id);

        if ($usuario === null) {
            throw new ModelNotFoundException("Usuario {$usuario_id} no encontrado.");
        }

        if ($usuario->esSoloOAuth()) {
            throw new SinPasswordLocalException;
        }

        if (! password_verify($dto->password_actual, $usuario->password_hash ?? '')) {
            throw new PasswordActualIncorrectoException;
        }

        $this->usuarioRepo->actualizar($usuario_id, [
            'password_hash' => password_hash($dto->password_nueva, PASSWORD_BCRYPT),
        ]);
    }
}
