<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Categorias\Entidades\Categoria;
use App\Dominio\Categorias\Excepciones\CategoriaDuplicadaException;
use App\Dominio\Categorias\Excepciones\CategoriaNoEncontradaException;
use App\Dominio\Categorias\ObjetosValor\ImagenCategoria;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use DateTimeImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class CategoriaRepositorioEloquent implements CategoriaRepositorioInterface
{
    public function listar(bool $soloActivas): array
    {
        $query = CategoriaModelo::query()
            ->with('imagen:id,ruta_archivo')
            ->orderBy('id');

        if ($soloActivas) {
            $query->where('activo', true);
        }

        return $query->get()
            ->map(fn (CategoriaModelo $modelo): Categoria => $this->mapearAEntidad($modelo))
            ->all();
    }

    public function buscarPorId(int $id): ?Categoria
    {
        $modelo = CategoriaModelo::query()
            ->with('imagen:id,ruta_archivo')
            ->find($id);

        return $modelo !== null ? $this->mapearAEntidad($modelo) : null;
    }

    public function guardar(array $datos): Categoria
    {
        try {
            $modelo = CategoriaModelo::create($datos);
            $modelo->load('imagen:id,ruta_archivo');

            return $this->mapearAEntidad($modelo);
        } catch (QueryException $exception) {
            $this->lanzarSiNombreDuplicado($exception);

            throw $exception;
        }
    }

    public function actualizar(int $id, array $datos): Categoria
    {
        $modelo = CategoriaModelo::find($id);

        if ($modelo === null) {
            throw new CategoriaNoEncontradaException;
        }

        try {
            $modelo->update($datos);
            $modelo->refresh();
            $modelo->load('imagen:id,ruta_archivo');

            return $this->mapearAEntidad($modelo);
        } catch (QueryException $exception) {
            $this->lanzarSiNombreDuplicado($exception);

            throw $exception;
        }
    }

    public function desactivar(int $id): void
    {
        CategoriaModelo::query()
            ->whereKey($id)
            ->update(['activo' => false]);
    }

    public function tieneProductosActivos(int $id): bool
    {
        return DB::table('productos')
            ->where('categoria_id', $id)
            ->where('activo', true)
            ->exists();
    }

    public function mapaPadres(): array
    {
        $mapa = [];

        foreach (CategoriaModelo::query()->pluck('categoria_padre_id', 'id') as $id => $padreId) {
            $mapa[(int) $id] = $padreId !== null ? (int) $padreId : null;
        }

        return $mapa;
    }

    private function mapearAEntidad(CategoriaModelo $modelo): Categoria
    {
        $imagen = null;

        if ($modelo->relationLoaded('imagen') && $modelo->imagen !== null) {
            $imagen = new ImagenCategoria(
                id: (int) $modelo->imagen->id,
                ruta_archivo: $modelo->imagen->ruta_archivo,
            );
        }

        return new Categoria(
            id: (int) $modelo->id,
            categoria_padre_id: $modelo->categoria_padre_id !== null
                ? (int) $modelo->categoria_padre_id
                : null,
            nombre: $modelo->nombre,
            descripcion: $modelo->descripcion,
            imagen_id: $modelo->imagen_id !== null ? (int) $modelo->imagen_id : null,
            activo: (bool) $modelo->activo,
            creado_en: new DateTimeImmutable($modelo->creado_en->toDateTimeString()),
            actualizado_en: new DateTimeImmutable($modelo->actualizado_en->toDateTimeString()),
            imagen: $imagen,
        );
    }

    private function lanzarSiNombreDuplicado(QueryException $exception): void
    {
        $sqlState = (string) ($exception->errorInfo[0] ?? $exception->getCode());

        if ($sqlState === '23505' || $sqlState === '23000') {
            throw new CategoriaDuplicadaException(previous: $exception);
        }
    }
}
