<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\CasosUso;

use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Aplicacion\Autenticacion\DTOs\RegistrarClienteDTO;
use App\Aplicacion\Autenticacion\DTOs\SesionIniciadaDTO;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;
use DateTimeImmutable;

/**
 * RN-AUTH-01: correo unico.
 * RN-AUTH-02: rol CLIENTE.
 * RN-AUTH-04: terminos_aceptados + version_terminos + terminos_aceptados_en.
 * RN-AUTH-05: insertar verificaciones_correo con codigo + expira_en 24h.
 */
final class RegistrarCliente
{
    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
        private readonly VerificacionCorreoRepositorioInterface $verificacionRepo,
        private readonly TokenServiceInterface $tokenService,
    ) {}

    public function execute(RegistrarClienteDTO $dto): SesionIniciadaDTO
    {
        $rolId = $this->usuarioRepo->buscarRolIdPorNombre('CLIENTE');

        $usuario = $this->usuarioRepo->guardar([
            'rol_id' => $rolId,
            'nombre_completo' => $dto->nombre_completo,
            'correo' => $dto->correo,
            'telefono' => $dto->telefono,
            'password_hash' => password_hash($dto->password, PASSWORD_BCRYPT),
            'correo_verificado' => false,
            'intentos_fallidos' => 0,
            'terminos_aceptados' => true,
            'version_terminos' => $dto->version_terminos,
            'terminos_aceptados_en' => (new DateTimeImmutable)->format('Y-m-d H:i:s'),
            'activo' => true,
        ]);

        $codigo = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiraEn = new DateTimeImmutable('+24 hours');

        $this->verificacionRepo->crear($usuario->id, $codigo, $expiraEn);

        $token = $this->tokenService->emitir($usuario->id, 'registro');

        return new SesionIniciadaDTO($usuario, $token);
    }
}
