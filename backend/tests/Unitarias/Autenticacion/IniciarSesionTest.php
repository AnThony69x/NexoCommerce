<?php

declare(strict_types=1);

namespace Tests\Unitarias\Autenticacion;

use App\Aplicacion\Autenticacion\CasosUso\IniciarSesion;
use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Aplicacion\Autenticacion\DTOs\IniciarSesionDTO;
use App\Aplicacion\Autenticacion\DTOs\SesionIniciadaDTO;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Excepciones\CredencialesInvalidasException;
use App\Dominio\Autenticacion\Excepciones\CuentaBloqueadaException;
use App\Dominio\Autenticacion\Excepciones\UsuarioInactivoException;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class IniciarSesionTest extends TestCase
{
    private UsuarioRepositorioInterface&MockObject $usuarioRepo;

    private TokenServiceInterface&MockObject $tokenService;

    private IniciarSesion $caso;

    protected function setUp(): void
    {
        parent::setUp();

        $this->usuarioRepo = $this->createMock(UsuarioRepositorioInterface::class);
        $this->tokenService = $this->createMock(TokenServiceInterface::class);

        $this->caso = new IniciarSesion($this->usuarioRepo, $this->tokenService);
    }

    /** TC-03: Password incorrecto incrementa intentos_fallidos. */
    public function test_password_incorrecto_incrementa_intentos_fallidos(): void
    {
        $dto = new IniciarSesionDTO('juan@example.com', 'WrongPass', null);

        $this->usuarioRepo->method('buscarPorCorreo')
            ->willReturn($this->crearUsuario(intentos: 0, activo: true));

        $this->usuarioRepo->expects($this->once())
            ->method('actualizar')
            ->with(1, $this->arrayHasKey('intentos_fallidos'))
            ->willReturn($this->crearUsuario(intentos: 1, activo: true));

        $this->tokenService->expects($this->never())->method('emitir');

        $this->expectException(CredencialesInvalidasException::class);

        $this->caso->execute($dto);
    }

    /** TC-04: Al quinto fallo consecutivo, bloquea la cuenta (bloqueado_hasta) y lanza 429. */
    public function test_quinto_intento_fallido_bloquea_y_lanza_429(): void
    {
        $dto = new IniciarSesionDTO('juan@example.com', 'WrongPass', null);

        $this->usuarioRepo->method('buscarPorCorreo')
            ->willReturn($this->crearUsuario(intentos: 4, activo: true));

        $this->usuarioRepo->expects($this->once())
            ->method('actualizar')
            ->with(1, $this->callback(function ($datos) {
                return isset($datos['bloqueado_hasta']) && isset($datos['intentos_fallidos'])
                    && $datos['intentos_fallidos'] === 5;
            }))
            ->willReturn($this->crearUsuario(intentos: 5, activo: true, bloqueadoHasta: new DateTimeImmutable('+15 minutes')));

        $this->expectException(CuentaBloqueadaException::class);

        $this->caso->execute($dto);
    }

    /** Login en cuenta ya bloqueada responde inmediatamente con 429. */
    public function test_cuenta_bloqueada_lanza_excepcion_429(): void
    {
        $dto = new IniciarSesionDTO('juan@example.com', 'Pass', null);

        $this->usuarioRepo->method('buscarPorCorreo')
            ->willReturn($this->crearUsuario(
                intentos: 5,
                activo: true,
                bloqueadoHasta: new DateTimeImmutable('+10 minutes'),
            ));

        $this->tokenService->expects($this->never())->method('emitir');

        $this->expectException(CuentaBloqueadaException::class);

        $this->caso->execute($dto);
    }

    /** Login exitoso reinicia intentos_fallidos a 0 y emite token. */
    public function test_login_exitoso_reinicia_intentos_y_emite_token(): void
    {
        $passwordPlano = 'Password123*';
        $passwordHasheado = password_hash($passwordPlano, PASSWORD_BCRYPT);

        $dto = new IniciarSesionDTO('juan@example.com', $passwordPlano, 'TestDevice');

        $usuarioConPassword = $this->crearUsuario(intentos: 2, activo: true, hash: $passwordHasheado);

        $this->usuarioRepo->method('buscarPorCorreo')->willReturn($usuarioConPassword);

        $usuarioReiniciado = $this->crearUsuario(intentos: 0, activo: true, hash: $passwordHasheado);

        $this->usuarioRepo->expects($this->once())
            ->method('actualizar')
            ->with(1, ['intentos_fallidos' => 0, 'bloqueado_hasta' => null])
            ->willReturn($usuarioReiniciado);

        $this->tokenService->expects($this->once())
            ->method('emitir')
            ->with(1, 'TestDevice')
            ->willReturn('mi_token');

        $resultado = $this->caso->execute($dto);

        $this->assertInstanceOf(SesionIniciadaDTO::class, $resultado);
        $this->assertSame('mi_token', $resultado->token);
        $this->assertSame(0, $resultado->usuario->intentos_fallidos);
    }

    /** Usuario inactivo lanza 403. */
    public function test_usuario_inactivo_lanza_403(): void
    {
        $dto = new IniciarSesionDTO('juan@example.com', 'pass', null);

        $this->usuarioRepo->method('buscarPorCorreo')
            ->willReturn($this->crearUsuario(intentos: 0, activo: false));

        $this->expectException(UsuarioInactivoException::class);

        $this->caso->execute($dto);
    }

    // -------------------------------------------------------------------------

    private function crearUsuario(
        int $intentos = 0,
        bool $activo = true,
        ?DateTimeImmutable $bloqueadoHasta = null,
        ?string $hash = 'invalid_hash',
    ): Usuario {
        return new Usuario(
            id: 1,
            rol_id: 2,
            nombre_completo: 'Juan',
            correo: 'juan@example.com',
            telefono: null,
            password_hash: $hash,
            correo_verificado: true,
            intentos_fallidos: $intentos,
            bloqueado_hasta: $bloqueadoHasta,
            terminos_aceptados: true,
            version_terminos: '1.0',
            terminos_aceptados_en: null,
            activo: $activo,
            creado_en: new DateTimeImmutable,
            actualizado_en: new DateTimeImmutable,
            rol: 'CLIENTE',
        );
    }
}
