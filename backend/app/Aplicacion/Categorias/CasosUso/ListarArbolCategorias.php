<?php

declare(strict_types=1);

namespace App\Aplicacion\Categorias\CasosUso;

use App\Aplicacion\Categorias\DTOs\CategoriaArbolDTO;
use App\Dominio\Categorias\Entidades\Categoria;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;

final class ListarArbolCategorias
{
    public function __construct(
        private readonly CategoriaRepositorioInterface $categoriaRepo,
    ) {}

    /** @return list<CategoriaArbolDTO> */
    public function execute(bool $soloActivas = true): array
    {
        $categoriasPorPadre = [];

        foreach ($this->categoriaRepo->listar($soloActivas) as $categoria) {
            $categoriasPorPadre[$this->clavePadre($categoria->categoria_padre_id)][] = $categoria;
        }

        return $this->construirRama(null, $categoriasPorPadre, []);
    }

    /**
     * @param  array<string, list<Categoria>>  $categoriasPorPadre
     * @param  array<int, true>  $ancestros
     * @return list<CategoriaArbolDTO>
     */
    private function construirRama(?int $padreId, array $categoriasPorPadre, array $ancestros): array
    {
        $rama = [];

        foreach ($categoriasPorPadre[$this->clavePadre($padreId)] ?? [] as $categoria) {
            if (isset($ancestros[$categoria->id])) {
                continue;
            }

            $ancestrosActuales = $ancestros;
            $ancestrosActuales[$categoria->id] = true;

            $rama[] = new CategoriaArbolDTO(
                categoria: $categoria,
                subcategorias: $this->construirRama(
                    $categoria->id,
                    $categoriasPorPadre,
                    $ancestrosActuales,
                ),
            );
        }

        return $rama;
    }

    private function clavePadre(?int $padreId): string
    {
        return $padreId === null ? 'raiz' : (string) $padreId;
    }
}
