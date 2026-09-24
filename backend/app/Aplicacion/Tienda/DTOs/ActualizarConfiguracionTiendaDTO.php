<?php

declare(strict_types=1);

namespace App\Aplicacion\Tienda\DTOs;

final readonly class ActualizarConfiguracionTiendaDTO
{
    public function __construct(
        public string $nombre_tienda,
        public ?string $logo_url,
        public ?string $favicon_url,
        public string $color_primario,
        public string $color_secundario,
        public ?string $color_acento,
        public ?string $color_fondo,
        public ?string $color_texto,
        public ?string $telefono,
        public ?string $correo,
        public ?string $direccion,
        public bool $activo,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function aArray(): array
    {
        return [
            'nombre_tienda' => $this->nombre_tienda,
            'logo_url' => $this->logo_url,
            'favicon_url' => $this->favicon_url,
            'color_primario' => $this->color_primario,
            'color_secundario' => $this->color_secundario,
            'color_acento' => $this->color_acento,
            'color_fondo' => $this->color_fondo,
            'color_texto' => $this->color_texto,
            'telefono' => $this->telefono,
            'correo' => $this->correo,
            'direccion' => $this->direccion,
            'activo' => $this->activo,
        ];
    }
}
