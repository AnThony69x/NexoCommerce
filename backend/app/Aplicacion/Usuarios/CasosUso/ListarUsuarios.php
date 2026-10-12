<?php

declare(strict_types=1);

namespace App\Aplicacion\Usuarios\CasosUso;

use App\Dominio\Autenticacion\Entidades\Usuario;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;

/**
 * RN-USR-03: Solo ADMIN puede listar usuarios.
 * Filtros: rol, buscar (nombre o correo), activo.
 * Paginado a 15 por pagina.
 *
 * @return array{items: list<Usuario>, total: int, por_pagina: int, pagina_actual: int, total_paginas: int}
 */
final class ListarUsuarios
{
    public function __construct(
        private readonly UsuarioRepositorioInterface $usuarioRepo,
    ) {}

    public function execute(array $filtros, int $pagina = 1, int $porPagina = 15): array
    {
        return $this->usuarioRepo->listar($filtros, $pagina, $porPagina);
    }
}
