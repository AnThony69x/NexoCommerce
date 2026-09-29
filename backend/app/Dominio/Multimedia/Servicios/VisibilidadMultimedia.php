<?php

declare(strict_types=1);

namespace App\Dominio\Multimedia\Servicios;

final class VisibilidadMultimedia
{
    private const DESTINOS_PUBLICOS = ['productos', 'categorias', 'tienda', 'publicaciones', 'disenos'];

    private const DESTINOS_PRIVADOS = ['comprobantes', 'personalizaciones'];

    public static function esPublica(string $ruta): bool
    {
        return self::tieneDestino($ruta, self::DESTINOS_PUBLICOS);
    }

    public static function esPrivada(string $ruta): bool
    {
        return self::tieneDestino($ruta, self::DESTINOS_PRIVADOS);
    }

    public static function rutaPublicaValida(string $ruta): bool
    {
        return self::esPublica($ruta)
            && preg_match('/\A(?:productos|categorias|tienda|publicaciones|disenos)\/[A-Za-z0-9_-][A-Za-z0-9._-]*\.(?:jpg|jpeg|png|webp)\z/D', $ruta) === 1;
    }

    /** @param list<string> $destinos */
    private static function tieneDestino(string $ruta, array $destinos): bool
    {
        foreach ($destinos as $destino) {
            if (str_starts_with($ruta, $destino.'/')) {
                return true;
            }
        }

        return false;
    }
}
