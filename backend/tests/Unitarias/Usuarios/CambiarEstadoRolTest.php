<?php

declare(strict_types=1);

namespace Tests\Unitarias\Usuarios;

use App\Aplicacion\Usuarios\CasosUso\CambiarEstadoRol;
use App\Aplicacion\Usuarios\DTOs\ActualizarUsuarioAdminDTO;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Excepciones\UltimoAdminException;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use DateTimeImmutable;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class CambiarEstadoRolTest extends TestCase
{
    private UsuarioRepositorioInterface&MockObject $usuarioRepo;

    private CambiarEstadoRol $caso;

    protected function setUp(): void
    {
        parent::setUp();

        $this->usuarioRepo = $this->createMock(UsuarioRepositorioInterface::class);
        $this->caso = new CambiarEstadoRol($this->usuarioRepo);
    }

    /** TC-04 (spec 02): No se puede dejar el sistema sin ningun ADMIN activo. */
    public function test_no_puede_desactivar_ultimo_admin(): void
    {
        $adminUnico = $this->crearUsuario(id: 1, rol: 'ADMIN', activo: true);

        $this->usuarioRepo->method('buscarPorId')->willReturn($adminUnico);
        $this->usuarioRepo->method('contarAdminsActivos')->willReturn(1);

        $dto = new ActualizarUsuarioAdminDTO(rol: null, activo: false);

        $this->expectException(UltimoAdminException::class);

        $this->caso->execute(1, $dto);
    }

    /** No puede degradar (ADMIN -> CLIENTE) al ultimo ADMIN activo. */
    public function test_no_puede_degradar_ultimo_admin(): void
    {
        $adminUnico = $this->crearUsuario(id: 1, rol: 'ADMIN', activo: true);

        $this->usuarioRepo->method('buscarPorId')->willReturn($adminUnico);
        $this->usuarioRepo->method('contarAdminsActivos')->willReturn(1);

        $dto = new ActualizarUsuarioAdminDTO(rol: 'CLIENTE', activo: null);

        $this->expectException(UltimoAdminException::class);

        $this->caso->execute(1, $dto);
    }

    /** Con dos ADMINs activos, se puede desactivar uno. */
    public function test_puede_desactivar_admin_si_existe_otro(): void
    {
        $admin = $this->crearUsuario(id: 1, rol: 'ADMIN', activo: true);

        $this->usuarioRepo->method('buscarPorId')->willReturn($admin);
        $this->usuarioRepo->method('contarAdminsActivos')->willReturn(2);

        $adminActualizado = $this->crearUsuario(id: 1, rol: 'ADMIN', activo: false);

        $this->usuarioRepo->expects($this->once())
            ->method('actualizar')
            ->with(1, ['activo' => false])
            ->willReturn($adminActualizado);

        $resultado = $this->caso->execute(1, new ActualizarUsuarioAdminDTO(rol: null, activo: false));

        $this->assertFalse($resultado->activo);
    }

    /** Cambio de rol en un CLIENTE no requiere verificar conteo de admins. */
    public function test_puede_cambiar_rol_de_cliente_sin_restriccion(): void
    {
        $cliente = $this->crearUsuario(id: 2, rol: 'CLIENTE', activo: true);

        $this->usuarioRepo->method('buscarPorId')->willReturn($cliente);
        $this->usuarioRepo->method('buscarRolIdPorNombre')->with('ADMIN')->willReturn(1);
        $this->usuarioRepo->method('contarAdminsActivos')->willReturn(1);

        $adminNuevo = $this->crearUsuario(id: 2, rol: 'ADMIN', activo: true);

        $this->usuarioRepo->expects($this->once())
            ->method('actualizar')
            ->with(2, ['rol_id' => 1])
            ->willReturn($adminNuevo);

        $resultado = $this->caso->execute(2, new ActualizarUsuarioAdminDTO(rol: 'ADMIN', activo: null));

        $this->assertSame('ADMIN', $resultado->rol);
    }

    // -------------------------------------------------------------------------

    private function crearUsuario(int $id, string $rol, bool $activo): Usuario
    {
        return new Usuario(
            id: $id,
            rol_id: $rol === 'ADMIN' ? 1 : 2,
            nombre_completo: 'Test User',
            correo: "user{$id}@test.com",
            telefono: null,
            password_hash: 'hash',
            correo_verificado: true,
            intentos_fallidos: 0,
            bloqueado_hasta: null,
            terminos_aceptados: true,
            version_terminos: '1.0',
            terminos_aceptados_en: null,
            activo: $activo,
            creado_en: new DateTimeImmutable,
            actualizado_en: new DateTimeImmutable,
            rol: $rol,
        );
    }
}
