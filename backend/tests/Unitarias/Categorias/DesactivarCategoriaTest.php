<?php

declare(strict_types=1);

namespace Tests\Unitarias\Categorias;

use App\Aplicacion\Categorias\CasosUso\DesactivarCategoria;
use App\Dominio\Categorias\Entidades\Categoria;
use App\Dominio\Categorias\Excepciones\CategoriaConProductosException;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class DesactivarCategoriaTest extends TestCase
{
    private CategoriaRepositorioInterface&MockObject $categoriaRepo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categoriaRepo = $this->createMock(CategoriaRepositorioInterface::class);
    }

    public function test_no_desactiva_categoria_con_productos_activos(): void
    {
        $fecha = new DateTimeImmutable('2026-09-23T00:00:00Z');
        $categoria = new Categoria(
            id: 1,
            categoria_padre_id: null,
            nombre: 'Reposteria',
            descripcion: null,
            imagen_id: null,
            activo: true,
            creado_en: $fecha,
            actualizado_en: $fecha,
        );

        $this->categoriaRepo->method('buscarPorId')->willReturn($categoria);
        $this->categoriaRepo->method('tieneProductosActivos')->willReturn(true);
        $this->categoriaRepo->expects($this->never())->method('desactivar');

        try {
            (new DesactivarCategoria($this->categoriaRepo))->execute(1);
            $this->fail('Se esperaba CategoriaConProductosException.');
        } catch (CategoriaConProductosException $exception) {
            $this->assertSame('CAT_CON_PRODUCTOS', $exception->codigo_error);
            $this->assertSame(400, $exception->httpStatus);
        }
    }
}
