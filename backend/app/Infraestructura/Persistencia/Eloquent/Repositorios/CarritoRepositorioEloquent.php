<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Carrito\Entidades\Carrito;
use App\Dominio\Carrito\Entidades\DetalleCarrito;
use App\Dominio\Carrito\Repositorios\CarritoRepositorioInterface;
use App\Dominio\Carrito\Servicios\ReglasCarrito;
use App\Dominio\Compartido\Excepciones\DominioException;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CarritoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleCarritoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Support\Facades\DB;

final class CarritoRepositorioEloquent implements CarritoRepositorioInterface
{
    public function obtener(int $usuarioId): Carrito
    {
        return $this->conCarrito($usuarioId, fn (CarritoModelo $carrito): Carrito => $this->presentar($carrito));
    }

    public function agregar(int $usuarioId, int $productoId, int $cantidad, ?string $comentario, ?int $disenoTortaId, ?int $plantillaId, ?int $personalizadoId): Carrito
    {
        return $this->conCarrito($usuarioId, function (CarritoModelo $carrito) use ($usuarioId, $productoId, $cantidad, $comentario, $disenoTortaId, $plantillaId, $personalizadoId): Carrito {
            $producto = ProductoModelo::query()->with(['torta', 'detalle', 'sublimacion'])->find($productoId);
            if ($producto === null || ! $producto->activo) {
                throw $this->error('Producto no disponible.', 'CAR_PRODUCTO_NO_DISPONIBLE');
            }

            $tipo = $this->tipo($producto);
            if (! ReglasCarrito::configuracionValida($tipo, $disenoTortaId, $plantillaId, $personalizadoId)) {
                throw $this->error('Configuracion incompatible con el producto.', 'CAR_CONFIGURACION_INVALIDA');
            }

            $configuracion = $this->configuracion($usuarioId, $productoId, $disenoTortaId, $plantillaId, $personalizadoId);
            if ($configuracion['aviso'] !== null) {
                throw $this->error('Configuracion no disponible para este producto.', 'CAR_CONFIGURACION_INVALIDA');
            }

            $query = $carrito->items()->where('producto_id', $productoId)
                ->where('diseno_torta_id', $disenoTortaId)
                ->where('plantilla_diseno_id', $plantillaId)
                ->where('diseno_personalizado_id', $personalizadoId)
                ->where('comentario', $comentario);
            $existente = $query->first();
            $nuevaCantidad = $cantidad + ($existente?->cantidad ?? 0);
            $this->validarStock($carrito, $producto, $cantidad);
            $precio = ReglasCarrito::precio((string) $producto->precio_base, $configuracion['costo']);

            $precioCambiado = $existente !== null && (string) $existente->precio_unitario !== $precio;
            if ($existente !== null) {
                $existente->update(['cantidad' => $nuevaCantidad, 'precio_unitario' => $precio]);
            } else {
                $carrito->items()->create([
                    'producto_id' => $productoId, 'cantidad' => $cantidad,
                    'precio_unitario' => $precio, 'comentario' => $comentario,
                    'diseno_torta_id' => $disenoTortaId, 'plantilla_diseno_id' => $plantillaId,
                    'diseno_personalizado_id' => $personalizadoId,
                ]);
            }

            return $this->presentar($carrito, $precioCambiado ? [(int) $existente->id] : []);
        });
    }

