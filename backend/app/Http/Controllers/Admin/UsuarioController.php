<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Aplicacion\Usuarios\CasosUso\CambiarEstadoRol;
use App\Aplicacion\Usuarios\CasosUso\ListarUsuarios;
use App\Aplicacion\Usuarios\DTOs\ActualizarUsuarioAdminDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ActualizarUsuarioAdminRequest;
use App\Http\Resources\UsuarioResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador delgado para /api/v1/admin/usuarios.
 * Acceso exclusivo: rol ADMIN (controlado por middleware VerificarRol).
 */
class UsuarioController extends Controller
{
    public function __construct(
        private readonly ListarUsuarios $listarUsuarios,
        private readonly CambiarEstadoRol $cambiarEstadoRol,
    ) {}

    /** GET /api/v1/admin/usuarios */
    public function index(Request $request): JsonResponse
    {
        $filtros = array_filter([
            'rol' => $request->query('rol'),
            'buscar' => $request->query('buscar'),
            'activo' => $request->query('activo'),
        ], fn ($v) => $v !== null && $v !== '');

        $pagina = max(1, (int) $request->query('page', 1));
        $resultado = $this->listarUsuarios->execute($filtros, $pagina);

        $items = array_map(
            static fn ($u) => (new UsuarioResource($u))->toArray($request),
            $resultado['items'],
        );

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'pagina_actual' => $resultado['pagina_actual'],
                'por_pagina' => $resultado['por_pagina'],
                'total' => $resultado['total'],
                'total_paginas' => $resultado['total_paginas'],
            ],
        ]);
    }

    /** PATCH /api/v1/admin/usuarios/{id} */
    public function update(ActualizarUsuarioAdminRequest $request, int $id): JsonResponse
    {
        $dto = new ActualizarUsuarioAdminDTO(
            rol: $request->input('rol'),
            activo: $request->has('activo') ? (bool) $request->input('activo') : null,
        );

        $usuario = $this->cambiarEstadoRol->execute($id, $dto);

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente.',
            'data' => new UsuarioResource($usuario),
        ]);
    }
}
