<?php

declare(strict_types=1);

namespace Tests\Integracion\Pagos;

use App\Aplicacion\Pagos\CasosUso\RegistrarPago;
use App\Aplicacion\Pagos\DTOs\RegistrarPagoDTO;
use App\Dominio\Compartido\Excepciones\DominioException;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PedidoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Throwable;

class PagosConcurrentesTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_dos_registros_simultaneos_del_mismo_pedido_crean_un_solo_pago(): void
    {
        $this->requiereFork();
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $pedido = $this->pedido((int) $cliente->id);

        $resultados = $this->registrarEnParalelo([
            [(int) $cliente->id, (int) $pedido->id, 'REF-A'],
            [(int) $cliente->id, (int) $pedido->id, 'REF-B'],
        ]);

        sort($resultados);
        $this->assertSame(['OK', 'PAG_PAGO_ACTIVO'], $resultados);
        $this->assertDatabaseCount('pagos', 1);
    }

    public function test_una_referencia_simultanea_no_se_asocia_a_dos_pedidos(): void
    {
        $this->requiereFork();
        $cliente = UsuarioModelo::factory()->verificado()->create();
        $primero = $this->pedido((int) $cliente->id);
        $segundo = $this->pedido((int) $cliente->id);

        $resultados = $this->registrarEnParalelo([
            [(int) $cliente->id, (int) $primero->id, 'REF-COMPARTIDA'],
            [(int) $cliente->id, (int) $segundo->id, 'REF-COMPARTIDA'],
        ]);

        sort($resultados);
        $this->assertSame(['OK', 'PAG_REFERENCIA_DUPLICADA'], $resultados);
        $this->assertDatabaseCount('pagos', 1);
    }

    private function requiereFork(): void
    {
        if (! function_exists('pcntl_fork') || ! function_exists('stream_socket_pair')) {
            $this->markTestSkipped('La prueba de concurrencia requiere pcntl y sockets locales.');
        }
    }

    private function pedido(int $usuarioId): PedidoModelo
    {
        return PedidoModelo::create([
            'usuario_id' => $usuarioId, 'fecha_entrega' => now()->addDay()->toDateString(),
            'estado' => 'PENDIENTE', 'subtotal' => '35.00', 'total' => '35.00',
        ]);
    }

    /** @param list<array{int, int, string}> $solicitudes @return list<string> */
    private function registrarEnParalelo(array $solicitudes): array
    {
        $procesos = [];
        foreach ($solicitudes as [$usuarioId, $pedidoId, $referencia]) {
            [$padre, $hijo] = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
            $pid = pcntl_fork();
            if ($pid === 0) {
                fclose($padre);
                DB::purge('pgsql');
                fwrite($hijo, "READY\n");
                fgets($hijo);
                try {
                    app(RegistrarPago::class)->execute($usuarioId, new RegistrarPagoDTO($pedidoId, 'PASARELA', '35.00', $referencia, null));
                    fwrite($hijo, "OK\n");
                } catch (DominioException $excepcion) {
                    fwrite($hijo, $excepcion->codigo_error."\n");
                } catch (Throwable $excepcion) {
                    fwrite($hijo, get_class($excepcion).': '.$excepcion->getMessage()."\n");
                }
                fclose($hijo);
                exit(0);
            }
            fclose($hijo);
            $procesos[] = ['pid' => $pid, 'socket' => $padre];
        }
        foreach ($procesos as $proceso) {
            $this->assertSame('READY', trim((string) fgets($proceso['socket'])));
        }
        foreach ($procesos as $proceso) {
            fwrite($proceso['socket'], "GO\n");
        }
        $resultados = [];
        foreach ($procesos as $proceso) {
            $resultados[] = trim((string) fgets($proceso['socket']));
            fclose($proceso['socket']);
            pcntl_waitpid($proceso['pid'], $estado);
            $this->assertTrue(pcntl_wifexited($estado));
        }

        return $resultados;
    }
}
