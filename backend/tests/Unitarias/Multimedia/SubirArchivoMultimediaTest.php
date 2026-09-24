<?php

declare(strict_types=1);

namespace Tests\Unitarias\Multimedia;

use App\Aplicacion\Multimedia\CasosUso\SubirArchivoMultimedia;
use App\Aplicacion\Multimedia\Contratos\AlmacenamientoArchivosInterface;
use App\Aplicacion\Multimedia\DTOs\SubirMultimediaDTO;
use App\Dominio\Multimedia\Entidades\Multimedia;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class SubirArchivoMultimediaTest extends TestCase
{
    private MultimediaRepositorioInterface&MockObject $multimediaRepo;

    private AlmacenamientoArchivosInterface&MockObject $almacenamiento;

    private SubirArchivoMultimedia $caso;

    protected function setUp(): void
    {
        parent::setUp();

        $this->multimediaRepo = $this->createMock(MultimediaRepositorioInterface::class);
        $this->almacenamiento = $this->createMock(AlmacenamientoArchivosInterface::class);

        $this->caso = new SubirArchivoMultimedia(
            $this->multimediaRepo,
            $this->almacenamiento,
        );
    }

    private function entidadFalsa(string $ruta = 'productos/test.png', ?int $ancho = null, ?int $alto = null): Multimedia
    {
        return new Multimedia(
            id: 1,
            nombre_archivo: 'foto.png',
            ruta_archivo: $ruta,
            tipo_mime: 'image/png',
            tamano_bytes: 1024,
            ancho: $ancho,
            alto: $alto,
            activo: true,
            subido_por_id: 5,
            creado_en: new DateTimeImmutable('2026-01-01T00:00:00Z'),
            actualizado_en: new DateTimeImmutable('2026-01-01T00:00:00Z'),
        );
    }

    /**
     * TC-U-MED-01: Subir un PDF (no imagen) no intenta leer dimensiones.
     * El repositorio debe recibir ancho = null, alto = null.
     */
    public function test_subir_pdf_persiste_sin_dimensiones(): void
    {
        $dto = new SubirMultimediaDTO(
            destino: 'comprobantes',
            nombre_original: 'comprobante.pdf',
            extension: 'pdf',
            tipo_mime: 'application/pdf',
            tamano_bytes: 2048,
            contenido_binario: '%PDF-1.4 fake content',
            subido_por_id: 5,
        );

        $this->almacenamiento
            ->expects($this->once())
            ->method('guardar')
            ->willReturnCallback(fn (string $ruta) => $ruta);

        $this->multimediaRepo
            ->expects($this->once())
            ->method('guardar')
            ->with($this->callback(function (array $datos): bool {
                return $datos['tipo_mime'] === 'application/pdf'
                    && $datos['ancho'] === null
                    && $datos['alto'] === null
                    && $datos['activo'] === true;
            }))
            ->willReturn($this->entidadFalsa('comprobantes/20260101_fake.pdf'));

        $resultado = $this->caso->execute($dto);

        $this->assertInstanceOf(Multimedia::class, $resultado);
        $this->assertTrue($resultado->estaActivo());
    }

    /**
     * TC-U-MED-02: El repositorio siempre recibe el id del usuario autenticado.
     */
    public function test_subido_por_id_se_pasa_al_repositorio(): void
    {
        $dto = new SubirMultimediaDTO(
            destino: 'categorias',
            nombre_original: 'banner.png',
            extension: 'png',
            tipo_mime: 'image/png',
            tamano_bytes: 512,
            contenido_binario: 'fake image bytes',
            subido_por_id: 42,
        );

        $this->almacenamiento
            ->method('guardar')
            ->willReturnCallback(fn (string $ruta) => $ruta);

        $this->multimediaRepo
            ->expects($this->once())
            ->method('guardar')
            ->with($this->callback(fn (array $datos) => $datos['subido_por_id'] === 42))
            ->willReturn($this->entidadFalsa());

        $this->caso->execute($dto);
    }
}
