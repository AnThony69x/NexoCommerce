<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\Contratos;

/**
 * Puerto de almacenamiento de archivos binarios.
 * Las implementaciones concretas viven en Infraestructura.
 * Permite cambiar de disco local a SFTP (Laptop 5) sin tocar los casos de uso.
 */
interface AlmacenamientoArchivosInterface
{
    /**
     * Guarda el contenido en la ruta relativa indicada y devuelve esa misma ruta.
     *
     * @param  string  $rutaRelativa  Ej: "productos/20260923_abc.webp"
     * @param  string  $contenido  Bytes del archivo
     */
    public function guardar(string $rutaRelativa, string $contenido): string;

    /**
     * Elimina el archivo de la ruta relativa.
     * No lanza excepcion si el archivo no existe.
     */
    public function eliminar(string $rutaRelativa): void;
}
