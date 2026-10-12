<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\CasosUso;

use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Aplicacion\Autenticacion\DTOs\IniciarSesionDTO;
use App\Aplicacion\Autenticacion\DTOs\SesionIniciadaDTO;
use App\Dominio\Autenticacion\Excepciones\CredencialesInvalidasException;
use App\Dominio\Autenticacion\Excepciones\CuentaBloqueadaException;
use App\Dominio\Autenticacion\Excepciones\UsuarioInactivoException;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use DateTimeImmutable;

/**
 * RN-AUTH-06: 5 intentos fallidos → bloqueo de 15 minutos (429).
 * RN-AUTH-07: login exitoso reinicia intentos_fallidos a 0 y emite token.
 * RN-AUTH-10: usuario inactivo → 403.
 */
final class IniciarSesion
{
    private const MAX_INTENTOS = 5;

    private const MINUTOS_BLOQUEO = 15;

    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
        private readonly TokenServiceInterface $tokenService,
    ) {}

    public function execute(IniciarSesionDTO $dto): SesionIniciadaDTO
    {
        $usuario = $this->usuarioRepo->buscarPorCorreo($dto->correo);

        // Correo no existe: responder igual que password incorrecto (no revelar si existe).
        if ($usuario === null) {
            throw new CredencialesInvalidasException;
        }

        // RN-AUTH-10
        if (! $usuario->activo) {
            throw new UsuarioInactivoException;
        }

        // RN-AUTH-06: Verificar bloqueo vigente antes de validar password.
        if ($usuario->estaBloqueado()) {
            throw new CuentaBloqueadaException;
        }

        // Validar password.
        if ($usuario->esSoloOAuth() || ! password_verify($dto->password, $usuario->password_hash ?? '')) {
            $nuevosIntentos = $usuario->intentos_fallidos + 1;

            $datos = ['intentos_fallidos' => $nuevosIntentos];

            if ($nuevosIntentos >= self::MAX_INTENTOS) {
                $datos['bloqueado_hasta'] = (new DateTimeImmutable('+'.self::MINUTOS_BLOQUEO.' minutes'))
                    ->format('Y-m-d H:i:s');
            }

            $this->usuarioRepo->actualizar($usuario->id, $datos);

            // Si ya alcanzamos el limite en este intento, responder 429.
            if ($nuevosIntentos >= self::MAX_INTENTOS) {
                throw new CuentaBloqueadaException;
            }

            throw new CredencialesInvalidasException;
        }

        // Login exitoso: reiniciar contadores.
        $usuario = $this->usuarioRepo->actualizar($usuario->id, [
            'intentos_fallidos' => 0,
            'bloqueado_hasta' => null,
        ]);

        $token = $this->tokenService->emitir($usuario->id, $dto->device_name);

        return new SesionIniciadaDTO($usuario, $token);
    }
}
