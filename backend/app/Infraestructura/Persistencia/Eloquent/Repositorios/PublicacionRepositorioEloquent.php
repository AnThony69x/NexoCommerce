<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Publicaciones\Entidades\ImagenPublicacion;
use App\Dominio\Publicaciones\Entidades\Publicacion;
use App\Dominio\Publicaciones\Excepciones\PublicacionNoEncontradaException;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PublicacionModelo;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

final class PublicacionRepositorioEloquent implements PublicacionRepositorioInterface
{
    public function listar(array $filtros, bool $incluirInactivas = false): array
    {
        $query = $this->consultaConImagenes();

        if (! $incluirInactivas) {
            $query->where('activo', true);
        }

        if (isset($filtros['categoria_id'])) {
            $query->where('categoria_id', $filtros['categoria_id']);
        }

        if (isset($filtros['producto_id'])) {
            $query->where('producto_id', $filtros['producto_id']);
        }

        $paginador = $query
            ->orderByDesc('creado_en')
            ->orderByDesc('id')
            ->paginate(10, ['*'], 'page', (int) ($filtros['page'] ?? 1));

        return [
            'datos' => array_map(
                fn (PublicacionModelo $modelo): Publicacion => $this->mapear($modelo),
                $paginador->items(),
            ),
            'pagina_actual' => $paginador->currentPage(),
            'por_pagina' => $paginador->perPage(),
            'total' => $paginador->total(),
            'total_paginas' => $paginador->lastPage(),
        ];
    }

    public function buscarPorId(int $id, bool $soloActiva = true): ?Publicacion
    {
        $query = $this->consultaConImagenes();

        if ($soloActiva) {
            $query->where('activo', true);
        }

        $modelo = $query->find($id);

        return $modelo !== null ? $this->mapear($modelo) : null;
    }

    public function crear(int $usuarioId, array $datos): Publicacion
    {
        $id = DB::transaction(function () use ($usuarioId, $datos): int {
            $publicacion = PublicacionModelo::create([
                'usuario_id' => $usuarioId,
                'categoria_id' => $datos['categoria_id'],
                'producto_id' => $datos['producto_id'],
                'titulo' => $datos['titulo'],
                'descripcion' => $datos['descripcion'],
                'activo' => $datos['activo'],
            ]);

            $this->reemplazarImagenes($publicacion, $datos['imagenes']);

            return (int) $publicacion->id;
        });

        return $this->buscarPorId($id, false) ?? throw new PublicacionNoEncontradaException;
    }

    public function actualizar(int $id, array $datos): Publicacion
    {
        DB::transaction(function () use ($id, $datos): void {
            $publicacion = PublicacionModelo::query()->lockForUpdate()->find($id);

            if ($publicacion === null) {
                throw new PublicacionNoEncontradaException;
            }

            $publicacion->update(array_intersect_key($datos, array_flip([
                'categoria_id',
                'producto_id',
                'titulo',
                'descripcion',
                'activo',
            ])));

            if (array_key_exists('imagenes', $datos)) {
                $this->reemplazarImagenes($publicacion, $datos['imagenes']);
            }
        });

        return $this->buscarPorId($id, false) ?? throw new PublicacionNoEncontradaException;
    }

    public function desactivar(int $id): void
    {
        $actualizadas = PublicacionModelo::query()->whereKey($id)->update(['activo' => false]);

        if ($actualizadas === 0) {
            throw new PublicacionNoEncontradaException;
        }
    }

    private function consultaConImagenes(): Builder
    {
        return PublicacionModelo::query()->with([
            'multimedia' => fn (BelongsToMany $query) => $query
                ->select('multimedia.id', 'ruta_archivo')
                ->orderBy('publicacion_multimedia.orden')
                ->orderBy('multimedia.id'),
        ]);
    }

    private function reemplazarImagenes(PublicacionModelo $publicacion, array $imagenes): void
    {
        $asociaciones = [];
        foreach ($imagenes as $imagen) {
            $asociaciones[$imagen['multimedia_id']] = ['orden' => $imagen['orden']];
        }

        $publicacion->multimedia()->sync($asociaciones);
    }

    private function mapear(PublicacionModelo $modelo): Publicacion
    {
        return new Publicacion(
            id: (int) $modelo->id,
            usuario_id: (int) $modelo->usuario_id,
            categoria_id: $modelo->categoria_id !== null ? (int) $modelo->categoria_id : null,
            producto_id: $modelo->producto_id !== null ? (int) $modelo->producto_id : null,
            titulo: (string) $modelo->titulo,
            descripcion: $modelo->descripcion,
            activo: (bool) $modelo->activo,
            creado_en: DateTimeImmutable::createFromInterface($modelo->creado_en),
            actualizado_en: DateTimeImmutable::createFromInterface($modelo->actualizado_en),
            imagenes: $modelo->multimedia->map(
                static fn ($multimedia): ImagenPublicacion => new ImagenPublicacion(
                    id: (int) $multimedia->id,
                    ruta_archivo: (string) $multimedia->ruta_archivo,
                    orden: (int) $multimedia->pivot->orden,
                ),
            )->all(),
        );
    }
}
