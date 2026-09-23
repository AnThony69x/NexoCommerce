<?php

declare(strict_types=1);

namespace App\Aplicacion\Usuarios\CasosUso;

use App\Aplicacion\Usuarios\DTOs\ActualizarPerfilDTO;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;

/**
 * RN-USR-02: El usuario solo edita su propio perfil (nombre_completo, telefono).
 * El correo no se modifica por este endpoint.
 */
final class ActualizarPerfil
{
    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
    ) {}

    public function execute(int $usuario_id, ActualizarPerfilDTO $dto): Usuario
    {
        return $this->usuarioRepo->actualizar($usuario_id, [
            'nombre_completo' => $dto->nombre_completo,
            'telefono' => $dto->telefono,
        ]);
    }
}
