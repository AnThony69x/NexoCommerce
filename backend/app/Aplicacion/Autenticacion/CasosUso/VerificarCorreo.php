<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\CasosUso;

use App\Aplicacion\Autenticacion\DTOs\VerificarCorreoDTO;
use App\Dominio\Autenticacion\Excepciones\CodigoVerificacionInvalidoException;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;

/**
 * Marca verificaciones_correo.usado_en y usuarios.correo_verificado = true.
 * Codigo expirado o ya usado: 400 AUTH_CODIGO_INVALIDO.
 */
final class VerificarCorreo
{
    public function __construct(
        private readonly VerificacionCorreoRepositorioInterface $verificacionRepo,
        private readonly UsuarioRepositorioInterface $usuarioRepo,
    ) {}

    public function execute(int $usuario_id, VerificarCorreoDTO $dto): void
    {
        $verificacion = $this->verificacionRepo->buscarCodigoActivo($usuario_id, $dto->codigo);

        if ($verificacion === null || ! $verificacion->esValido()) {
            throw new CodigoVerificacionInvalidoException;
        }

        $this->verificacionRepo->marcarUsado($verificacion->id);
        $this->usuarioRepo->actualizar($usuario_id, ['correo_verificado' => true]);
    }
}