    public function actualizarCantidad(int $usuarioId, int $itemId, int $cantidad): Carrito
    {
        return $this->conCarrito($usuarioId, function (CarritoModelo $carrito) use ($usuarioId, $itemId, $cantidad): Carrito {
            $item = $this->itemPropio($carrito, $itemId);
            $producto = ProductoModelo::query()->with(['torta', 'detalle', 'sublimacion'])->findOrFail($item->producto_id);
            $configuracion = $this->configuracion($usuarioId, $item->producto_id, $item->diseno_torta_id, $item->plantilla_diseno_id, $item->diseno_personalizado_id);
            if (! $producto->activo || ! ReglasCarrito::configuracionValida($this->tipo($producto), $item->diseno_torta_id, $item->plantilla_diseno_id, $item->diseno_personalizado_id) || $configuracion['aviso'] !== null) {
                throw $this->error('Item no disponible.', 'CAR_PRODUCTO_NO_DISPONIBLE');
            }
            $this->validarStock($carrito, $producto, $cantidad - $item->cantidad);
            $precio = ReglasCarrito::precio((string) $producto->precio_base, $configuracion['costo']);
            $precioCambiado = (string) $item->precio_unitario !== $precio;
            $item->update(['cantidad' => $cantidad, 'precio_unitario' => $precio]);

            return $this->presentar($carrito, $precioCambiado ? [$itemId] : []);
        });
    }

    public function eliminarItem(int $usuarioId, int $itemId): Carrito
    {
        return $this->conCarrito($usuarioId, function (CarritoModelo $carrito) use ($itemId): Carrito {
            $this->itemPropio($carrito, $itemId)->delete();

            return $this->presentar($carrito);
        });
    }

    public function vaciar(int $usuarioId): Carrito
    {
        return $this->conCarrito($usuarioId, function (CarritoModelo $carrito): Carrito {
            $carrito->items()->delete();

            return $this->presentar($carrito);
        });
    }

    private function conCarrito(int $usuarioId, callable $accion): Carrito
    {
        return DB::transaction(function () use ($usuarioId, $accion): Carrito {
            UsuarioModelo::query()->whereKey($usuarioId)->lockForUpdate()->firstOrFail();
            $carrito = CarritoModelo::query()->where('usuario_id', $usuarioId)->where('activo', true)->first();
            if ($carrito === null) {
                $carrito = CarritoModelo::create(['usuario_id' => $usuarioId, 'activo' => true]);
            }

            return $accion($carrito);
        }, 3);
    }

    private function itemPropio(CarritoModelo $carrito, int $itemId): DetalleCarritoModelo
    {
        $item = $carrito->items()->find($itemId);
        if ($item !== null) {
            return $item;
        }
        if (DetalleCarritoModelo::query()->whereKey($itemId)->exists()) {
            throw new DominioException('Item de otro carrito.', 'CAR_ITEM_AJENO', 403);
        }

        throw new DominioException('Item no encontrado.', 'CAR_ITEM_NO_ENCONTRADO', 404);
    }

    private function validarStock(CarritoModelo $carrito, ProductoModelo $producto, int $diferencia): void
    {
        if ($producto->detalle === null) {
            return;
        }
        $total = (int) $carrito->items()->where('producto_id', $producto->id)->sum('cantidad') + $diferencia;
        if ($total > $producto->detalle->stock) {
            throw $this->error('Stock insuficiente.', 'CAR_SIN_STOCK');
        }
    }

    private function tipo(ProductoModelo $producto): string
    {
        return match (true) {
            $producto->torta !== null => 'TORTA',
            $producto->detalle !== null => 'DETALLE',
            default => 'SUBLIMACION',
        };
    }

