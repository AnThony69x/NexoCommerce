<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de API REST - NexoCommerce v1
|--------------------------------------------------------------------------
|
| Todas las rutas aqui definidas estan precedidas por /api y su version /v1.
| Siguen la metodologia SDD y la arquitectura por capas.
|
*/

Route::prefix('v1')->group(function () {

    // Modulo 01: Autenticacion
    Route::prefix('auth')->group(function () {
        // Endpoints publicos: registro, login
        // Endpoints protegidos por Sanctum: logout, perfil
    });

    // Modulo 02: Usuarios y Roles
    Route::prefix('usuarios')->group(function () {
        // Perfil propio, cambio de password
    });

    // Modulo 09: Tiendas y Parametrizacion
    Route::prefix('tienda')->group(function () {
        // Configuracion global de la tienda
    });

    // Modulo 03: Categorias
    Route::prefix('categorias')->group(function () {
        // Catalogo de categorias publicas y administracion
    });

    // Modulo 04: Productos y Personalizacion
    Route::prefix('productos')->group(function () {
        // Listado con filtros, detalle y personalizaciones
    });

    // Modulo 05: Carrito de Compras
    Route::prefix('carrito')->group(function () {
        // Gestion de items y subtotales
    });

    // Modulo 06: Pedidos
    Route::prefix('pedidos')->group(function () {
        // Checkout, consulta de pedidos y seguimiento de estados
    });

    // Modulo 07: Pagos y Comprobantes
    Route::prefix('pagos')->group(function () {
        // Registro de comprobantes y verificacion administrativa
    });

    // Modulo 08: Multimedia
    Route::prefix('multimedia')->group(function () {
        // Subida de imagenes hacia el servidor Linux
    });

    // Modulo 10: Notificaciones
    Route::prefix('notificaciones')->group(function () {
        // Alertas de pedidos y pagos
    });

    // Rutas de Administracion protegidas
    Route::prefix('admin')->group(function () {
        // Rutas exclusivas para rol administrador
    });

    // Healthcheck de la version de la API
    Route::get('/salud', function () {
        return response()->json([
            'success' => true,
            'api' => 'NexoCommerce v1',
            'estado' => 'activo',
        ]);
    });
});
