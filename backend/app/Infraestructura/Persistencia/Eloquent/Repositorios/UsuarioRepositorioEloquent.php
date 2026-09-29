<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\RolModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use DateTimeImmutable;

class UsuarioRepositorioEloquent implements UsuarioRepositorioInterface
{
    public function buscarPorCorreo(string $correo): ?Usuario
    {
        $modelo = UsuarioModelo::with('rol')->where('correo', $correo)->first();

        return $modelo ? $this->mapearAEntidad($modelo) : null;
    }

    public function buscarPorId(int $id): ?Usuario
    {
        $modelo = UsuarioModelo::with('rol')->find($id);

        return $modelo ? $this->mapearAEntidad($modelo) : null;
    }

    public function existeCorreo(string $correo): bool
    {
        return UsuarioModelo::where('correo', $correo)->exists();
    }

    public function guardar(array $datos): Usuario
    {
        $modelo = UsuarioModelo::create($datos);
        $modelo->load('rol');

        return $this->mapearAEntidad($modelo);
    }

    public function actualizar(int $id, array $datos): Usuario
    {
        $modelo = UsuarioModelo::findOrFail($id);
        $modelo->update($datos);
        $modelo->load('rol');

        return $this->mapearAEntidad($modelo->fresh(['rol']) ?? $modelo);
    }

    public function buscarRolIdPorNombre(string $nombre): ?int
    {
        return RolModelo::where('nombre', $nombre)->value('id');
    }

    public function listar(array $filtros, int $pagina, int $porPagina): array
    {
        $query = UsuarioModelo::with('rol');

        if (! empty($filtros['rol'])) {
            $query->whereHas('rol', static fn ($q) => $q->where('nombre', $filtros['rol']));
        }

        if (! empty($filtros['buscar'])) {
            $buscar = $filtros['buscar'];
            $query->where(static function ($q) use ($buscar): void {
                $q->where('nombre_completo', 'ilike', "%{$buscar}%")
                    ->orWhere('correo', 'ilike', "%{$buscar}%");
            });
        }

        if (isset($filtros['activo'])) {
            $activo = filter_var($filtros['activo'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

            if ($activo !== null) {
                $query->where('activo', $activo);
            }
        }

        $paginator = $query->paginate($porPagina, ['*'], 'page', $pagina);

        return [
            'items' => array_map(
                fn (UsuarioModelo $m): Usuario => $this->mapearAEntidad($m),
                $paginator->items(),
            ),
            'total' => $paginator->total(),
            'por_pagina' => $paginator->perPage(),
            'pagina_actual' => $paginator->currentPage(),
            'total_paginas' => $paginator->lastPage(),
        ];
    }

    public function contarAdminsActivos(): int
    {
        return UsuarioModelo::where('activo', true)
            ->whereHas('rol', static fn ($q) => $q->where('nombre', 'ADMIN'))
            ->count();
    }

    // -------------------------------------------------------------------------

    private function mapearAEntidad(UsuarioModelo $modelo): Usuario
    {
        $rolNombre = $modelo->relationLoaded('rol') && $modelo->rol !== null
            ? $modelo->rol->nombre
            : '';

        return new Usuario(
            id: $modelo->id,
            rol_id: $modelo->rol_id,
            nombre_completo: $modelo->nombre_completo,
            correo: $modelo->correo,
            telefono: $modelo->telefono,
            password_hash: $modelo->password_hash,
            correo_verificado: $modelo->correo_verificado,
            intentos_fallidos: $modelo->intentos_fallidos,
            bloqueado_hasta: $modelo->bloqueado_hasta
                ? new DateTimeImmutable($modelo->bloqueado_hasta->toDateTimeString())
                : null,
            terminos_aceptados: $modelo->terminos_aceptados,
            version_terminos: $modelo->version_terminos,
            terminos_aceptados_en: $modelo->terminos_aceptados_en
                ? new DateTimeImmutable($modelo->terminos_aceptados_en->toDateTimeString())
                : null,
            activo: $modelo->activo,
            creado_en: new DateTimeImmutable($modelo->creado_en->toDateTimeString()),
            actualizado_en: new DateTimeImmutable($modelo->actualizado_en->toDateTimeString()),
            rol: $rolNombre,
        );
    }
}
