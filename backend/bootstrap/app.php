<?php

use App\Dominio\Compartido\Excepciones\DominioException;
use App\Http\Middleware\ForzarJson;
use App\Http\Middleware\VerificarRol;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            Route::middleware('api')->get('/', function () {
                return response()->json([
                    'success' => true,
                    'servicio' => 'NexoCommerce REST API',
                    'version' => 'v1',
                    'estado' => 'operativo',
                    'timestamp' => now()->toIso8601String(),
                ]);
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(ForzarJson::class);
        $middleware->redirectGuestsTo(null);

        // Alias para el middleware de autorizacion por rol.
        $middleware->alias(['rol' => VerificarRol::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => true,
        );

        // Errores de dominio / negocio — lanzados por casos de uso.
        $exceptions->render(function (DominioException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'codigo_error' => $e->codigo_error,
            ], $e->httpStatus);
        });

        $exceptions->render(function (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Los datos proporcionados no son validos.',
                'errors' => $e->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Token ausente, invalido o expirado.',
                'codigo_error' => 'AUTH_REQUIRED',
            ], 401);
        });

        $exceptions->render(function (AccessDeniedHttpException|AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. No posees permisos para este recurso.',
                'codigo_error' => 'FORBIDDEN',
            ], 403);
        });

        $exceptions->render(function (NotFoundHttpException|ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Recurso o endpoint no encontrado.',
                'codigo_error' => 'NOT_FOUND',
            ], 404);
        });
    })->create();
