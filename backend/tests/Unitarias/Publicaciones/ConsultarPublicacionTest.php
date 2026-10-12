<?php

declare(strict_types=1);

namespace Tests\Unitarias\Publicaciones;

use App\Aplicacion\Publicaciones\CasosUso\ConsultarPublicacion;
use App\Dominio\Publicaciones\Entidades\Publicacion;
use App\Dominio\Publicaciones\Excepciones\PublicacionNoEncontradaException;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ConsultarPublicacionTest extends TestCase
{
    private PublicacionRepositorioInterface&MockObject $repositorio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositorio = $this->createMock(PublicacionRepositorioInterface::class);
    }

    public function test_admin_puede_consultar_una_publicacion_inactiva(): void
    {
        $publicacion = $this->publicacionInactiva();
        $this->repositorio->expects($this->once())
            ->method('buscarPorId')
            ->with(1, false)
            ->willReturn($publicacion);

        $resultado = (new ConsultarPublicacion($this->repositorio))->execute(1, true);

        $this->assertSame($publicacion, $resultado);
    }

    public function test_publico_recibe_excepcion_si_la_publicacion_no_esta_activa(): void
    {
        $this->repositorio->expects($this->once())
            ->method('buscarPorId')
            ->with(1, true)
            ->willReturn(null);
        $this->expectException(PublicacionNoEncontradaException::class);

        (new ConsultarPublicacion($this->repositorio))->execute(1);
    }

    private function publicacionInactiva(): Publicacion
    {
        $fecha = new DateTimeImmutable('2026-09-23 00:00:00');

        return new Publicacion(
            id: 1,
            usuario_id: 1,
            categoria_id: null,
            producto_id: null,
            titulo: 'Borrador',
            descripcion: null,
            activo: false,
            creado_en: $fecha,
            actualizado_en: $fecha,
            imagenes: [],
        );
    }
}
