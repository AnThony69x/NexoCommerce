<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de autorizacion por rol.
 *
 * Uso en rutas:
 *   ->middleware('rol:ADMIN')
 *   ->middleware('rol:ADMIN,CLIENTE')
 *
 * Requiere que el guard Sanctum ya haya autenticado al usuario.
 */
class VerificarRol
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        /** @var UsuarioModelo|null $usuario */
        $usuario = $request->user();

        if ($usuario === null) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Token ausente, invalido o expirado.',
                'codigo_error' => 'AUTH_REQUIRED',
            ], 401);
        }

        $usuario->load('rol');

        $rolNombre = $usuario->rol?->nombre ?? '';

        if (! in_array($rolNombre, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. No posees permisos para este recurso.',
                'codigo_error' => 'AUTH_FORBIDDEN',
            ], 403);
        }

        return $next($request);
    }
}
