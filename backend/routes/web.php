<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'servicio' => 'NexoCommerce REST API',
        'version' => 'v1',
        'estado' => 'operativo',
        'timestamp' => now()->toIso8601String(),
    ]);
});
