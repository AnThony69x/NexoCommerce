<?php

declare(strict_types=1);

namespace App\Http\Controllers\Usuarios;

use App\Aplicacion\Usuarios\CasosUso\ActualizarPerfil;
use App\Aplicacion\Usuarios\CasosUso\CambiarPassword;
use App\Aplicacion\Usuarios\DTOs\ActualizarPerfilDTO;
use App\Aplicacion\Usuarios\DTOs\CambiarPasswordDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Usuarios\ActualizarPerfilRequest;
use App\Http\Requests\Usuarios\CambiarPasswordRequest;
use App\Http\Resources\UsuarioResource;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Http\JsonResponse;

/**
 * Controlador delgado para /api/v1/usuarios (perfil propio).
 */
class UsuarioController extends Controller
{
    public function __construct(
        private readonly ActualizarPerfil $actualizarPerfil,
        private readonly CambiarPassword $cambiarPassword,
    ) {}

    /** PUT /api/v1/usuarios/perfil */
    public function actualizarPerfil(ActualizarPerfilRequest $request): JsonResponse
    {
        /** @var UsuarioModelo $modelo */
        $modelo = $request->user();

        $dto = new ActualizarPerfilDTO(
            nombre_completo: $request->string('nombre_completo')->trim()->toString(),
            telefono: $request->filled('telefono') ? $request->string('telefono')->trim()->toString() : null,
        );

        $usuario = $this->actualizarPerfil->execute($modelo->id, $dto);

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente.',
            'data' => new UsuarioResource($usuario),
        ]);
    }

    /** PUT /api/v1/usuarios/cambiar-password */
    public function cambiarPassword(CambiarPasswordRequest $request): JsonResponse
    {
        /** @var UsuarioModelo $modelo */
        $modelo = $request->user();

        $dto = new CambiarPasswordDTO(
            password_actual: $request->string('password_actual')->toString(),
            password_nueva: $request->string('password_nueva')->toString(),
        );

        $this->cambiarPassword->execute($modelo->id, $dto);

        return response()->json([
            'success' => true,
            'message' => 'Contrasena actualizada correctamente.',
        ]);
    }
}
