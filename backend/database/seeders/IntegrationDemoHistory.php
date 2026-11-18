<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Aplicacion\Carrito\CasosUso\AgregarItem;
use App\Aplicacion\Carrito\DTOs\AgregarItemDTO;
use App\Aplicacion\Notificaciones\CasosUso\MarcarNotificacionLeida;
use App\Aplicacion\Pagos\CasosUso\RegistrarPago;
use App\Aplicacion\Pagos\CasosUso\VerificarPagoAdmin;
use App\Aplicacion\Pagos\DTOs\RegistrarPagoDTO;
use App\Aplicacion\Pedidos\CasosUso\CambiarEstadoPedido;
use App\Aplicacion\Pedidos\CasosUso\CrearPedidoDesdeCarrito;
use App\Aplicacion\Pedidos\DTOs\CrearPedidoDTO;
use App\Aplicacion\Productos\CasosUso\CrearDisenoPersonalizado;
use App\Aplicacion\Productos\DTOs\CrearDisenoPersonalizadoDTO;
use App\Infraestructura\Persistencia\Eloquent\Modelos\NotificacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

final class IntegrationDemoHistory
{
    /** @param array{correo: string, password: string} $cliente */
    public function sembrar(
        array $cliente,
        int $admin,
        ProductoModelo $torta,
        int $flores,
        ProductoModelo $vainilla,
        ProductoModelo $taza,
        int $estrellas,
        ProductoModelo $vaso,
        Closure $imagen,
    ): void {
        $clave = substr(hash('sha256', strtolower(trim($cliente['correo']))), 0, 12);
        $usuario = UsuarioModelo::query()->updateOrCreate(
            ['correo' => "historial-{$clave}@example.test"],
            [
                'rol_id' => 2, 'nombre_completo' => 'Cliente Historial Demo',
                'password_hash' => Hash::make($cliente['password']),
                'correo_verificado' => true, 'terminos_aceptados' => true,
                'version_terminos' => 'demo', 'terminos_aceptados_en' => now(), 'activo' => true,
            ],
        );
        $id = $usuario->id;
        $archivo = $imagen('sublimacion', "personalizaciones/demo-{$clave}.png", 'DISENO_CLIENTE', $id);
        $comprobante = $imagen('comprobante', "comprobantes/demo-{$clave}.pdf", 'COMPROBANTE', $id);
        foreach ([
            ['flores', $torta, $flores, null, null, []],
            ['estrellas', $taza, null, $estrellas, 'TRANSFERENCIA', []],
            ['personalizado', $vaso, null, null, 'RECHAZADO', []],
            ['preparacion', $vainilla, null, null, 'APROBADO', ['EN_PREPARACION']],
            ['entregado', $taza, null, $estrellas, 'APROBADO', ['EN_PREPARACION', 'LISTO', 'ENTREGADO']],
        ] as [$escenario, $producto, $diseno, $plantilla, $pago, $estados]) {
            $marca = 'DEMO historial: '.$escenario;
            $existe = DB::table('ventas.detalles_pedido as item')
                ->join('ventas.pedidos as pedido', 'pedido.id', '=', 'item.pedido_id')
                ->where('pedido.usuario_id', $id)
                ->where('item.indicaciones', 'like', $marca.'%')->exists();
            if ($existe) {
                continue;
            }
            if (DB::table('ventas.detalles_carrito as item')->join('ventas.carritos as carrito', 'carrito.id', '=', 'item.carrito_id')
                ->where('carrito.usuario_id', $id)->where('carrito.activo', true)->exists()) {
                throw new RuntimeException('El carrito de historial contiene productos. Vacíalo antes de crear escenarios faltantes.');
            }

            $personalizado = null;
            if ($escenario === 'personalizado') {
                $personalizado = app(CrearDisenoPersonalizado::class)->execute(
                    $id, new CrearDisenoPersonalizadoDTO($producto->id, $archivo->id, null),
                )->id;
            }
            $carrito = app(AgregarItem::class)->execute(
                $id, new AgregarItemDTO($producto->id, 1, $marca, $diseno, $plantilla, $personalizado),
            );
            $pedido = app(CrearPedidoDesdeCarrito::class)->execute(
                $id, new CrearPedidoDTO(now()->addDays(3)->toDateString(), $carrito->total()),
            );
            if ($pago === 'TRANSFERENCIA') {
                app(RegistrarPago::class)->execute(
                    $id, new RegistrarPagoDTO($pedido->id, 'TRANSFERENCIA', $pedido->total, null, $comprobante->id),
                );
            } elseif ($pago !== null) {
                $registro = app(RegistrarPago::class)->execute(
                    $id, new RegistrarPagoDTO($pedido->id, 'PASARELA', $pedido->total, "DEMO-{$clave}-{$escenario}", null),
                );
                app(VerificarPagoAdmin::class)->execute($admin, $registro->id, $pago, 'Operación de prueba');
            }
            foreach ($estados as $estado) {
                app(CambiarEstadoPedido::class)->execute($pedido->id, $estado);
            }
            if ($escenario === 'entregado') {
                $notificacion = NotificacionModelo::query()->where('pedido_id', $pedido->id)->where('usuario_id', $id)->oldest('id')->first();
                if ($notificacion !== null) {
                    app(MarcarNotificacionLeida::class)->execute($id, $notificacion->id);
                }
            }
        }
    }
}
