<?php

declare(strict_types=1);

namespace Tests\Unitarias\Autenticacion;

use App\Aplicacion\Autenticacion\CasosUso\RegistrarCliente;
use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Aplicacion\Autenticacion\DTOs\RegistrarClienteDTO;
use App\Aplicacion\Autenticacion\DTOs\SesionIniciadaDTO;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Entidades\VerificacionCorreo;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class RegistrarClienteTest extends TestCase
{
    private UsuarioRepositorioInterface&MockObject $usuarioRepo;

    private VerificacionCorreoRepositorioInterface&MockObject $verificacionRepo;

    private TokenServiceInterface&MockObject $tokenService;

    private RegistrarCliente $caso;

    protected function setUp(): void
    {
        parent::setUp();

        $this->usuarioRepo = $this->createMock(UsuarioRepositorioInterface::class);
        $this->verificacionRepo = $this->createMock(VerificacionCorreoRepositorioInterface::class);
        $this->tokenService = $this->createMock(TokenServiceInterface::class);

        $this->caso = new RegistrarCliente(
            $this->usuarioRepo,
            $this->verificacionRepo,
            $this->tokenService,
        );
    }

    /** TC-01: Registro valido asigna rol CLIENTE e inserta verificacion de correo. */
    public function test_registro_valido_crea_usuario_cliente_y_verificacion(): void
    {
        $dto = new RegistrarClienteDTO(
            nombre_completo: 'Juan Perez',
            correo: 'juan@example.com',
            password: 'Password123*',
            telefono: null,
            terminos_aceptados: true,
            version_terminos: '1.0',
        );

        $this->usuarioRepo->method('buscarRolIdPorNombre')
            ->with('CLIENTE')
            ->willReturn(2);

        $usuarioEsperado = $this->crearUsuario(rol: 'CLIENTE');

        $this->usuarioRepo->expects($this->once())
            ->method('guardar')
            ->with($this->arrayHasKey('rol_id'))
            ->willReturn($usuarioEsperado);

        $this->verificacionRepo->expects($this->once())
            ->method('crear')
            ->with($usuarioEsperado->id, $this->isType('string'), $this->isInstanceOf(DateTimeImmutable::class))
            ->willReturn($this->crearVerificacion($usuarioEsperado->id));

        $this->tokenService->expects($this->once())
            ->method('emitir')
            ->willReturn('token_plano');

        $resultado = $this->caso->execute($dto);

        $this->assertInstanceOf(SesionIniciadaDTO::class, $resultado);
        $this->assertSame('CLIENTE', $resultado->usuario->rol);
        $this->assertSame('token_plano', $resultado->token);
    }

    /** El caso de uso delega la asignacion del rol al repositorio (buscarRolIdPorNombre). */
    public function test_busca_rol_cliente_por_nombre(): void
    {
        $dto = new RegistrarClienteDTO('A', 'a@b.com', 'Pass1234*', null, true, '1.0');

        $this->usuarioRepo->expects($this->once())
            ->method('buscarRolIdPorNombre')
            ->with('CLIENTE')
            ->willReturn(2);

        $this->usuarioRepo->method('guardar')->willReturn($this->crearUsuario());
        $this->verificacionRepo->method('crear')->willReturn($this->crearVerificacion(1));
        $this->tokenService->method('emitir')->willReturn('tok');

        $this->caso->execute($dto);
    }

    // -------------------------------------------------------------------------

    private function crearUsuario(string $rol = 'CLIENTE'): Usuario
    {
        return new Usuario(
            id: 1,
            rol_id: 2,
            nombre_completo: 'Juan Perez',
            correo: 'juan@example.com',
            telefono: null,
            password_hash: 'hashed',
            correo_verificado: false,
            intentos_fallidos: 0,
            bloqueado_hasta: null,
            terminos_aceptados: true,
            version_terminos: '1.0',
            terminos_aceptados_en: new DateTimeImmutable,
            activo: true,
            creado_en: new DateTimeImmutable,
            actualizado_en: new DateTimeImmutable,
            rol: $rol,
        );
    }

    private function crearVerificacion(int $usuario_id): VerificacionCorreo
    {
        return new VerificacionCorreo(
            id: 1,
            usuario_id: $usuario_id,
            codigo: '123456',
            expira_en: new DateTimeImmutable('+24 hours'),
            usado_en: null,
            creado_en: new DateTimeImmutable,
        );
    }
}
