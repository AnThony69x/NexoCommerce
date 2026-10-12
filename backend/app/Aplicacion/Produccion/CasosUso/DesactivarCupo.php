<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\CasosUso;

use App\Dominio\Produccion\Excepciones\ConfiguracionProduccionNoEncontradaException;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;

final readonly class DesactivarCupo
{
    public function __construct(private ConfiguracionProduccionRepositorioInterface $repositorio) {}

    public function execute(int $id): void
    {
        if ($this->repositorio->buscarPorId($id) === null) {
            throw new ConfiguracionProduccionNoEncontradaException;
        }

        $this->repositorio->desactivar($id);
    }
}
