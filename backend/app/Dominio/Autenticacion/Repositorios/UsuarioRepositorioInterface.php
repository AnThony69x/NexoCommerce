<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Repositorios;

use App\Dominio\Autenticacion\Entidades\Usuario;

interface UsuarioRepositorioInterface
{
    public function buscarPorCorreo(string $correo): ?Usuario;

    public function buscarPorId(int $id): ?Usuario;

    public function existeCorreo(string $correo): bool;

    /**
     * Crea un nuevo usuario y devuelve la entidad resultante.
     *
     * @param  array<string, mixed>  $datos  Campos del SQL: rol_id, nombre_completo, correo, etc.
     */
    public function guardar(array $datos): Usuario;

    /**
     * Actualiza campos del usuario y devuelve la entidad resultante.
     *
     * @param  array<string, mixed>  $datos  Solo los campos a modificar.
     */
    public function actualizar(int $id, array $datos): Usuario;

    /** Resuelve el id de un rol por su nombre (ADMIN | CLIENTE). */
    public function buscarRolIdPorNombre(string $nombre): ?int;

    /**
     * Lista usuarios con filtros opcionales. Devuelve la pagina solicitada.
     *
     * @param  array{rol?: string, buscar?: string, activo?: bool|string}  $filtros
     * @return array{items: list<Usuario>, total: int, por_pagina: int, pagina_actual: int, total_paginas: int}
     */
    public function listar(array $filtros, int $pagina, int $porPagina): array;

    /** Cuenta cuantos ADMIN activos existen. */
    public function contarAdminsActivos(): int;
}
