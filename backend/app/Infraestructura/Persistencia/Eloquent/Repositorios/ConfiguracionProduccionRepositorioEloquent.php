<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;
use App\Dominio\Produccion\Excepciones\ConfiguracionProduccionDuplicadaException;
use App\Dominio\Produccion\Excepciones\ConfiguracionProduccionNoEncontradaException;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionProduccionModelo;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

final class ConfiguracionProduccionRepositorioEloquent implements ConfiguracionProduccionRepositorioInterface
{
    public function listar(array $filtros): array
    {
        $query = ConfiguracionProduccionModelo::query();

        if (isset($filtros['fecha'])) {
            $query->whereDate('fecha', $filtros['fecha']);
        }
        if (isset($filtros['categoria_id'])) {
            $query->where('categoria_id', $filtros['categoria_id']);
        }
        if (isset($filtros['activo'])) {
            $query->where('activo', $filtros['activo']);
        }

        $modelos = $query
            ->orderBy('fecha')
            ->orderByRaw('categoria_id IS NULL DESC')
            ->orderBy('categoria_id')
            ->orderBy('id')
            ->get();
        $ocupaciones = $this->calcularOcupaciones($modelos->pluck('fecha')->map->format('Y-m-d')->unique()->all());

        return $modelos->map(
            fn (ConfiguracionProduccionModelo $modelo): ConfiguracionProduccion => $this->mapear(
                $modelo,
                $this->ocupadoDesdeMapa($ocupaciones, $modelo),
            ),
        )->all();
    }

    public function buscarPorId(int $id): ?ConfiguracionProduccion
    {
        $modelo = ConfiguracionProduccionModelo::find($id);

        return $modelo !== null
            ? $this->mapear($modelo, $this->calcularOcupado($modelo->fecha->format('Y-m-d'), $modelo->categoria_id))
            : null;
    }

    public function buscarDisponibilidad(string $fecha, ?int $categoriaId): ?ConfiguracionProduccion
    {
        $query = ConfiguracionProduccionModelo::query()
            ->whereDate('fecha', $fecha)
            ->where('activo', true);

        if ($categoriaId === null) {
            $query->whereNull('categoria_id');
        } else {
            $query->where(function (Builder $subquery) use ($categoriaId): void {
                $subquery->whereNull('categoria_id')->orWhere('categoria_id', $categoriaId);
            });
        }

        $ocupaciones = $this->calcularOcupaciones([$fecha]);
        $configuraciones = $query->get()->map(
            fn (ConfiguracionProduccionModelo $modelo): ConfiguracionProduccion => $this->mapear(
                $modelo,
                $this->ocupadoDesdeMapa($ocupaciones, $modelo),
            ),
        )->all();

        usort($configuraciones, static function (ConfiguracionProduccion $a, ConfiguracionProduccion $b): int {
            $porDisponible = $a->disponible() <=> $b->disponible();

            return $porDisponible !== 0 ? $porDisponible : ($b->categoria_id !== null) <=> ($a->categoria_id !== null);
        });

        return $configuraciones[0] ?? null;
    }

    public function crear(array $datos): ConfiguracionProduccion
    {
        $id = DB::transaction(function () use ($datos): int {
            if ($datos['activo']) {
                $this->bloquearClaves([[$datos['fecha'], $datos['categoria_id']]]);
                $this->validarUnicaActiva($datos['fecha'], $datos['categoria_id']);
            }

            return (int) ConfiguracionProduccionModelo::create($datos)->id;
        });

        return $this->buscarPorId($id) ?? throw new ConfiguracionProduccionNoEncontradaException;
    }

    public function actualizar(int $id, array $datos): ConfiguracionProduccion
    {
        DB::transaction(function () use ($id, $datos): void {
            $modelo = ConfiguracionProduccionModelo::query()->lockForUpdate()->find($id);

            if ($modelo === null) {
                throw new ConfiguracionProduccionNoEncontradaException;
            }

            $fecha = (string) ($datos['fecha'] ?? $modelo->fecha->format('Y-m-d'));
            $categoriaId = array_key_exists('categoria_id', $datos)
                ? $datos['categoria_id']
                : $modelo->categoria_id;
            $activo = (bool) ($datos['activo'] ?? $modelo->activo);

            $claves = [[$modelo->fecha->format('Y-m-d'), $modelo->categoria_id]];
            if ($activo) {
                $claves[] = [$fecha, $categoriaId];
            }
            $this->bloquearClaves($claves);

            if ($activo) {
                $this->validarUnicaActiva($fecha, $categoriaId, $id);
            }

            $modelo->update($datos);
        });

        return $this->buscarPorId($id) ?? throw new ConfiguracionProduccionNoEncontradaException;
    }

    public function desactivar(int $id): void
    {
        DB::transaction(function () use ($id): void {
            $modelo = ConfiguracionProduccionModelo::query()->lockForUpdate()->find($id);

            if ($modelo === null) {
                throw new ConfiguracionProduccionNoEncontradaException;
            }

            $this->bloquearClaves([[$modelo->fecha->format('Y-m-d'), $modelo->categoria_id]]);
            $modelo->update(['activo' => false]);
        });
    }

