<?php

use App\Http\Controllers\Admin\UsuarioController as AdminUsuarioController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Multimedia\MultimediaController;
use App\Http\Controllers\Tienda\ConfiguracionTiendaController;
use App\Http\Controllers\Usuarios\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de API REST - NexoCommerce v1
|--------------------------------------------------------------------------
|
| API pura: sin sesiones, sin CSRF, sin Blade.
| Autenticacion: Laravel Sanctum (Personal Access Tokens).
| Autorizacion: middleware VerificarRol (alias 'rol').
|
*/

Route::prefix('v1')->group(function (): void {

    // -------------------------------------------------------------------------
    // Modulo 01: Autenticacion — rutas publicas
    // -------------------------------------------------------------------------
    Route::prefix('auth')->group(function (): void {
        Route::post('registro', [AuthController::class, 'registro']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('oauth', [AuthController::class, 'oauth']);
    });

    // -------------------------------------------------------------------------
    // Rutas protegidas por Sanctum (token Bearer requerido)
    // -------------------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function (): void {

        // Modulo 01: Autenticacion — rutas autenticadas
        Route::prefix('auth')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('perfil', [AuthController::class, 'perfil']);
            Route::post('verificar-correo', [AuthController::class, 'verificarCorreo']);
            Route::post('reenviar-verificacion', [AuthController::class, 'reenviarVerificacion']);
        });

        // Modulo 02: Usuarios — perfil propio (ADMIN y CLIENTE)
        Route::prefix('usuarios')->group(function (): void {
            Route::put('perfil', [UsuarioController::class, 'actualizarPerfil']);
            Route::put('cambiar-password', [UsuarioController::class, 'cambiarPassword']);
        });

        // -------------------------------------------------------------------------
        // Rutas de administracion — exclusivo ADMIN
        // -------------------------------------------------------------------------
        Route::middleware('rol:ADMIN')->prefix('admin')->group(function (): void {

            // Modulo 02: Usuarios — gestion administrativa
            Route::get('usuarios', [AdminUsuarioController::class, 'index']);
            Route::patch('usuarios/{id}', [AdminUsuarioController::class, 'update']);

            // Modulo 09: Tienda — configuracion
            Route::put('tienda/configuracion', [ConfiguracionTiendaController::class, 'actualizar']);

        });
    });

    // -------------------------------------------------------------------------
    // Modulo 09: Tiendas y Parametrizacion
    // -------------------------------------------------------------------------
    Route::prefix('tienda')->group(function (): void {
        Route::get('configuracion', [ConfiguracionTiendaController::class, 'mostrar']);
    });

    // -------------------------------------------------------------------------
    // Modulo 03: Categorias
    // -------------------------------------------------------------------------
    Route::prefix('categorias')->group(function (): void {
        // Fase 4
    });

    // -------------------------------------------------------------------------
    // Modulo 04: Productos y Personalizacion
    // -------------------------------------------------------------------------
    Route::prefix('productos')->group(function (): void {
        // Fase 5
    });

    // -------------------------------------------------------------------------
    // Modulo 05: Carrito de Compras
    // -------------------------------------------------------------------------
    Route::prefix('carrito')->group(function (): void {
        // Fase 8
    });

    // -------------------------------------------------------------------------
    // Modulo 06: Pedidos
    // -------------------------------------------------------------------------
    Route::prefix('pedidos')->group(function (): void {
        // Fase 9
    });

    // -------------------------------------------------------------------------
    // Modulo 07: Pagos y Comprobantes
    // -------------------------------------------------------------------------
    Route::prefix('pagos')->group(function (): void {
        // Fase 10
    });

    // -------------------------------------------------------------------------
    // Modulo 08: Multimedia — Fase 2
    // -------------------------------------------------------------------------
    Route::middleware('auth:sanctum')->prefix('multimedia')->group(function (): void {
        Route::post('/', [MultimediaController::class, 'subir']);
        Route::get('{id}', [MultimediaController::class, 'mostrar']);
        Route::delete('{id}', [MultimediaController::class, 'desactivar']);
    });

    // -------------------------------------------------------------------------
    // Modulo 10: Notificaciones
    // -------------------------------------------------------------------------
    Route::prefix('notificaciones')->group(function (): void {
        // Fase 11
    });

    // Healthcheck version API
    Route::get('salud', static fn () => response()->json([
        'success' => true,
        'api' => 'NexoCommerce v1',
        'estado' => 'activo',
    ]));
});
