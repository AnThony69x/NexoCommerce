<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Autenticacion\Entidades\Usuario;
use DateTimeInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource JSON para la entidad de dominio Usuario.
 *
 * Acepta un objeto \App\Dominio\Autenticacion\Entidades\Usuario como resource.
 * Campos expuestos segun spec 1.1.0 (nombres exactos de columnas SQL).
 *
 * @mixin Usuario
 */
class UsuarioResource extends JsonResource
{
    /**
     * Incluir campos de terminos y version_terminos solo en perfil completo.
     * Por defecto false (para listados admin y respuestas breves).
     */
    public bool $conTerminos = false;

    public static function perfil(Usuario $usuario): self
    {
        $instance = new self($usuario);
        $instance->conTerminos = true;

        return $instance;
    }

    public function toArray(Request $request): array
    {
        /** @var Usuario $u */
        $u = $this->resource;

        $base = [
            'id' => $u->id,
            'nombre_completo' => $u->nombre_completo,
            'correo' => $u->correo,
            'telefono' => $u->telefono,
            'rol' => $u->rol,
            'correo_verificado' => $u->correo_verificado,
            'activo' => $u->activo,
            'creado_en' => $u->creado_en instanceof DateTimeInterface
                ? $u->creado_en->format('Y-m-d\TH:i:s.u\Z')
                : (string) $u->creado_en,
        ];

        if ($this->conTerminos) {
            $base['terminos_aceptados'] = $u->terminos_aceptados;
            $base['version_terminos'] = $u->version_terminos;
        }

        return $base;
    }
}
