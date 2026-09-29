<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Autenticacion\Entidades\VerificacionCorreo;
use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\VerificacionCorreoModelo;
use DateTimeImmutable;

class VerificacionCorreoRepositorioEloquent implements VerificacionCorreoRepositorioInterface
{
    public function crear(int $usuario_id, string $codigo, DateTimeImmutable $expira_en): VerificacionCorreo
    {
        $modelo = VerificacionCorreoModelo::create([
            'usuario_id' => $usuario_id,
            'codigo' => $codigo,
            'expira_en' => $expira_en->format('Y-m-d H:i:s'),
        ]);

        return $this->mapearAEntidad($modelo);
    }

    public function buscarCodigoActivo(int $usuario_id, string $codigo): ?VerificacionCorreo
    {
        $modelo = VerificacionCorreoModelo::where('usuario_id', $usuario_id)
            ->where('codigo', $codigo)
            ->whereNull('usado_en')
            ->where('expira_en', '>', now())
            ->first();

        return $modelo ? $this->mapearAEntidad($modelo) : null;
    }

    public function marcarUsado(int $id): void
    {
        VerificacionCorreoModelo::where('id', $id)->update(['usado_en' => now()]);
    }

    // -------------------------------------------------------------------------

    private function mapearAEntidad(VerificacionCorreoModelo $modelo): VerificacionCorreo
    {
        return new VerificacionCorreo(
            id: $modelo->id,
            usuario_id: $modelo->usuario_id,
            codigo: $modelo->codigo,
            expira_en: new DateTimeImmutable($modelo->expira_en->toDateTimeString()),
            usado_en: $modelo->usado_en
                ? new DateTimeImmutable($modelo->usado_en->toDateTimeString())
                : null,
            creado_en: new DateTimeImmutable($modelo->creado_en
                ? $modelo->creado_en->toDateTimeString()
                : now()->toDateTimeString()),
        );
    }
}
