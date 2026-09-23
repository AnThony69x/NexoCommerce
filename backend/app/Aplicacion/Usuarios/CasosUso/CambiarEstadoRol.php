<?php

declare(strict_types=1);

namespace App\Aplicacion\Usuarios\CasosUso;

use App\Aplicacion\Usuarios\DTOs\ActualizarUsuarioAdminDTO;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Excepciones\UltimoAdminException;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * RN-USR-03: Solo ADMIN invoca este caso de uso (controlado por middleware).
 * RN-USR-04: No se puede dejar el sistema sin ningun ADMIN activo.
 * RN-USR-06: No hay DELETE fisico; se usa activo = false.
 */
final class CambiarEstadoRol
{
    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
    ) {}

    public function execute(int $usuario_id, ActualizarUsuarioAdminDTO $dto): Usuario
    {
        $usuario = $this->usuarioRepo->buscarPorId($usuario_id);

        if ($usuario === null) {
            throw new ModelNotFoundException("Usuario {$usuario_id} no encontrado.");
        }

        $this->validarNoEsUltimoAdmin($usuario, $dto);

        $datos = [];

        if ($dto->rol !== null) {
            $rolId = $this->usuarioRepo->buscarRolIdPorNombre($dto->rol);
            if ($rolId !== null) {
                $datos['rol_id'] = $rolId;
            }
        }

        if ($dto->activo !== null) {
            $datos['activo'] = $dto->activo;
        }

        if (empty($datos)) {
            return $usuario;
        }

        return $this->usuarioRepo->actualizar($usuario_id, $datos);
    }

    /**
     * Protege la invariante: siempre debe existir al menos un ADMIN activo.
     * Falla si el usuario ES ADMIN activo, y la operacion lo degradaria o desactivaria.
     */
    private function validarNoEsUltimoAdmin(Usuario $usuario, ActualizarUsuarioAdminDTO $dto): void
    {
        $esDegradacion = $dto->rol !== null && $dto->rol !== 'ADMIN';
        $esDesactivacion = $dto->activo === false;

        if (! ($esDegradacion || $esDesactivacion)) {
            return;
        }

        if ($usuario->rol !== 'ADMIN' || ! $usuario->activo) {
            return;
        }

        if ($this->usuarioRepo->contarAdminsActivos() <= 1) {
            throw new UltimoAdminException;
        }
    }
}