    /** @return array{tipo: ?string, id: ?int, nombre: ?string, costo: string, aviso: ?string} */
    private function configuracion(int $usuarioId, int $productoId, ?int $disenoTortaId, ?int $plantillaId, ?int $personalizadoId): array
    {
        $modelo = null;
        $tipo = null;
        $aviso = null;
        if ($disenoTortaId !== null) {
            $modelo = DisenoTortaModelo::find($disenoTortaId);
            $tipo = 'DISENO_TORTA';
            $aviso = $modelo === null || $modelo->torta_id !== $productoId || ! $modelo->activo ? 'DISENO_NO_DISPONIBLE' : null;
        } elseif ($plantillaId !== null) {
            $modelo = PlantillaDisenoModelo::find($plantillaId);
            $tipo = 'PLANTILLA';
            $aviso = $modelo === null || $modelo->sublimacion_id !== $productoId || ! $modelo->activo ? 'PLANTILLA_NO_DISPONIBLE' : null;
        } elseif ($personalizadoId !== null) {
            $modelo = DisenoPersonalizadoModelo::find($personalizadoId);
            $tipo = 'PERSONALIZADO';
            $aviso = $modelo === null || $modelo->sublimacion_id !== $productoId || $modelo->usuario_id !== $usuarioId ? 'DISENO_NO_DISPONIBLE' : null;
        }

        return [
            'tipo' => $tipo, 'id' => $modelo?->id,
            'nombre' => $tipo === 'PERSONALIZADO' ? null : $modelo?->nombre,
            'costo' => $tipo === 'PERSONALIZADO' ? '0.00' : (string) ($modelo?->costo_adicional ?? '0.00'),
            'aviso' => $aviso,
        ];
    }

    /** @param list<int> $preciosYaActualizados */
    private function presentar(CarritoModelo $carrito, array $preciosYaActualizados = []): Carrito
    {
        $items = $carrito->items()->with(['producto.detalle', 'producto.torta', 'producto.sublimacion', 'producto.multimedia'])->orderBy('id')->get();
        $cantidades = $items->groupBy('producto_id')->map(fn ($grupo): int => (int) $grupo->sum('cantidad'));
        $resultado = [];
        foreach ($items as $item) {
            $producto = $item->producto;
            $tipo = $this->tipo($producto);
            $configuracion = $this->configuracion($carrito->usuario_id, $item->producto_id, $item->diseno_torta_id, $item->plantilla_diseno_id, $item->diseno_personalizado_id);
            $precio = ReglasCarrito::precio((string) $producto->precio_base, $configuracion['costo']);
            $precioActualizado = $precio !== (string) $item->precio_unitario || in_array((int) $item->id, $preciosYaActualizados, true);
            if ($precio !== (string) $item->precio_unitario) {
                $item->update(['precio_unitario' => $precio]);
            }
            $avisos = [];
            if (! $producto->activo) {
                $avisos[] = 'PRODUCTO_INACTIVO';
            }
            if (! ReglasCarrito::configuracionValida($tipo, $item->diseno_torta_id, $item->plantilla_diseno_id, $item->diseno_personalizado_id)) {
                $avisos[] = 'CONFIGURACION_INVALIDA';
            }
            if ($configuracion['aviso'] !== null) {
                $avisos[] = $configuracion['aviso'];
            }
            if ($producto->detalle !== null && $cantidades[$producto->id] > $producto->detalle->stock) {
                $avisos[] = 'STOCK_INSUFICIENTE';
            }
            $imagen = $producto->multimedia->first(fn ($medio): bool => (bool) $medio->pivot->es_principal);
            $baseUrl = rtrim((string) config('app.multimedia_public_base_url', ''), '/');
            $resultado[] = new DetalleCarrito(
                (int) $item->id, (int) $producto->id, $producto->nombre, $tipo,
                $imagen !== null && $baseUrl !== '' ? $baseUrl.'/'.$imagen->ruta_archivo : null,
                $item->cantidad, $precio, $item->comentario,
                $item->diseno_torta_id, $item->plantilla_diseno_id, $item->diseno_personalizado_id,
                $configuracion['tipo'] !== null ? [
                    'tipo' => $configuracion['tipo'], 'id' => $configuracion['id'],
                    'nombre' => $configuracion['nombre'], 'costo_adicional' => $configuracion['costo'],
                ] : null,
                $precioActualizado, $avisos,
            );
        }

        return new Carrito((int) $carrito->id, (int) $carrito->usuario_id, true, $resultado);
    }

    private function error(string $mensaje, string $codigo): DominioException
    {
        return new DominioException($mensaje, $codigo, 400);
    }
}
