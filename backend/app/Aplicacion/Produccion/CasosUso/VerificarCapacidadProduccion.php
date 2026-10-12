<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\CasosUso;

use App\Aplicacion\Produccion\DTOs\SolicitudCapacidadProduccionDTO;
use App\Dominio\Produccion\Excepciones\CapacidadProduccionExcedidaException;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;

final readonly class VerificarCapacidadProduccion
{
    public function __construct(private ConfiguracionProduccionRepositorioInterface $repositorio) {}

    public function execute(SolicitudCapacidadProduccionDTO $solicitud): void
    {
        $categorias = array_map('intval', array_keys($solicitud->cantidades_por_categoria));
        $configuraciones = $this->repositorio->obtenerActivasParaValidacion(
            $solicitud->fecha,
            $categorias,
        );

        $global = null;
        $categoriasConfiguradas = [];
        foreach ($configuraciones as $configuracion) {
            if ($configuracion->categoria_id === null) {
                $global = $configuracion;
            } else {
                $categoriasConfiguradas[$configuracion->categoria_id] = true;
            }
        }

        foreach ($solicitud->categorias_torta as $categoriaTorta) {
            if ($global === null && ! isset($categoriasConfiguradas[$categoriaTorta])) {
                throw new CapacidadProduccionExcedidaException;
            }
        }

        $cantidadGlobal = array_sum($solicitud->cantidades_por_categoria);
        foreach ($configuraciones as $configuracion) {
            $cantidad = $configuracion->categoria_id === null
                ? $cantidadGlobal
                : ($solicitud->cantidades_por_categoria[$configuracion->categoria_id] ?? 0);

            if (! $configuracion->admite($cantidad)) {
                throw new CapacidadProduccionExcedidaException;
            }
        }
    }
}
