<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Tienda\Entidades\ConfiguracionTienda;
use App\Dominio\Tienda\Excepciones\ConfiguracionTiendaNoEncontradaException;
use App\Dominio\Tienda\Repositorios\ConfiguracionTiendaRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionTiendaModelo;
use DateTimeImmutable;

class ConfiguracionTiendaRepositorioEloquent implements ConfiguracionTiendaRepositorioInterface
{
    public function buscarActiva(): ?ConfiguracionTienda
    {
        $modelo = ConfiguracionTiendaModelo::query()
            ->where('activo', true)
            ->orderBy('id')
            ->first();

        return $modelo !== null ? $this->mapearAEntidad($modelo) : null;
    }

    public function actualizar(int $id, array $datos): ConfiguracionTienda
    {
        $modelo = ConfiguracionTiendaModelo::query()
            ->whereKey($id)
            ->where('activo', true)
            ->first();

        if ($modelo === null) {
            throw new ConfiguracionTiendaNoEncontradaException;
        }

        $modelo->update($datos);

        return $this->mapearAEntidad($modelo->fresh());
    }

    private function mapearAEntidad(ConfiguracionTiendaModelo $modelo): ConfiguracionTienda
    {
        return new ConfiguracionTienda(
            id: (int) $modelo->id,
            nombre_tienda: $modelo->nombre_tienda,
            logo_url: $modelo->logo_url,
            favicon_url: $modelo->favicon_url,
            color_primario: $modelo->color_primario,
            color_secundario: $modelo->color_secundario,
            color_acento: $modelo->color_acento,
            color_fondo: $modelo->color_fondo,
            color_texto: $modelo->color_texto,
            telefono: $modelo->telefono,
            correo: $modelo->correo,
            direccion: $modelo->direccion,
            activo: (bool) $modelo->activo,
            creado_en: new DateTimeImmutable($modelo->creado_en->toDateTimeString()),
            actualizado_en: new DateTimeImmutable($modelo->actualizado_en->toDateTimeString()),
        );
    }
}
