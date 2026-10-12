<?php

declare(strict_types=1);

namespace Tests\Unitarias\Tienda;

use App\Aplicacion\Tienda\CasosUso\ActualizarConfiguracionTienda;
use App\Aplicacion\Tienda\CasosUso\ObtenerConfiguracionTienda;
use App\Aplicacion\Tienda\DTOs\ActualizarConfiguracionTiendaDTO;
use App\Dominio\Tienda\Entidades\ConfiguracionTienda;
use App\Dominio\Tienda\Excepciones\ConfiguracionTiendaNoEncontradaException;
use App\Dominio\Tienda\Repositorios\ConfiguracionTiendaRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ConfiguracionTiendaTest extends TestCase
{
    private ConfiguracionTiendaRepositorioInterface&MockObject $configuracionRepo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->configuracionRepo = $this->createMock(ConfiguracionTiendaRepositorioInterface::class);
    }

    public function test_obtener_configuracion_activa(): void
    {
        $configuracion = $this->configuracion();
        $this->configuracionRepo->expects($this->once())
            ->method('buscarActiva')
            ->willReturn($configuracion);

        $resultado = (new ObtenerConfiguracionTienda($this->configuracionRepo))->execute();

        $this->assertSame($configuracion, $resultado);
    }

    public function test_obtener_sin_fila_activa_lanza_404_de_dominio(): void
    {
        $this->configuracionRepo->method('buscarActiva')->willReturn(null);

        try {
            (new ObtenerConfiguracionTienda($this->configuracionRepo))->execute();
            $this->fail('Se esperaba ConfiguracionTiendaNoEncontradaException.');
        } catch (ConfiguracionTiendaNoEncontradaException $exception) {
            $this->assertSame('TND_NO_ENCONTRADA', $exception->codigo_error);
            $this->assertSame(404, $exception->httpStatus);
        }
    }

    public function test_actualizar_forza_activo_true_y_no_crea(): void
    {
        $configuracion = $this->configuracion();
        $dto = new ActualizarConfiguracionTiendaDTO(
            nombre_tienda: 'Nueva Tienda',
            logo_url: null,
            favicon_url: null,
            color_primario: '#000000',
            color_secundario: '#FFFFFF',
            color_acento: null,
            color_fondo: null,
            color_texto: null,
            telefono: null,
            correo: null,
            direccion: null,
            activo: false,
        );

        $this->configuracionRepo->method('buscarActiva')->willReturn($configuracion);
        $this->configuracionRepo->expects($this->once())
            ->method('actualizar')
            ->with(1, $this->callback(
                static fn (array $datos): bool => $datos['nombre_tienda'] === 'Nueva Tienda'
                    && $datos['activo'] === true,
            ))
            ->willReturn($configuracion);

        (new ActualizarConfiguracionTienda($this->configuracionRepo))->execute($dto);
    }

    private function configuracion(): ConfiguracionTienda
    {
        $fecha = new DateTimeImmutable('2026-09-23T00:00:00Z');

        return new ConfiguracionTienda(
            id: 1,
            nombre_tienda: 'Dulces Aesca',
            logo_url: null,
            favicon_url: null,
            color_primario: '#8B5CF6',
            color_secundario: '#EC4899',
            color_acento: '#F59E0B',
            color_fondo: '#FFF7ED',
            color_texto: '#1F2937',
            telefono: null,
            correo: null,
            direccion: null,
            activo: true,
            creado_en: $fecha,
            actualizado_en: $fecha,
        );
    }
}
