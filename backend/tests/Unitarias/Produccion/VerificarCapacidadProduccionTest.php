<?php

declare(strict_types=1);

namespace Tests\Unitarias\Produccion;

use App\Aplicacion\Produccion\CasosUso\VerificarCapacidadProduccion;
use App\Aplicacion\Produccion\DTOs\SolicitudCapacidadProduccionDTO;
use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;
use App\Dominio\Produccion\Excepciones\CapacidadProduccionExcedidaException;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class VerificarCapacidadProduccionTest extends TestCase
{
    private ConfiguracionProduccionRepositorioInterface&MockObject $repositorio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositorio = $this->createMock(ConfiguracionProduccionRepositorioInterface::class);
    }

    public function test_rechaza_si_el_cupo_especifico_es_mas_restrictivo_que_el_global(): void
    {
        $this->repositorio->method('obtenerActivasParaValidacion')->willReturn([
            $this->configuracion(null, 20, 5),
            $this->configuracion(2, 8, 5),
        ]);
        $this->expectException(CapacidadProduccionExcedidaException::class);

        (new VerificarCapacidadProduccion($this->repositorio))->execute(
            new SolicitudCapacidadProduccionDTO('2026-10-01', [2 => 4], [2]),
        );
    }

    public function test_torta_sin_cupo_global_ni_especifico_es_rechazada(): void
    {
        $this->repositorio->method('obtenerActivasParaValidacion')->willReturn([]);
        $this->expectException(CapacidadProduccionExcedidaException::class);

        (new VerificarCapacidadProduccion($this->repositorio))->execute(
            new SolicitudCapacidadProduccionDTO('2026-10-01', [2 => 1], [2]),
        );
    }

    public function test_producto_no_torta_sin_configuracion_puede_continuar(): void
    {
        $this->repositorio->method('obtenerActivasParaValidacion')->willReturn([]);

        (new VerificarCapacidadProduccion($this->repositorio))->execute(
            new SolicitudCapacidadProduccionDTO('2026-10-01', [3 => 2], []),
        );

        $this->addToAssertionCount(1);
    }

    public function test_disponible_nunca_es_negativo(): void
    {
        $configuracion = $this->configuracion(null, 5, 8);

        $this->assertSame(0, $configuracion->disponible());
        $this->assertFalse($configuracion->admite(1));
    }

    private function configuracion(?int $categoriaId, int $capacidad, int $ocupado): ConfiguracionProduccion
    {
        $fecha = new DateTimeImmutable('2026-09-23 00:00:00');

        return new ConfiguracionProduccion(
            id: $categoriaId ?? 1,
            fecha: '2026-10-01',
            categoria_id: $categoriaId,
            capacidad_maxima: $capacidad,
            activo: true,
            ocupado: $ocupado,
            creado_en: $fecha,
            actualizado_en: $fecha,
        );
    }
}
