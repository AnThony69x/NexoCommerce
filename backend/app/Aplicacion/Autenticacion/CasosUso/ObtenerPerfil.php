<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\CasosUso;

use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

final class ObtenerPerfil
{
    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
    ) {}

    public function execute(int $usuario_id): Usuario
    {
        $usuario = $this->usuarioRepo->buscarPorId($usuario_id);

        if ($usuario === null) {
            throw new ModelNotFoundException("Usuario {$usuario_id} no encontrado.");
        }

        return $usuario;
    }
}
