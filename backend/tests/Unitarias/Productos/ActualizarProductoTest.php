<?php

declare(strict_types=1);

namespace Tests\Unitarias\Productos;

use App\Aplicacion\Productos\CasosUso\ActualizarProducto;
use App\Aplicacion\Productos\CasosUso\CrearProducto;
use App\Aplicacion\Productos\DTOs\ActualizarProductoDTO;
use App\Aplicacion\Productos\DTOs\CrearProductoDTO;
use App\Dominio\Productos\Entidades\Detalle;
use App\Dominio\Productos\Entidades\Producto;
use App\Dominio\Productos\Excepciones\SublimacionSinPlantillaException;
use App\Dominio\Productos\Excepciones\TipoProductoInmutableException;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ActualizarProductoTest extends TestCase
{
    private ProductoRepositorioInterface&MockObject $repositorio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositorio = $this->createMock(ProductoRepositorioInterface::class);
    }

    public function test_rechaza_cambiar_el_tipo_del_producto(): void
    {
        $this->repositorio->method('buscarPorId')->willReturn($this->detalle());
        $this->repositorio->expects($this->never())->method('actualizar');

        $this->expectException(TipoProductoInmutableException::class);

        (new ActualizarProducto($this->repositorio))->execute(
            1,
            new ActualizarProductoDTO(['tipo' => 'TORTA']),
        );
    }

    public function test_sublimacion_nueva_no_puede_solicitarse_activa(): void
    {
        $this->repositorio->expects($this->never())->method('crear');
        $this->expectException(SublimacionSinPlantillaException::class);

        (new CrearProducto($this->repositorio))->execute(new CrearProductoDTO(
            categoria_id: 1,
            nombre: 'Taza',
            descripcion: null,
            precio_base: 10,
            activo: true,
            tipo: 'SUBLIMACION',
            torta: null,
            detalle: null,
            sublimacion: ['tipo_material' => 'Ceramica'],
            imagenes: [],
        ));
    }

    private function detalle(): Producto
    {
        $fecha = new DateTimeImmutable('2026-09-23 00:00:00');

        return new Producto(
            id: 1,
            categoria_id: 1,
            categoria_nombre: 'Detalles',
            nombre: 'Caja',
            descripcion: null,
            precio_base: '8.00',
            activo: true,
            creado_en: $fecha,
            actualizado_en: $fecha,
            imagenes: [],
            torta: null,
            detalle: new Detalle(1, 5),
            sublimacion: null,
        );
    }
}
