<?php

declare(strict_types=1);

namespace App\Dominio\Multimedia\Repositorios;

use App\Dominio\Multimedia\Entidades\Multimedia;

interface MultimediaRepositorioInterface
{
    /**
     * Persiste los metadatos de un archivo y devuelve la entidad creada.
     *
     * @param  array<string, mixed>  $datos
     */
    public function guardar(array $datos): Multimedia;

    /**
     * Busca un registro por id sin importar si esta activo.
     */
    public function buscarPorId(int $id): ?Multimedia;

    public function buscarPorRuta(string $ruta): ?Multimedia;

    /**
     * Marca `activo = false` en la fila indicada.
     */
    public function desactivar(int $id): void;

    /**
     * Comprueba si la fila esta referenciada por tablas con ON DELETE RESTRICT
     * (`comprobantes_pago`, `disenos_personalizados`).
     * Retorna true si hay al menos una FK activa que impediria el borrado fisico.
     */
    public function estaEnUsoRestrict(int $id): bool;
}
