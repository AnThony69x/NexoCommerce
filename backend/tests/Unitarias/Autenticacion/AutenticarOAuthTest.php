<?php

declare(strict_types=1);

namespace Tests\Unitarias\Autenticacion;

use App\Aplicacion\Autenticacion\CasosUso\AutenticarOAuth;
use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Aplicacion\Autenticacion\DTOs\OAuthDTO;
use App\Aplicacion\Autenticacion\DTOs\SesionIniciadaDTO;
use App\Dominio\Autenticacion\Entidades\CuentaOAuth;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Repositorios\CuentaOAuthRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class AutenticarOAuthTest extends TestCase
{
    private UsuarioRepositorioInterface&MockObject $usuarioRepo;

    private CuentaOAuthRepositorioInterface&MockObject $oauthRepo;

    private TokenServiceInterface&MockObject $tokenService;

    private AutenticarOAuth $caso;

    protected function setUp(): void
    {
        parent::setUp();

        $this->usuarioRepo = $this->createMock(UsuarioRepositorioInterface::class);
        $this->oauthRepo = $this->createMock(CuentaOAuthRepositorioInterface::class);
        $this->tokenService = $this->createMock(TokenServiceInterface::class);

        $this->caso = new AutenticarOAuth($this->usuarioRepo, $this->oauthRepo, $this->tokenService);
    }

    /** Rama 1: par (proveedor, id_proveedor) ya existe → login directo. */
    public function test_rama1_par_oauth_existente_inicia_sesion(): void
    {
        $dto = $this->crearDTO();

        $cuentaOAuth = new CuentaOAuth(1, 10, 'GOOGLE', '12345', new DateTimeImmutable, new DateTimeImmutable);

        $this->oauthRepo->method('buscarPorProveedor')
            ->with('GOOGLE', '12345')
            ->willReturn($cuentaOAuth);

        $this->usuarioRepo->method('buscarPorId')
            ->with(10)
            ->willReturn($this->crearUsuario(id: 10));

        $this->oauthRepo->expects($this->never())->method('vincular');
        $this->usuarioRepo->expects($this->never())->method('guardar');

        $this->tokenService->method('emitir')->willReturn('tok_rama1');

        $resultado = $this->caso->execute($dto);

        $this->assertInstanceOf(SesionIniciadaDTO::class, $resultado);
        $this->assertSame('tok_rama1', $resultado->token);
    }

    /** Rama 2: par no existe pero correo ya existe → vincular y login. */
    public function test_rama2_correo_existente_vincula_oauth_y_login(): void
    {
        $dto = $this->crearDTO();

        $this->oauthRepo->method('buscarPorProveedor')->willReturn(null);
        $this->usuarioRepo->method('buscarPorCorreo')->willReturn($this->crearUsuario(id: 5));

        $cuentaVinculada = new CuentaOAuth(2, 5, 'GOOGLE', '12345', new DateTimeImmutable, new DateTimeImmutable);

        $this->oauthRepo->expects($this->once())
            ->method('vincular')
            ->with(5, 'GOOGLE', '12345')
            ->willReturn($cuentaVinculada);

        $this->usuarioRepo->expects($this->never())->method('guardar');

        $this->tokenService->method('emitir')->willReturn('tok_rama2');

        $resultado = $this->caso->execute($dto);

        $this->assertSame('tok_rama2', $resultado->token);
    }

    /** Rama 3: nada existe → crear usuario + vincular OAuth + login. */
    public function test_rama3_todo_nuevo_crea_usuario_y_vincula_oauth(): void
    {
        $dto = $this->crearDTO();

        $this->oauthRepo->method('buscarPorProveedor')->willReturn(null);
        $this->usuarioRepo->method('buscarPorCorreo')->willReturn(null);
        $this->usuarioRepo->method('buscarRolIdPorNombre')->with('CLIENTE')->willReturn(2);

        $nuevoUsuario = $this->crearUsuario(id: 99);

        $this->usuarioRepo->expects($this->once())
            ->method('guardar')
            ->with($this->callback(function ($datos) {
                return $datos['correo_verificado'] === true
                    && $datos['password_hash'] === null;
            }))
            ->willReturn($nuevoUsuario);

        $cuentaVinculada = new CuentaOAuth(3, 99, 'GOOGLE', '12345', new DateTimeImmutable, new DateTimeImmutable);

        $this->oauthRepo->expects($this->once())
            ->method('vincular')
            ->with(99, 'GOOGLE', '12345')
            ->willReturn($cuentaVinculada);

        $this->tokenService->method('emitir')->willReturn('tok_rama3');

        $resultado = $this->caso->execute($dto);

        $this->assertSame('tok_rama3', $resultado->token);
        $this->assertTrue($resultado->usuario->correo_verificado);
    }

    // -------------------------------------------------------------------------

    private function crearDTO(): OAuthDTO
    {
        return new OAuthDTO(
            proveedor: 'GOOGLE',
            id_proveedor: '12345',
            nombre_completo: 'Juan OAuth',
            correo: 'juan@gmail.com',
            terminos_aceptados: true,
            version_terminos: '1.0',
        );
    }

    private function crearUsuario(int $id = 1): Usuario
    {
        return new Usuario(
            id: $id,
            rol_id: 2,
            nombre_completo: 'Juan OAuth',
            correo: 'juan@gmail.com',
            telefono: null,
            password_hash: null,
            correo_verificado: true,
            intentos_fallidos: 0,
            bloqueado_hasta: null,
            terminos_aceptados: true,
            version_terminos: '1.0',
            terminos_aceptados_en: new DateTimeImmutable,
            activo: true,
            creado_en: new DateTimeImmutable,
            actualizado_en: new DateTimeImmutable,
            rol: 'CLIENTE',
        );
    }
}
