<?php

declare(strict_types=1);

namespace App\Http\Controllers\Categorias;

use App\Aplicacion\Categorias\CasosUso\ActualizarCategoria;
use App\Aplicacion\Categorias\CasosUso\CrearCategoria;
use App\Aplicacion\Categorias\CasosUso\DesactivarCategoria;
use App\Aplicacion\Categorias\CasosUso\ListarArbolCategorias;
use App\Aplicacion\Categorias\DTOs\ActualizarCategoriaDTO;
use App\Aplicacion\Categorias\DTOs\CategoriaArbolDTO;
use App\Aplicacion\Categorias\DTOs\CrearCategoriaDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Categorias\ActualizarCategoriaRequest;
use App\Http\Requests\Categorias\CrearCategoriaRequest;
use App\Http\Requests\Categorias\ListarCategoriasRequest;
use App\Http\Resources\CategoriaArbolResource;
use App\Http\Resources\CategoriaResource;
use Illuminate\Http\JsonResponse;

class CategoriaController extends Controller
{
    public function __construct(
        private readonly ListarArbolCategorias $listarArbol,
        private readonly CrearCategoria $crearCategoria,
        private readonly ActualizarCategoria $actualizarCategoria,
        private readonly DesactivarCategoria $desactivarCategoria,
    ) {}

    public function index(ListarCategoriasRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $arbol = $this->listarArbol->execute((bool) ($datos['solo_activas'] ?? true));

        return response()->json([
            'success' => true,
            'data' => array_map(
                static fn (CategoriaArbolDTO $nodo): array => (new CategoriaArbolResource($nodo))->toArray($request),
                $arbol,
            ),
        ]);
    }

    public function store(CrearCategoriaRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $categoria = $this->crearCategoria->execute(new CrearCategoriaDTO(
            categoria_padre_id: isset($datos['categoria_padre_id'])
                ? (int) $datos['categoria_padre_id']
                : null,
            nombre: $datos['nombre'],
            descripcion: $datos['descripcion'] ?? null,
            imagen_id: isset($datos['imagen_id']) ? (int) $datos['imagen_id'] : null,
            activo: (bool) ($datos['activo'] ?? true),
        ));

        return response()->json([
            'success' => true,
            'message' => 'Categoria creada con exito.',
            'data' => new CategoriaResource($categoria),
        ], 201);
    }

    public function update(ActualizarCategoriaRequest $request, int $id): JsonResponse
    {
        $datos = $request->validated();
        $categoria = $this->actualizarCategoria->execute($id, new ActualizarCategoriaDTO(
            nombre: $datos['nombre'],
            incluye_categoria_padre_id: array_key_exists('categoria_padre_id', $datos),
            categoria_padre_id: isset($datos['categoria_padre_id'])
                ? (int) $datos['categoria_padre_id']
                : null,
            incluye_descripcion: array_key_exists('descripcion', $datos),
            descripcion: $datos['descripcion'] ?? null,
            incluye_imagen_id: array_key_exists('imagen_id', $datos),
            imagen_id: isset($datos['imagen_id']) ? (int) $datos['imagen_id'] : null,
            activo: array_key_exists('activo', $datos) ? (bool) $datos['activo'] : null,
        ));

        return response()->json([
            'success' => true,
            'message' => 'Categoria actualizada con exito.',
            'data' => new CategoriaResource($categoria),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->desactivarCategoria->execute($id);

        return response()->json([
            'success' => true,
            'message' => 'Categoria desactivada.',
        ]);
    }
}
