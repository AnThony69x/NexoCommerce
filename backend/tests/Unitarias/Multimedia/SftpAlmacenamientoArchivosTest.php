<?php

declare(strict_types=1);

namespace Tests\Unitarias\Multimedia;

use App\Dominio\Compartido\Excepciones\DominioException;
use App\Infraestructura\Almacenamiento\SftpAlmacenamientoArchivos;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SftpAlmacenamientoArchivosTest extends TestCase
{
    public function test_servidor_inaccesible_responde_503_controlado(): void
    {
        config(['filesystems.disks.multimedia_sftp' => [
            'driver' => 'sftp',
            'host' => '127.0.0.1',
            'port' => 1,
            'username' => 'prueba',
            'password' => 'prueba',
            'root' => '/srv/nexocommerce',
            'timeout' => 1,
            'throw' => true,
        ]]);
        Storage::forgetDisk('multimedia_sftp');

        try {
            (new SftpAlmacenamientoArchivos)->leer('productos/demo.png');
            $this->fail('Se esperaba DominioException al no alcanzar el servidor SFTP.');
        } catch (DominioException $excepcion) {
            $this->assertSame(503, $excepcion->httpStatus);
            $this->assertSame('MUL_ALMACENAMIENTO_NO_DISPONIBLE', $excepcion->codigo_error);
        }
    }
}
