<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Aplicacion\Autenticacion\CasosUso\AutenticarOAuth;
use App\Aplicacion\Autenticacion\CasosUso\IniciarSesion;
use App\Aplicacion\Autenticacion\CasosUso\ObtenerPerfil;
use App\Aplicacion\Autenticacion\CasosUso\ReenviarVerificacion;
use App\Aplicacion\Autenticacion\CasosUso\RegistrarCliente;
use App\Aplicacion\Autenticacion\CasosUso\VerificarCorreo;
use App\Aplicacion\Autenticacion\DTOs\IniciarSesionDTO;
use App\Aplicacion\Autenticacion\DTOs\OAuthDTO;
use App\Aplicacion\Autenticacion\DTOs\RegistrarClienteDTO;
use App\Aplicacion\Autenticacion\DTOs\VerificarCorreoDTO;
use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\OAuthRequest;
use App\Http\Requests\Auth\RegistroRequest;
use App\Http\Requests\Auth\VerificarCorreoRequest;
use App\Http\Resources\UsuarioResource;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador delgado para /api/v1/auth.
 * Toda la logica de negocio vive en los casos de uso de Aplicacion.
 */
class AuthController extends Controller
{
    public function __construct(
        private readonly RegistrarCliente $registrarCliente,
        private readonly IniciarSesion $iniciarSesion,
        private readonly ObtenerPerfil $obtenerPerfil,
        private readonly VerificarCorreo $verificarCorreo,
        private readonly ReenviarVerificacion $reenviarVerificacion,
        private readonly AutenticarOAuth $autenticarOAuth,
        private readonly UsuarioRepositorioInterface $usuarioRepo,
    ) {}

    /** POST /api/v1/auth/registro */
    public function registro(RegistroRequest $request): JsonResponse
    {
        $dto = new RegistrarClienteDTO(
            nombre_completo: $request->string('nombre_completo')->trim()->toString(),
            correo: $request->string('correo')->lower()->toString(),
            password: $request->string('password')->toString(),
            telefono: $request->filled('telefono') ? $request->string('telefono')->trim()->toString() : null,
            terminos_aceptados: (bool) $request->input('terminos_aceptados'),
            version_terminos: $request->string('version_terminos')->toString(),
        );

        $sesion = $this->registrarCliente->execute($dto);

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado. Verifique su correo.',
            'data' => [
                'usuario' => $this->usuarioBrief($sesion->usuario),
                'token' => $sesion->token,
            ],
        ], 201);
    }

    /** POST /api/v1/auth/login */
    public function login(LoginRequest $request): JsonResponse
    {
        $dto = new IniciarSesionDTO(
            correo: $request->string('correo')->lower()->toString(),
            password: $request->string('password')->toString(),
            device_name: $request->filled('device_name') ? $request->string('device_name')->toString() : null,
        );

        $sesion = $this->iniciarSesion->execute($dto);

        return response()->json([
            'success' => true,
            'message' => 'Sesion iniciada correctamente.',
            'data' => [
                'usuario' => $this->usuarioBrief($sesion->usuario),
                'token' => $sesion->token,
            ],
        ]);
    }

    /** POST /api/v1/auth/logout */
    public function logout(Request $request): JsonResponse
    {
        /** @var UsuarioModelo $modelo */
        $modelo = $request->user();
        $modelo->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesion cerrada y token revocado.',
        ]);
    }

    /** GET /api/v1/auth/perfil */
    public function perfil(Request $request): JsonResponse
    {
        /** @var UsuarioModelo $modelo */
        $modelo = $request->user();
        $usuario = $this->obtenerPerfil->execute($modelo->id);

        return response()->json([
            'success' => true,
            'data' => UsuarioResource::perfil($usuario),
        ]);
    }

    /** POST /api/v1/auth/verificar-correo */
    public function verificarCorreo(VerificarCorreoRequest $request): JsonResponse
    {
        /** @var UsuarioModelo $modelo */
        $modelo = $request->user();

        $this->verificarCorreo->execute(
            $modelo->id,
            new VerificarCorreoDTO($request->string('codigo')->toString()),
        );

        return response()->json([
            'success' => true,
            'message' => 'Correo verificado correctamente.',
        ]);
    }

    /** POST /api/v1/auth/reenviar-verificacion */
    public function reenviarVerificacion(Request $request): JsonResponse
    {
        /** @var UsuarioModelo $modelo */
        $modelo = $request->user();

        $usuario = $this->usuarioRepo->buscarPorId($modelo->id);

        $this->reenviarVerificacion->execute($usuario);

        return response()->json([
            'success' => true,
            'message' => 'Codigo de verificacion reenviado.',
        ]);
    }

    /** POST /api/v1/auth/oauth */
    public function oauth(OAuthRequest $request): JsonResponse
    {
        $dto = new OAuthDTO(
            proveedor: $request->string('proveedor')->toString(),
            id_proveedor: $request->string('id_proveedor')->toString(),
            nombre_completo: $request->string('nombre_completo')->trim()->toString(),
            correo: $request->string('correo')->lower()->toString(),
            terminos_aceptados: (bool) $request->input('terminos_aceptados'),
            version_terminos: $request->string('version_terminos')->toString(),
        );

        $sesion = $this->autenticarOAuth->execute($dto);

        return response()->json([
            'success' => true,
            'message' => 'Autenticacion OAuth exitosa.',
            'data' => [
                'usuario' => $this->usuarioBrief($sesion->usuario),
                'token' => $sesion->token,
            ],
        ]);
    }

    // -------------------------------------------------------------------------

    /** Subconjunto de campos de usuario para respuestas de autenticacion. */
    private function usuarioBrief(Usuario $usuario): array
    {
        return [
            'id' => $usuario->id,
            'nombre_completo' => $usuario->nombre_completo,
            'correo' => $usuario->correo,
            'telefono' => $usuario->telefono,
            'rol' => $usuario->rol,
            'correo_verificado' => $usuario->correo_verificado,
            'activo' => $usuario->activo,
        ];
    }
}
