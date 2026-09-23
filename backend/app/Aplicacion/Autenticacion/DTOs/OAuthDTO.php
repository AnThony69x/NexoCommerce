<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\DTOs;

final readonly class OAuthDTO
{
    public function __construct(
        /** GOOGLE | FACEBOOK */
        public string $proveedor,
        public string $id_proveedor,
        public string $nombre_completo,
        public string $correo,
        public bool $terminos_aceptados,
        public string $version_terminos,
    ) {}
}
