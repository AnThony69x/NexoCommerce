<?php

declare(strict_types=1);

namespace Tests\Unitarias\Categorias;

use App\Aplicacion\Categorias\CasosUso\ListarArbolCategorias;
use App\Dominio\Categorias\Entidades\Categoria;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ListarArbolCategoriasTest extends TestCase
{
    private CategoriaRepositorioInterface&MockObject $categoriaRepo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categoriaRepo = $this->createMock(CategoriaRepositorioInterface::class);
    }

    public function test_construye_arbol_y_oculta_hijo_sin_padre_visible(): void
    {
        $this->categoriaRepo->expects($this->once())
            ->method('listar')
            ->with(true)
            ->willReturn([
                $this->categoria(1, null, 'Raiz'),
                $this->categoria(2, 1, 'Hija'),
                $this->categoria(4, 3, 'Hija de padre inactivo'),
                $this->categoria(5, null, 'Otra raiz'),
            ]);

        $resultado = (new ListarArbolCategorias($this->categoriaRepo))->execute();

        $this->assertCount(2, $resultado);
        $this->assertSame(1, $resultado[0]->categoria->id);
        $this->assertSame(2, $resultado[0]->subcategorias[0]->categoria->id);
        $this->assertSame([], $resultado[1]->subcategorias);
    }

    private function categoria(int $id, ?int $padreId, string $nombre): Categoria
    {
        $fecha = new DateTimeImmutable('2026-09-23T00:00:00Z');

        return new Categoria(
            id: $id,
            categoria_padre_id: $padreId,
            nombre: $nombre,
            descripcion: null,
            imagen_id: null,
            activo: true,
            creado_en: $fecha,
            actualizado_en: $fecha,
        );
    }
}
