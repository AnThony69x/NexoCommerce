<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\CasosUso;

use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Aplicacion\Autenticacion\DTOs\OAuthDTO;
use App\Aplicacion\Autenticacion\DTOs\SesionIniciadaDTO;
use App\Dominio\Autenticacion\Excepciones\UsuarioInactivoException;
use App\Dominio\Autenticacion\Repositorios\CuentaOAuthRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;

/**
 * RN-AUTH-09: OAuth solo GOOGLE; par (proveedor, id_proveedor) unico.
 *
 * Tres ramas:
 *   1. Par (proveedor, id_proveedor) existe → login directo.
 *   2. Par no existe, correo existe sin OAuth → vincular cuentas_oauth → login.
 *   3. Nada existe → crear usuarios (password_hash NULL, correo_verificado = true) + cuentas_oauth → login.
 */
final class AutenticarOAuth
{
    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
        private readonly CuentaOAuthRepositorioInterface $oauthRepo,
        private readonly TokenServiceInterface $tokenService,
    ) {}

    public function execute(OAuthDTO $dto): SesionIniciadaDTO
    {
        // Rama 1: par (proveedor, id_proveedor) ya registrado.
        $cuentaOAuth = $this->oauthRepo->buscarPorProveedor($dto->proveedor, $dto->id_proveedor);

        if ($cuentaOAuth !== null) {
            $usuario = $this->usuarioRepo->buscarPorId($cuentaOAuth->usuario_id);

            if ($usuario !== null && ! $usuario->activo) {
                throw new UsuarioInactivoException;
            }

            $token = $this->tokenService->emitir($cuentaOAuth->usuario_id, $dto->proveedor);

            return new SesionIniciadaDTO($usuario, $token);
        }

        // Rama 2: correo existe sin cuenta OAuth → vincular.
        $usuarioExistente = $this->usuarioRepo->buscarPorCorreo($dto->correo);

        if ($usuarioExistente !== null) {
            if (! $usuarioExistente->activo) {
                throw new UsuarioInactivoException;
            }

            $this->oauthRepo->vincular($usuarioExistente->id, $dto->proveedor, $dto->id_proveedor);

            $token = $this->tokenService->emitir($usuarioExistente->id, $dto->proveedor);

            return new SesionIniciadaDTO($usuarioExistente, $token);
        }

        // Rama 3: usuario nuevo → crear + vincular OAuth.
        $rolId = $this->usuarioRepo->buscarRolIdPorNombre('CLIENTE');

        $nuevoUsuario = $this->usuarioRepo->guardar([
            'rol_id' => $rolId,
            'nombre_completo' => $dto->nombre_completo,
            'correo' => $dto->correo,
            'telefono' => null,
            'password_hash' => null,
            'correo_verificado' => true,
            'intentos_fallidos' => 0,
            'terminos_aceptados' => true,
            'version_terminos' => $dto->version_terminos,
            'terminos_aceptados_en' => (new \DateTimeImmutable)->format('Y-m-d H:i:s'),
            'activo' => true,
        ]);

        $this->oauthRepo->vincular($nuevoUsuario->id, $dto->proveedor, $dto->id_proveedor);

        $token = $this->tokenService->emitir($nuevoUsuario->id, $dto->proveedor);

        return new SesionIniciadaDTO($nuevoUsuario, $token);
    }
}
