<?php

declare(strict_types=1);

namespace Tests\Integracion\Notificaciones;

use App\Aplicacion\Notificaciones\Enrutamiento\ProcesarMensajePedido;
use App\Dominio\Notificaciones\Eventos\EstadoPedidoCambiado;
use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;
use Illuminate\Support\Facades\Event;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use Psr\Log\LoggerInterface;
use Tests\TestCase;

final class EnrutamientoAvisosPedidoTest extends TestCase
{
    #[DataProvider('casos')]
    public function test_distribuye_el_evento_y_registra_la_decision(
        int $caso,
        string $estado,
        array $esperado,
        ?string $titulo,
    ): void {
        $evento = new EstadoPedidoCambiado(125, 7, $estado);
        $mensaje = $evento->mensaje();
        $correlacion = "practica32-caso-{$caso}";
        $this->app->make('request')->headers->set('X-Request-Id', $correlacion);
        $avisos = [];
        $trazas = [];
        $repositorio = Mockery::mock(NotificacionRepositorioInterface::class);
        $repositorio->shouldReceive('guardar')->zeroOrMoreTimes()->andReturnUsing(
            static function (...$argumentos) use (&$avisos): void {
                $avisos[] = $argumentos;
            },
        );
        $logger = Mockery::mock(LoggerInterface::class);
        $logger->shouldReceive('log')->zeroOrMoreTimes()->andReturnUsing(
            static function (string $nivel, string $evento, array $contexto) use (&$trazas): void {
                $trazas[] = ['nivel' => $nivel, 'evento' => $evento, ...$contexto];
            },
        );
        $this->app->instance(NotificacionRepositorioInterface::class, $repositorio);
        $this->app->instance(LoggerInterface::class, $logger);

        Event::dispatch($evento);

        $this->assertSame($titulo === null ? [] : [[
            7, 125, null, 'PEDIDO_'.$estado, $titulo, "Tu pedido 125 ahora esta {$estado}.",
        ]], $avisos);
        $this->assertSame([[
            'nivel' => $titulo === null ? 'warning' : 'info',
            'evento' => 'notificaciones.estado_pedido',
            'id' => "pedido-125-{$estado}",
            'tipo' => 'PEDIDO_'.$estado,
            'correlacion_id' => $correlacion,
            ...$esperado,
        ]], $trazas);
        $mensaje['correlacion_id'] = $trazas[0]['correlacion_id'];
        $this->registrarEvidencia($caso, $mensaje, array_intersect_key($trazas[0], $esperado), $avisos, $trazas[0]);
    }

    public function test_rechaza_el_mensaje_sin_prioridad_antes_de_entregarlo(): void
    {
        $mensaje = (new EstadoPedidoCambiado(125, 7, 'LISTO'))->mensaje();
        unset($mensaje['prioridad']);
        $repositorio = Mockery::mock(NotificacionRepositorioInterface::class);
        $repositorio->shouldNotReceive('guardar');
        $this->app->instance(NotificacionRepositorioInterface::class, $repositorio);

        $resultado = $this->app->make(ProcesarMensajePedido::class)->ejecutar($mensaje);

        $this->assertSame(['resultado' => 'invalido', 'destino' => null, 'motivo' => 'contrato_invalido'], $resultado);
        $this->registrarEvidencia(6, $mensaje, $resultado, [], null);
    }

    public static function casos(): array
    {
        return [
            'preparacion' => [1, 'EN_PREPARACION', ['resultado' => 'procesado', 'destino' => 'preparacion', 'motivo' => null], 'Pedido en preparacion'],
            'entrega' => [2, 'LISTO', ['resultado' => 'procesado', 'destino' => 'entrega', 'motivo' => null], 'Pedido listo'],
            'cancelacion' => [3, 'CANCELADO', ['resultado' => 'procesado', 'destino' => 'cancelacion', 'motivo' => null], 'Pedido cancelado'],
            'tipo desconocido' => [4, 'DESCONOCIDO', ['resultado' => 'no_enrutable', 'destino' => 'no_enrutables', 'motivo' => 'tipo_desconocido'], null],
            'aviso inicial duplicado' => [5, 'PENDIENTE', ['resultado' => 'filtrado', 'destino' => null, 'motivo' => 'aviso_inicial_cubierto'], null],
            'entregado conserva su aviso' => [7, 'ENTREGADO', ['resultado' => 'procesado', 'destino' => 'entrega', 'motivo' => null], 'Pedido entregado'],
        ];
    }

    private function registrarEvidencia(int $caso, array $mensaje, array $resultado, array $avisos, ?array $traza): void
    {
        if (getenv('EVIDENCIA_ENRUTAMIENTO') === '1') {
            fwrite(STDOUT, PHP_EOL.'EVIDENCIA '.json_encode([
                'caso' => $caso, 'entrada' => $mensaje, 'resultado' => $resultado, 'avisos' => $avisos, 'traza' => $traza,
            ], JSON_THROW_ON_ERROR).PHP_EOL);
        }
    }
}