    public function obtenerActivasParaValidacion(string $fecha, array $categoriaIds): array
    {
        $modelos = ConfiguracionProduccionModelo::query()
            ->whereDate('fecha', $fecha)
            ->where('activo', true)
            ->where(function (Builder $query) use ($categoriaIds): void {
                $query->whereNull('categoria_id');
                if ($categoriaIds !== []) {
                    $query->orWhereIn('categoria_id', $categoriaIds);
                }
            })
            ->orderByRaw('categoria_id IS NULL DESC')
            ->orderBy('categoria_id')
            ->lockForUpdate()
            ->get();
        $ocupaciones = $this->calcularOcupaciones([$fecha]);

        return $modelos->map(
            fn (ConfiguracionProduccionModelo $modelo): ConfiguracionProduccion => $this->mapear(
                $modelo,
                $this->ocupadoDesdeMapa($ocupaciones, $modelo),
            ),
        )->all();
    }

    private function validarUnicaActiva(string $fecha, ?int $categoriaId, ?int $ignorarId = null): void
    {
        $query = ConfiguracionProduccionModelo::query()
            ->whereDate('fecha', $fecha)
            ->where('activo', true)
            ->when(
                $categoriaId === null,
                static fn (Builder $consulta): Builder => $consulta->whereNull('categoria_id'),
                static fn (Builder $consulta): Builder => $consulta->where('categoria_id', $categoriaId),
            );

        if ($ignorarId !== null) {
            $query->whereKeyNot($ignorarId);
        }

        if ($query->exists()) {
            throw new ConfiguracionProduccionDuplicadaException;
        }
    }

    /** @param list<array{0: string, 1: ?int}> $claves */
    private function bloquearClaves(array $claves): void
    {
        $unicas = [];
        foreach ($claves as [$fecha, $categoriaId]) {
            $unicas[$fecha.'|'.($categoriaId ?? 0)] = [$fecha, $categoriaId];
        }
        ksort($unicas);

        foreach ($unicas as [$fecha, $categoriaId]) {
            DB::select('SELECT pg_advisory_xact_lock(hashtext(?), ?)', [$fecha, $categoriaId ?? 0]);
        }
    }

    /** @param list<string> $fechas @return array<string, array<int|string, int>> */
    private function calcularOcupaciones(array $fechas): array
    {
        if ($fechas === []) {
            return [];
        }

        $filas = DB::table('detalles_pedido')
            ->join('pedidos', 'pedidos.id', '=', 'detalles_pedido.pedido_id')
            ->join('productos', 'productos.id', '=', 'detalles_pedido.producto_id')
            ->whereIn('pedidos.fecha_entrega', $fechas)
            ->where('pedidos.estado', '<>', 'ENTREGADO')
            ->groupBy('pedidos.fecha_entrega', 'productos.categoria_id')
            ->selectRaw('pedidos.fecha_entrega AS fecha, productos.categoria_id, SUM(detalles_pedido.cantidad) AS ocupado')
            ->get();

        $resultado = [];
        foreach ($filas as $fila) {
            $fecha = (string) $fila->fecha;
            $categoriaId = (int) $fila->categoria_id;
            $ocupado = (int) $fila->ocupado;
            $resultado[$fecha][$categoriaId] = $ocupado;
            $resultado[$fecha]['global'] = ($resultado[$fecha]['global'] ?? 0) + $ocupado;
        }

        return $resultado;
    }

    private function calcularOcupado(string $fecha, ?int $categoriaId): int
    {
        $ocupaciones = $this->calcularOcupaciones([$fecha]);

        return (int) ($ocupaciones[$fecha][$categoriaId ?? 'global'] ?? 0);
    }

    /** @param array<string, array<int|string, int>> $ocupaciones */
    private function ocupadoDesdeMapa(array $ocupaciones, ConfiguracionProduccionModelo $modelo): int
    {
        $fecha = $modelo->fecha->format('Y-m-d');

        return (int) ($ocupaciones[$fecha][$modelo->categoria_id ?? 'global'] ?? 0);
    }

    private function mapear(ConfiguracionProduccionModelo $modelo, int $ocupado): ConfiguracionProduccion
    {
        return new ConfiguracionProduccion(
            id: (int) $modelo->id,
            fecha: $modelo->fecha->format('Y-m-d'),
            categoria_id: $modelo->categoria_id !== null ? (int) $modelo->categoria_id : null,
            capacidad_maxima: (int) $modelo->capacidad_maxima,
            activo: (bool) $modelo->activo,
            ocupado: $ocupado,
            creado_en: DateTimeImmutable::createFromInterface($modelo->creado_en),
            actualizado_en: DateTimeImmutable::createFromInterface($modelo->actualizado_en),
        );
    }
}
