<?php

declare(strict_types=1);

namespace App\Dominio\Produccion\Repositorios;

use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;

interface ConfiguracionProduccionRepositorioInterface
{
    /** @return list<ConfiguracionProduccion> */
    public function listar(array $filtros): array;

    public function buscarPorId(int $id): ?ConfiguracionProduccion;

    public function buscarDisponibilidad(string $fecha, ?int $categoriaId): ?ConfiguracionProduccion;

    public function crear(array $datos): ConfiguracionProduccion;

    public function actualizar(int $id, array $datos): ConfiguracionProduccion;

    public function desactivar(int $id): void;

    /**
     * Retorna cupos globales y especificos activos con bloqueo pesimista.
     * Debe ejecutarse dentro de la transaccion que finalmente crea el pedido.
     *
     * @param  list<int>  $categoriaIds
     * @return list<ConfiguracionProduccion>
     */
    public function obtenerActivasParaValidacion(string $fecha, array $categoriaIds): array;
}
