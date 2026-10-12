<?php

declare(strict_types=1);

namespace Tests\Integracion\Pedidos;

use App\Aplicacion\Pedidos\CasosUso\CrearPedidoDesdeCarrito;
use App\Aplicacion\Pedidos\DTOs\CrearPedidoDTO;
use App\Dominio\Compartido\Excepciones\DominioException;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CarritoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionProduccionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Throwable;

class PedidosConcurrentesTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_dos_pedidos_simultaneos_no_venden_el_mismo_stock(): void
    {
        $this->requiereFork();
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        DetalleModelo::factory()->create(['producto_id' => $producto->id, 'stock' => 1]);
        $usuarios = $this->dosCarritos($producto->id, '5.00');

        $resultados = $this->crearEnParalelo($usuarios, now()->addDay()->toDateString(), '5.00');

        sort($resultados);
        $this->assertSame(['OK', 'PED_SIN_STOCK'], $resultados);
        $this->assertDatabaseHas('detalles', ['producto_id' => $producto->id, 'stock' => 0]);
        $this->assertDatabaseCount('pedidos', 1);
        $this->assertDatabaseCount('detalles_carrito', 1);
    }

    public function test_dos_pedidos_simultaneos_no_superan_el_cupo(): void
    {
        $this->requiereFork();
        $producto = ProductoModelo::factory()->create(['precio_base' => '5.00']);
        TortaModelo::factory()->create(['producto_id' => $producto->id]);
        $fecha = now()->addDay()->toDateString();
        ConfiguracionProduccionModelo::factory()->create(['fecha' => $fecha, 'categoria_id' => $producto->categoria_id, 'capacidad_maxima' => 1]);
        $usuarios = $this->dosCarritos($producto->id, '5.00');

        $resultados = $this->crearEnParalelo($usuarios, $fecha, '5.00');

        sort($resultados);
        $this->assertSame(['OK', 'PED_SIN_CAPACIDAD'], $resultados);
        $this->assertDatabaseCount('pedidos', 1);
        $this->assertDatabaseCount('detalles_carrito', 1);
    }

    private function requiereFork(): void
    {
        if (! function_exists('pcntl_fork') || ! function_exists('stream_socket_pair')) {
            $this->markTestSkipped('La prueba de concurrencia requiere pcntl y sockets locales.');
        }
    }

    /** @return list<int> */
    private function dosCarritos(int $productoId, string $precio): array
    {
        $usuarios = [];
        for ($indice = 0; $indice < 2; $indice++) {
            $usuario = UsuarioModelo::factory()->verificado()->create();
            $carrito = CarritoModelo::create(['usuario_id' => $usuario->id, 'activo' => true]);
            $carrito->items()->create(['producto_id' => $productoId, 'cantidad' => 1, 'precio_unitario' => $precio]);
            $usuarios[] = (int) $usuario->id;
        }

        return $usuarios;
    }

    /** @param list<int> $usuarios @return list<string> */
    private function crearEnParalelo(array $usuarios, string $fecha, string $total): array
    {
        $procesos = [];
        foreach ($usuarios as $usuarioId) {
            [$padre, $hijo] = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, STREAM_IPPROTO_IP);
            $pid = pcntl_fork();
            if ($pid === 0) {
                fclose($padre);
                DB::purge('pgsql');
                fwrite($hijo, "READY\n");
                fgets($hijo);
                try {
                    app(CrearPedidoDesdeCarrito::class)->execute($usuarioId, new CrearPedidoDTO($fecha, $total));
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
