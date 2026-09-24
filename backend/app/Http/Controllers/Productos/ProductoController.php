<?php

declare(strict_types=1);

namespace App\Http\Controllers\Productos;

use App\Aplicacion\Productos\CasosUso\ActualizarDisenoTorta;
use App\Aplicacion\Productos\CasosUso\ActualizarPlantillaDiseno;
use App\Aplicacion\Productos\CasosUso\ActualizarProducto;
use App\Aplicacion\Productos\CasosUso\ConsultarProducto;
use App\Aplicacion\Productos\CasosUso\CrearDisenoTorta;
use App\Aplicacion\Productos\CasosUso\CrearPlantillaDiseno;
use App\Aplicacion\Productos\CasosUso\CrearProducto;
use App\Aplicacion\Productos\CasosUso\DesactivarDisenoTorta;
use App\Aplicacion\Productos\CasosUso\DesactivarPlantillaDiseno;
use App\Aplicacion\Productos\CasosUso\DesactivarProducto;
use App\Aplicacion\Productos\CasosUso\ListarProductos;
use App\Aplicacion\Productos\DTOs\ActualizarProductoDTO;
use App\Aplicacion\Productos\DTOs\CrearProductoDTO;
use App\Aplicacion\Productos\DTOs\FiltrosProductoDTO;
use App\Aplicacion\Productos\DTOs\GuardarDisenoDTO;
use App\Dominio\Productos\Entidades\Producto;
use App\Http\Controllers\Controller;
use App\Http\Requests\Productos\ActualizarDisenoRequest;
use App\Http\Requests\Productos\ActualizarProductoRequest;
use App\Http\Requests\Productos\CrearDisenoRequest;
use App\Http\Requests\Productos\CrearProductoRequest;
use App\Http\Requests\Productos\ListarProductosRequest;
use App\Http\Resources\DisenoResource;
use App\Http\Resources\ProductoDetalleResource;
use App\Http\Resources\ProductoListadoResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function __construct(
        private readonly ListarProductos $listarProductos,
        private readonly ConsultarProducto $consultarProducto,
        private readonly CrearProducto $crearProducto,
        private readonly ActualizarProducto $actualizarProducto,
        private readonly DesactivarProducto $desactivarProducto,
        private readonly CrearDisenoTorta $crearDisenoTorta,
        private readonly ActualizarDisenoTorta $actualizarDisenoTorta,
        private readonly DesactivarDisenoTorta $desactivarDisenoTorta,
        private readonly CrearPlantillaDiseno $crearPlantilla,
        private readonly ActualizarPlantillaDiseno $actualizarPlantilla,
        private readonly DesactivarPlantillaDiseno $desactivarPlantilla,
    ) {}

    public function index(ListarProductosRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $resultado = $this->listarProductos->execute(new FiltrosProductoDTO(
            categoria_id: isset($datos['categoria_id']) ? (int) $datos['categoria_id'] : null,
            tipo: $datos['tipo'] ?? null,
            buscar: $datos['buscar'] ?? null,
            precio_min: isset($datos['precio_min']) ? (float) $datos['precio_min'] : null,
            precio_max: isset($datos['precio_max']) ? (float) $datos['precio_max'] : null,
            porciones_min: isset($datos['porciones_min']) ? (int) $datos['porciones_min'] : null,
            porciones_max: isset($datos['porciones_max']) ? (int) $datos['porciones_max'] : null,
            sabor: $datos['sabor'] ?? null,
            ordenar: $datos['ordenar'] ?? 'recientes',
            page: (int) ($datos['page'] ?? 1),
        ));

        return response()->json([
            'success' => true,
            'data' => array_map(
                static fn (Producto $producto): array => (new ProductoListadoResource($producto))->toArray($request),
                $resultado['datos'],
            ),
            'meta' => [
                'pagina_actual' => $resultado['pagina_actual'],
                'por_pagina' => $resultado['por_pagina'],
                'total' => $resultado['total'],
                'total_paginas' => $resultado['total_paginas'],
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => (new ProductoDetalleResource($this->consultarProducto->execute($id)))->toArray($request),
        ]);
    }

    public function store(CrearProductoRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $tipo = $datos['tipo'];
        $producto = $this->crearProducto->execute(new CrearProductoDTO(
            categoria_id: (int) $datos['categoria_id'],
            nombre: $datos['nombre'],
            descripcion: $datos['descripcion'] ?? null,
            precio_base: (float) $datos['precio_base'],
            activo: (bool) ($datos['activo'] ?? $tipo !== 'SUBLIMACION'),
            tipo: $tipo,
            torta: isset($datos['torta']) ? $this->normalizarTorta($datos['torta']) : null,
            detalle: isset($datos['detalle']) ? ['stock' => (int) $datos['detalle']['stock']] : null,
            sublimacion: isset($datos['sublimacion']) ? ['tipo_material' => $datos['sublimacion']['tipo_material']] : null,
            imagenes: $this->normalizarImagenes($datos['imagenes'] ?? []),
        ));

        return response()->json([
            'success' => true,
            'message' => 'Producto creado con exito.',
            'data' => new ProductoDetalleResource($producto),
        ], 201);
    }

    public function update(ActualizarProductoRequest $request, int $id): JsonResponse
    {
        $datos = $request->validated();
        if (array_key_exists('imagenes', $datos)) {
            $datos['imagenes'] = $this->normalizarImagenes($datos['imagenes']);
        }

        $producto = $this->actualizarProducto->execute($id, new ActualizarProductoDTO($datos));

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado con exito.',
            'data' => new ProductoDetalleResource($producto),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->desactivarProducto->execute($id);

        return response()->json(['success' => true, 'message' => 'Producto desactivado.']);
    }

    public function storeDisenoTorta(CrearDisenoRequest $request, int $producto_id): JsonResponse
    {
        $diseno = $this->crearDisenoTorta->execute(
            $producto_id,
            new GuardarDisenoDTO($this->normalizarDiseno($request->validated(), true)),
        );

        return response()->json([
            'success' => true,
            'message' => 'Diseno de torta creado.',
            'data' => DisenoResource::desdeDisenoTorta($diseno),
        ], 201);
    }

    public function updateDisenoTorta(ActualizarDisenoRequest $request, int $id): JsonResponse
    {
        $diseno = $this->actualizarDisenoTorta->execute(
            $id,
            new GuardarDisenoDTO($this->normalizarDiseno($request->validated(), false)),
        );

        return response()->json(['success' => true, 'data' => DisenoResource::desdeDisenoTorta($diseno)]);
    }

    public function destroyDisenoTorta(int $id): JsonResponse
    {
        $this->desactivarDisenoTorta->execute($id);

        return response()->json(['success' => true, 'message' => 'Diseno de torta desactivado.']);
    }

    public function storePlantilla(CrearDisenoRequest $request, int $producto_id): JsonResponse
    {
        $plantilla = $this->crearPlantilla->execute(
            $producto_id,
            new GuardarDisenoDTO($this->normalizarDiseno($request->validated(), true)),
        );

        return response()->json([
            'success' => true,
            'message' => 'Plantilla creada.',
            'data' => DisenoResource::desdePlantilla($plantilla),
        ], 201);
    }

    public function updatePlantilla(ActualizarDisenoRequest $request, int $id): JsonResponse
    {
        $plantilla = $this->actualizarPlantilla->execute(
            $id,
            new GuardarDisenoDTO($this->normalizarDiseno($request->validated(), false)),
        );

        return response()->json(['success' => true, 'data' => DisenoResource::desdePlantilla($plantilla)]);
    }

    public function destroyPlantilla(int $id): JsonResponse
    {
        $this->desactivarPlantilla->execute($id);

        return response()->json(['success' => true, 'message' => 'Plantilla desactivada.']);
    }

    private function normalizarTorta(array $datos): array
    {
        return [
            'tamano' => $datos['tamano'],
            'porciones' => (int) $datos['porciones'],
            'sabor' => $datos['sabor'],
        ];
    }

    private function normalizarImagenes(array $imagenes): array
    {
        return array_map(static fn (array $imagen): array => [
            'multimedia_id' => (int) $imagen['multimedia_id'],
            'orden' => (int) ($imagen['orden'] ?? 0),
            'es_principal' => (bool) ($imagen['es_principal'] ?? false),
        ], $imagenes);
    }

    private function normalizarDiseno(array $datos, bool $conValoresPredeterminados): array
    {
        if ($conValoresPredeterminados) {
            $datos['costo_adicional'] = (float) ($datos['costo_adicional'] ?? 0);
            $datos['multimedia_id'] = $datos['multimedia_id'] ?? null;
            $datos['activo'] = (bool) ($datos['activo'] ?? true);
        }

        return $datos;
    }
}
