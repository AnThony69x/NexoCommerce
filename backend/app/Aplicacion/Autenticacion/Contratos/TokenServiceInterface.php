<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\Contratos;

/**
 * Puerto (interface) de la capa de Aplicacion para emision de tokens.
 * La implementacion concreta vive en Infraestructura (Sanctum).
 */
interface TokenServiceInterface
{
    /**
     * Emite un nuevo token Bearer para el usuario indicado.
     *
     * @param  string|null  $nombreDispositivo  Nombre del dispositivo (device_name).
     * @return string Token en texto plano (solo disponible en el momento de emision).
     */
    public function emitir(int $usuario_id, ?string $nombreDispositivo): string;

    /**
     * Revoca todos los tokens del usuario (logout de todos los dispositivos).
     * Usar cuando no se dispone del token actual especifico.
     */
    public function revocarTodos(int $usuario_id): void;
}
