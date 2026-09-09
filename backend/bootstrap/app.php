<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Configuracion stateless para API REST
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Forzar respuestas exclusivamente en JSON
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => true,
        );

        // Error de validacion (422)
        $exceptions->render(function (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Los datos proporcionados no son validos.',
                'errors' => $e->errors(),
            ], 422);
        });

        // Error de autenticacion (401)
        $exceptions->render(function (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Token ausente, invalido o expirado.',
                'codigo_error' => 'AUTH_REQUIRED',
            ], 401);
        });

        // Error de autorizacion (403)
        $exceptions->render(function (AccessDeniedHttpException|AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. No posees permisos para este recurso.',
                'codigo_error' => 'FORBIDDEN',
            ], 403);
        });

        // Recurso o ruta no encontrada (404)
        $exceptions->render(function (NotFoundHttpException|ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Recurso o endpoint no encontrado.',
                'codigo_error' => 'NOT_FOUND',
            ], 404);
        });
    })->create();
