<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Tienda\Entidades\ConfiguracionTienda;
use App\Dominio\Tienda\Excepciones\ConfiguracionTiendaNoEncontradaException;
use App\Dominio\Tienda\Repositorios\ConfiguracionTiendaRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionTiendaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use DateTimeImmutable;

class ConfiguracionTiendaRepositorioEloquent implements ConfiguracionTiendaRepositorioInterface
{
    public function buscarActiva(): ?ConfiguracionTienda
    {
        $modelo = ConfiguracionTiendaModelo::query()
            ->with(['logo', 'favicon'])
            ->where('activo', true)
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

        $datos['logo_id'] = $this->idMultimedia($datos['logo_url'] ?? null);
        $datos['favicon_id'] = $this->idMultimedia($datos['favicon_url'] ?? null);
        unset($datos['logo_url'], $datos['favicon_url']);

        $modelo->update($datos);

        return $this->mapearAEntidad($modelo->fresh(['logo', 'favicon']));
    }

    private function idMultimedia(?string $ruta): ?int
    {
        if ($ruta === null) {
            return null;
        }

        $id = MultimediaModelo::query()->where('ruta_archivo', $ruta)->value('id');

        return $id !== null ? (int) $id : null;
    }

    private function urlPublica(?string $ruta): ?string
    {
        if ($ruta === null) {
            return null;
        }

        $base = rtrim((string) config('app.multimedia_public_base_url', ''), '/');

        return $base === '' ? $ruta : $base.'/'.$ruta;
    }

    private function mapearAEntidad(ConfiguracionTiendaModelo $modelo): ConfiguracionTienda
    {
        return new ConfiguracionTienda(
            id: (int) $modelo->id,
            nombre_tienda: $modelo->nombre_tienda,
            logo_url: $this->urlPublica($modelo->logo?->ruta_archivo),
            favicon_url: $this->urlPublica($modelo->favicon?->ruta_archivo),
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
