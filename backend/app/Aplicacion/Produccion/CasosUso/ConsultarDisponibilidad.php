<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\CasosUso;

use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;
use App\Dominio\Produccion\Excepciones\ConfiguracionProduccionNoEncontradaException;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;

final readonly class ConsultarDisponibilidad
{
    public function __construct(private ConfiguracionProduccionRepositorioInterface $repositorio) {}

    public function execute(string $fecha, ?int $categoriaId): ConfiguracionProduccion
    {
        return $this->repositorio->buscarDisponibilidad($fecha, $categoriaId)
            ?? throw new ConfiguracionProduccionNoEncontradaException;
    }
}
