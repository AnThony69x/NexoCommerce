<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Productos\Entidades\Detalle;
use App\Dominio\Productos\Entidades\DisenoPersonalizado;
use App\Dominio\Productos\Entidades\DisenoTorta;
use App\Dominio\Productos\Entidades\ImagenProducto;
use App\Dominio\Productos\Entidades\PlantillaDiseno;
use App\Dominio\Productos\Entidades\Producto;
use App\Dominio\Productos\Entidades\Sublimacion;
use App\Dominio\Productos\Entidades\Torta;
use App\Dominio\Productos\Excepciones\DisenoNoEncontradoException;
use App\Dominio\Productos\Excepciones\EspecializacionNoEncontradaException;
use App\Dominio\Productos\Excepciones\MultimediaPersonalizacionNoAutorizadaException;
use App\Dominio\Productos\Excepciones\ProductoNoEncontradoException;
use App\Dominio\Productos\Excepciones\SublimacionSinPlantillaException;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

final class ProductoRepositorioEloquent implements ProductoRepositorioInterface
{
    public function listar(array $filtros): array
    {
        $query = $this->consultaConRelaciones()->where('activo', true);

        $this->aplicarFiltros($query, $filtros);

        $paginador = $query->paginate(12, ['*'], 'page', (int) ($filtros['page'] ?? 1));

        return [
            'datos' => array_map(
                fn (ProductoModelo $modelo): Producto => $this->mapearProducto($modelo),
                $paginador->items(),
            ),
            'pagina_actual' => $paginador->currentPage(),
            'por_pagina' => $paginador->perPage(),
            'total' => $paginador->total(),
            'total_paginas' => $paginador->lastPage(),
        ];
    }

    public function buscarPorId(int $id, bool $soloActivo = true): ?Producto
    {
        $query = $this->consultaConRelaciones();

        if ($soloActivo) {
            $query->where('activo', true);
        }

        $modelo = $query->find($id);

        return $modelo !== null ? $this->mapearProducto($modelo) : null;
    }

    public function crear(array $datos): Producto
    {
        $id = DB::transaction(function () use ($datos): int {
            $producto = ProductoModelo::create([
                'categoria_id' => $datos['categoria_id'],
                'nombre' => $datos['nombre'],
                'descripcion' => $datos['descripcion'],
                'precio_base' => $datos['precio_base'],
                'activo' => $datos['activo'],
            ]);

            $this->crearEspecializacion($producto, $datos);
            $this->reemplazarImagenes($producto, $datos['imagenes']);

            return (int) $producto->id;
        });

        return $this->buscarPorId($id, false) ?? throw new ProductoNoEncontradoException;
    }

    public function actualizar(int $id, array $datos): Producto
    {
        DB::transaction(function () use ($id, $datos): void {
            $producto = ProductoModelo::query()->lockForUpdate()->find($id);

            if ($producto === null) {
                throw new ProductoNoEncontradoException;
            }

            $producto->update(array_intersect_key($datos, array_flip([
                'categoria_id',
                'nombre',
                'descripcion',
                'precio_base',
                'activo',
            ])));

            if (isset($datos['torta'])) {
                TortaModelo::query()->whereKey($id)->update($datos['torta']);
            }

            if (isset($datos['detalle'])) {
                DetalleModelo::query()->whereKey($id)->update($datos['detalle']);
            }

            if (isset($datos['sublimacion'])) {
                SublimacionModelo::query()->whereKey($id)->update($datos['sublimacion']);
            }

            if (array_key_exists('imagenes', $datos)) {
                $this->reemplazarImagenes($producto, $datos['imagenes']);
            }
        });

        return $this->buscarPorId($id, false) ?? throw new ProductoNoEncontradoException;
    }

    public function desactivar(int $id): void
    {
        ProductoModelo::query()->whereKey($id)->update(['activo' => false]);
    }

    public function crearDisenoTorta(int $productoId, array $datos): DisenoTorta
    {
        if (! TortaModelo::query()->whereKey($productoId)->exists()) {
            throw new EspecializacionNoEncontradaException('Torta');
        }

        $modelo = DisenoTortaModelo::create(['torta_id' => $productoId, ...$datos]);

        return $this->mapearDisenoTorta($modelo);
    }

    public function actualizarDisenoTorta(int $id, array $datos): DisenoTorta
    {
        $modelo = DisenoTortaModelo::find($id);

        if ($modelo === null) {
            throw new DisenoNoEncontradoException;
        }

        $modelo->update($datos);
        $modelo->refresh();

        return $this->mapearDisenoTorta($modelo);
    }

    public function desactivarDisenoTorta(int $id): void
    {
        $actualizados = DisenoTortaModelo::query()->whereKey($id)->update(['activo' => false]);

        if ($actualizados === 0) {
            throw new DisenoNoEncontradoException;
        }
    }

    public function crearPlantilla(int $productoId, array $datos): PlantillaDiseno
    {
        if (! SublimacionModelo::query()->whereKey($productoId)->exists()) {
            throw new EspecializacionNoEncontradaException('Sublimacion');
        }

        $modelo = PlantillaDisenoModelo::create(['sublimacion_id' => $productoId, ...$datos]);

        return $this->mapearPlantilla($modelo);
    }

