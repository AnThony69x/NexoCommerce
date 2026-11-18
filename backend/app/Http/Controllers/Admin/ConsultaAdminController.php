<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListarMultimediaAdminRequest;
use App\Http\Requests\Admin\ListarPagosAdminRequest;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PagoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PedidoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Http\JsonResponse;

class ConsultaAdminController extends Controller
{
    public function pagos(ListarPagosAdminRequest $request): JsonResponse
    {
        $consulta = PagoModelo::query()->with(['comprobante'])->orderByDesc('id');
        foreach (['estado', 'metodo', 'pedido_id'] as $campo) {
            if ($request->validated($campo) !== null) {
                $consulta->where($campo, $request->validated($campo));
            }
        }
        $pagina = $consulta->paginate(15, ['*'], 'page', (int) $request->validated('page', 1));
        $pedidoEstados = PedidoModelo::query()->whereIn('id', $pagina->getCollection()->pluck('pedido_id'))->pluck('estado', 'id');
        $datos = $pagina->getCollection()->map(static function (PagoModelo $pago) use ($pedidoEstados): array {
            $comprobante = $pago->comprobante;
            return [
                'id' => (int) $pago->id, 'pedido_id' => (int) $pago->pedido_id,
                'metodo' => $pago->metodo, 'estado' => $pago->estado, 'monto' => (float) $pago->monto,
                'referencia_pasarela' => $pago->referencia_pasarela,
                'fecha_pago' => $pago->fecha_pago?->toISOString(),
                'pedido_estado' => $pedidoEstados[$pago->pedido_id] ?? '',
                'comprobante' => $comprobante === null ? null : [
                    'id' => (int) $comprobante->id, 'multimedia_id' => (int) $comprobante->multimedia_id,
                    'revisado_por_id' => $comprobante->revisado_por_id,
                    'fecha_revision' => $comprobante->fecha_revision?->toISOString(),
                    'comentario_revision' => $comprobante->comentario_revision,
                ],
            ];
        });
        return response()->json(['success' => true, 'data' => $datos, 'meta' => [
            'pagina_actual' => $pagina->currentPage(), 'por_pagina' => $pagina->perPage(),
            'total' => $pagina->total(), 'total_paginas' => $pagina->lastPage(),
        ]]);
    }

    public function multimedia(ListarMultimediaAdminRequest $request): JsonResponse
    {
        $consulta = MultimediaModelo::query()->orderByDesc('id');
        $filtros = $request->validated();
        $consulta->where('activo', (bool) ($filtros['activo'] ?? true));
        if (isset($filtros['destino'])) {
            $consulta->where('ruta_archivo', 'like', $filtros['destino'].'/%');
        }
        $pagina = $consulta->paginate(15, ['*'], 'page', (int) ($filtros['page'] ?? 1));
        $datos = $pagina->getCollection()->map(static function (MultimediaModelo $medio): array {
            $destino = explode('/', $medio->ruta_archivo, 2)[0];
            $publico = in_array($destino, ['productos', 'categorias', 'tienda', 'publicaciones', 'disenos'], true);
            $base = rtrim((string) config('app.multimedia_public_base_url', ''), '/');
            return [
                'id' => (int) $medio->id, 'nombre_archivo' => $medio->nombre_archivo,
                'ruta_archivo' => $medio->ruta_archivo, 'destino' => $destino,
                'tipo_mime' => $medio->tipo_mime, 'tamano_bytes' => (int) $medio->tamano_bytes,
                'ancho' => $medio->ancho, 'alto' => $medio->alto, 'activo' => (bool) $medio->activo,
                'subido_por_id' => $medio->subido_por_id, 'creado_en' => $medio->creado_en?->toISOString(),
                'url' => $publico && $base !== '' ? $base.'/'.$medio->ruta_archivo : null,
            ];
        });
        return response()->json(['success' => true, 'data' => $datos, 'meta' => [
            'pagina_actual' => $pagina->currentPage(), 'por_pagina' => $pagina->perPage(),
            'total' => $pagina->total(), 'total_paginas' => $pagina->lastPage(),
        ]]);
    }

    public function dashboard(): JsonResponse
    {
        $pedidos = PedidoModelo::query()->orderByDesc('creado_en')->orderByDesc('id')->limit(5)
            ->get(['id', 'estado', 'creado_en']);
        $stockBajo = ProductoModelo::query()->join('catalogo.detalles', 'catalogo.productos.id', '=', 'catalogo.detalles.producto_id')
            ->where('catalogo.productos.activo', true)->where('catalogo.productos.tipo', 'DETALLE')
            ->whereBetween('catalogo.detalles.stock', [0, 5])
            ->orderBy('catalogo.detalles.stock')->orderBy('catalogo.productos.id')->limit(10)
            ->get(['catalogo.productos.id', 'catalogo.productos.nombre', 'catalogo.detalles.stock']);
        return response()->json(['success' => true, 'data' => [
            'productos_activos' => ProductoModelo::query()->where('activo', true)->count(),
            'pedidos_pendientes' => PedidoModelo::query()->where('estado', 'PENDIENTE')->count(),
            'pagos_pendientes' => PagoModelo::query()->where('estado', 'PENDIENTE')->count(),
            'usuarios_registrados' => UsuarioModelo::query()->count(),
            'pedidos_recientes' => $pedidos,
            'productos_stock_bajo' => $stockBajo,
        ]]);
    }
}
