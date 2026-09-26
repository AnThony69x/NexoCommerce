<?php

declare(strict_types=1);

namespace App\Dominio\Multimedia\Entidades;

final readonly class ArchivoDescargable
{
    public function __construct(public string $contenido, public string $tipoMime, public string $nombre) {}
}