    public function actualizarPlantilla(int $id, array $datos): PlantillaDiseno
    {
        return DB::transaction(function () use ($id, $datos): PlantillaDiseno {
            $modelo = PlantillaDisenoModelo::query()->lockForUpdate()->find($id);

            if ($modelo === null) {
                throw new DisenoNoEncontradoException;
            }

            if (($datos['activo'] ?? null) === false) {
                $this->validarPuedeDesactivarPlantilla($modelo);
            }

            $modelo->update($datos);
            $modelo->refresh();

            return $this->mapearPlantilla($modelo);
        });
    }

    public function desactivarPlantilla(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $modelo = PlantillaDisenoModelo::query()->lockForUpdate()->find($id);

            if ($modelo === null) {
                throw new DisenoNoEncontradoException;
            }

            $this->validarPuedeDesactivarPlantilla($modelo);
            $modelo->update(['activo' => false]);
        });
    }

    public function crearDisenoPersonalizado(int $usuarioId, array $datos): DisenoPersonalizado
    {
        $multimediaValida = MultimediaModelo::query()
            ->whereKey($datos['multimedia_id'])
            ->where('subido_por_id', $usuarioId)
            ->where('activo', true)
            ->exists();

        if (! $multimediaValida) {
            throw new MultimediaPersonalizacionNoAutorizadaException;
        }

        $modelo = DisenoPersonalizadoModelo::create([
            'usuario_id' => $usuarioId,
            ...$datos,
        ]);

        return $this->mapearDisenoPersonalizado($modelo);
    }

    public function listarDisenosPersonalizados(int $usuarioId): array
    {
        return DisenoPersonalizadoModelo::query()
            ->where('usuario_id', $usuarioId)
            ->latest('id')
            ->get()
            ->map(fn (DisenoPersonalizadoModelo $modelo): DisenoPersonalizado => $this->mapearDisenoPersonalizado($modelo))
            ->all();
    }

    private function consultaConRelaciones(): Builder
    {
        return ProductoModelo::query()->with([
            'categoria:id,nombre',
            'multimedia' => fn (BelongsToMany $query) => $query->select('multimedia.id', 'ruta_archivo')
                ->orderBy('producto_multimedia.orden'),
            'torta.disenos' => fn ($query) => $query->where('activo', true)->orderBy('id'),
            'detalle',
            'sublimacion.plantillas' => fn ($query) => $query->where('activo', true)->orderBy('id'),
        ]);
    }

    private function aplicarFiltros(Builder $query, array $filtros): void
    {
        if (isset($filtros['categoria_id'])) {
            $query->where('categoria_id', $filtros['categoria_id']);
        }

        if (! empty($filtros['buscar'])) {
            $termino = '%'.mb_strtolower((string) $filtros['buscar']).'%';
            $query->where(function (Builder $subquery) use ($termino): void {
                $subquery->whereRaw('LOWER(nombre) LIKE ?', [$termino])
                    ->orWhereRaw('LOWER(COALESCE(descripcion, ?)) LIKE ?', ['', $termino]);
            });
        }

        if (isset($filtros['precio_min'])) {
            $query->where('precio_base', '>=', $filtros['precio_min']);
        }

        if (isset($filtros['precio_max'])) {
            $query->where('precio_base', '<=', $filtros['precio_max']);
        }

        $tipo = $filtros['tipo'] ?? null;
        if ($tipo !== null) {
            $query->whereHas(match ($tipo) {
                'TORTA' => 'torta',
                'DETALLE' => 'detalle',
                default => 'sublimacion',
            });
        }

        if (isset($filtros['porciones_min']) || isset($filtros['porciones_max']) || ! empty($filtros['sabor'])) {
            $query->whereHas('torta', function (Builder $torta) use ($filtros): void {
                if (isset($filtros['porciones_min'])) {
                    $torta->where('porciones', '>=', $filtros['porciones_min']);
                }
                if (isset($filtros['porciones_max'])) {
                    $torta->where('porciones', '<=', $filtros['porciones_max']);
                }
                if (! empty($filtros['sabor'])) {
                    $torta->whereRaw('LOWER(sabor) LIKE ?', ['%'.mb_strtolower((string) $filtros['sabor']).'%']);
                }
            });
        }

        match ($filtros['ordenar'] ?? 'recientes') {
            'precio_asc' => $query->orderBy('precio_base')->orderBy('id'),
            'precio_desc' => $query->orderByDesc('precio_base')->orderBy('id'),
            default => $query->orderByDesc('creado_en')->orderByDesc('id'),
        };
    }

    private function crearEspecializacion(ProductoModelo $producto, array $datos): void
    {
        match ($datos['tipo']) {
            'TORTA' => TortaModelo::create(['producto_id' => $producto->id, ...$datos['torta']]),
            'DETALLE' => DetalleModelo::create(['producto_id' => $producto->id, ...$datos['detalle']]),
            'SUBLIMACION' => SublimacionModelo::create(['producto_id' => $producto->id, ...$datos['sublimacion']]),
        };
    }

    private function reemplazarImagenes(ProductoModelo $producto, array $imagenes): void
    {
        $asociaciones = [];
        foreach ($imagenes as $imagen) {
            $asociaciones[$imagen['multimedia_id']] = [
                'orden' => $imagen['orden'],
                'es_principal' => $imagen['es_principal'],
            ];
        }

        $producto->multimedia()->sync($asociaciones);
    }

    private function validarPuedeDesactivarPlantilla(PlantillaDisenoModelo $plantilla): void
    {
        if (! $plantilla->activo) {
            return;
        }

        $productoActivo = ProductoModelo::query()
            ->whereKey($plantilla->sublimacion_id)
            ->where('activo', true)
            ->exists();
        $otrasActivas = PlantillaDisenoModelo::query()
            ->where('sublimacion_id', $plantilla->sublimacion_id)
            ->whereKeyNot($plantilla->id)
            ->where('activo', true)
            ->exists();

        if ($productoActivo && ! $otrasActivas) {
            throw new SublimacionSinPlantillaException;
        }
    }

    private function mapearProducto(ProductoModelo $modelo): Producto
    {
        $imagenes = $modelo->multimedia
            ->map(fn (MultimediaModelo $multimedia): ImagenProducto => new ImagenProducto(
                id: (int) $multimedia->id,
                ruta_archivo: $multimedia->ruta_archivo,
                orden: (int) $multimedia->pivot->orden,
                es_principal: (bool) $multimedia->pivot->es_principal,
            ))->all();

        $torta = $modelo->torta !== null ? new Torta(
            producto_id: (int) $modelo->torta->producto_id,
            tamano: $modelo->torta->tamano,
            porciones: (int) $modelo->torta->porciones,
            sabor: $modelo->torta->sabor,
            disenos: $modelo->torta->disenos
                ->map(fn (DisenoTortaModelo $diseno): DisenoTorta => $this->mapearDisenoTorta($diseno))
                ->all(),
        ) : null;
        $detalle = $modelo->detalle !== null ? new Detalle(
            producto_id: (int) $modelo->detalle->producto_id,
            stock: (int) $modelo->detalle->stock,
        ) : null;
        $sublimacion = $modelo->sublimacion !== null ? new Sublimacion(
            producto_id: (int) $modelo->sublimacion->producto_id,
            tipo_material: $modelo->sublimacion->tipo_material,
            plantillas: $modelo->sublimacion->plantillas
                ->map(fn (PlantillaDisenoModelo $plantilla): PlantillaDiseno => $this->mapearPlantilla($plantilla))
                ->all(),
        ) : null;

        return new Producto(
            id: (int) $modelo->id,
            categoria_id: (int) $modelo->categoria_id,
            categoria_nombre: $modelo->categoria->nombre,
            nombre: $modelo->nombre,
            descripcion: $modelo->descripcion,
            precio_base: (string) $modelo->precio_base,
            activo: (bool) $modelo->activo,
            creado_en: new DateTimeImmutable($modelo->creado_en->toDateTimeString()),
            actualizado_en: new DateTimeImmutable($modelo->actualizado_en->toDateTimeString()),
            imagenes: $imagenes,
            torta: $torta,
            detalle: $detalle,
            sublimacion: $sublimacion,
        );
    }

    private function mapearDisenoTorta(DisenoTortaModelo $modelo): DisenoTorta
    {
        return new DisenoTorta(
            id: (int) $modelo->id,
            torta_id: (int) $modelo->torta_id,
            nombre: $modelo->nombre,
            descripcion: $modelo->descripcion,
            costo_adicional: (string) $modelo->costo_adicional,
            multimedia_id: $modelo->multimedia_id !== null ? (int) $modelo->multimedia_id : null,
            activo: (bool) $modelo->activo,
        );
    }

    private function mapearPlantilla(PlantillaDisenoModelo $modelo): PlantillaDiseno
    {
        return new PlantillaDiseno(
            id: (int) $modelo->id,
            sublimacion_id: (int) $modelo->sublimacion_id,
            nombre: $modelo->nombre,
            descripcion: $modelo->descripcion,
            costo_adicional: (string) $modelo->costo_adicional,
            multimedia_id: $modelo->multimedia_id !== null ? (int) $modelo->multimedia_id : null,
            activo: (bool) $modelo->activo,
        );
    }

    private function mapearDisenoPersonalizado(DisenoPersonalizadoModelo $modelo): DisenoPersonalizado
    {
        return new DisenoPersonalizado(
            id: (int) $modelo->id,
            usuario_id: (int) $modelo->usuario_id,
            sublimacion_id: (int) $modelo->sublimacion_id,
            multimedia_id: (int) $modelo->multimedia_id,
            indicaciones: $modelo->indicaciones,
            creado_en: new DateTimeImmutable($modelo->creado_en->toDateTimeString()),
            actualizado_en: new DateTimeImmutable($modelo->actualizado_en->toDateTimeString()),
        );
    }
}
