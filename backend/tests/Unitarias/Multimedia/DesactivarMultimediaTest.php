<?php

declare(strict_types=1);

namespace Tests\Unitarias\Multimedia;

use App\Aplicacion\Multimedia\CasosUso\DesactivarMultimedia;
use App\Dominio\Multimedia\Entidades\Multimedia;
use App\Dominio\Multimedia\Excepciones\MultimediaEnUsoException;
use App\Dominio\Multimedia\Excepciones\MultimediaNoAutorizadaException;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class DesactivarMultimediaTest extends TestCase
{
    private MultimediaRepositorioInterface&MockObject $multimediaRepo;

    private DesactivarMultimedia $caso;

    protected function setUp(): void
    {
        parent::setUp();

        $this->multimediaRepo = $this->createMock(MultimediaRepositorioInterface::class);
        $this->caso = new DesactivarMultimedia($this->multimediaRepo);
    }

    public function test_dueno_no_puede_desactivar_multimedia_en_uso(): void
    {
        $multimedia = $this->multimedia(subidoPorId: 7);

        $this->multimediaRepo
            ->expects($this->once())
            ->method('buscarPorId')
            ->willReturn($multimedia);
        $this->multimediaRepo
            ->expects($this->once())
            ->method('estaEnUsoRestrict')
            ->with(1)
            ->willReturn(true);
        $this->multimediaRepo
            ->expects($this->never())
            ->method('desactivar');

        try {
            $this->caso->execute(1, 7, false);
            $this->fail('Se esperaba MultimediaEnUsoException.');
        } catch (MultimediaEnUsoException $exception) {
            $this->assertSame('MED_EN_USO', $exception->codigo_error);
            $this->assertSame(400, $exception->httpStatus);
        }
    }

    public function test_usuario_distinto_al_dueno_no_puede_desactivar(): void
    {
        $multimedia = $this->multimedia(subidoPorId: 7);

        $this->multimediaRepo
            ->expects($this->once())
            ->method('buscarPorId')
            ->willReturn($multimedia);
        $this->multimediaRepo
            ->expects($this->never())
            ->method('estaEnUsoRestrict');
        $this->multimediaRepo
            ->expects($this->never())
            ->method('desactivar');

        $this->expectException(MultimediaNoAutorizadaException::class);

        $this->caso->execute(1, 8, false);
    }

    private function multimedia(int $subidoPorId): Multimedia
    {
        $fecha = new DateTimeImmutable('2026-09-23T00:00:00Z');

        return new Multimedia(
            id: 1,
            nombre_archivo: 'foto.png',
            ruta_archivo: 'productos/20260923_foto.png',
            tipo_mime: 'image/png',
            tamano_bytes: 1024,
            ancho: 100,
            alto: 100,
            activo: true,
            subido_por_id: $subidoPorId,
            creado_en: $fecha,
            actualizado_en: $fecha,
        );
    }
}
