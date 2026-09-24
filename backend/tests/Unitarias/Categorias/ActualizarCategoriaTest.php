<?php

declare(strict_types=1);

namespace Tests\Unitarias\Categorias;

use App\Aplicacion\Categorias\CasosUso\ActualizarCategoria;
use App\Aplicacion\Categorias\DTOs\ActualizarCategoriaDTO;
use App\Dominio\Categorias\Entidades\Categoria;
use App\Dominio\Categorias\Excepciones\CategoriaPadreInvalidaException;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ActualizarCategoriaTest extends TestCase
{
    private CategoriaRepositorioInterface&MockObject $categoriaRepo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categoriaRepo = $this->createMock(CategoriaRepositorioInterface::class);
    }

    public function test_rechaza_asignar_un_descendiente_como_padre(): void
    {
        $this->categoriaRepo->method('buscarPorId')->willReturn($this->categoria());
        $this->categoriaRepo->method('mapaPadres')->willReturn([
            1 => null,
            2 => 1,
            3 => 2,
        ]);
        $this->categoriaRepo->expects($this->never())->method('actualizar');

        $this->expectException(CategoriaPadreInvalidaException::class);

        (new ActualizarCategoria($this->categoriaRepo))->execute(1, new ActualizarCategoriaDTO(
            nombre: 'Raiz',
            incluye_categoria_padre_id: true,
            categoria_padre_id: 3,
            incluye_descripcion: false,
            descripcion: null,
            incluye_imagen_id: false,
            imagen_id: null,
            activo: null,
        ));
    }

    public function test_solo_actualiza_los_campos_opcionales_presentes(): void
    {
        $categoria = $this->categoria();
        $this->categoriaRepo->method('buscarPorId')->willReturn($categoria);
        $this->categoriaRepo->expects($this->once())
            ->method('actualizar')
            ->with(1, ['nombre' => 'Nuevo nombre'])
            ->willReturn($categoria);

        (new ActualizarCategoria($this->categoriaRepo))->execute(1, new ActualizarCategoriaDTO(
            nombre: 'Nuevo nombre',
            incluye_categoria_padre_id: false,
            categoria_padre_id: null,
            incluye_descripcion: false,
            descripcion: null,
            incluye_imagen_id: false,
            imagen_id: null,
            activo: null,
        ));
    }

    private function categoria(): Categoria
    {
        $fecha = new DateTimeImmutable('2026-09-23T00:00:00Z');

        return new Categoria(
            id: 1,
            categoria_padre_id: null,
            nombre: 'Raiz',
            descripcion: 'Descripcion',
            imagen_id: null,
            activo: true,
            creado_en: $fecha,
            actualizado_en: $fecha,
        );
    }
}
