<?php

declare(strict_types=1);

namespace Tests\Integracion\Produccion;

use App\Aplicacion\Produccion\CasosUso\VerificarCapacidadProduccion;
use App\Aplicacion\Produccion\DTOs\SolicitudCapacidadProduccionDTO;
use App\Dominio\Produccion\Excepciones\CapacidadProduccionExcedidaException;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionProduccionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProduccionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_disponibilidad_aplica_cupo_global_y_especifico_y_excluye_entregados(): void
    {
        $fecha = '2026-10-10';
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $otraCategoria = CategoriaModelo::factory()->raiz()->create();
        $producto = ProductoModelo::factory()->create(['categoria_id' => $categoria->id]);
        $otroProducto = ProductoModelo::factory()->create(['categoria_id' => $otraCategoria->id]);
        ConfiguracionProduccionModelo::factory()->create([
            'fecha' => $fecha,
            'categoria_id' => null,
            'capacidad_maxima' => 20,
        ]);
        ConfiguracionProduccionModelo::factory()->create([
            'fecha' => $fecha,
            'categoria_id' => $categoria->id,
            'capacidad_maxima' => 7,
        ]);
        $this->crearPedido($fecha, 'PENDIENTE', [[$producto->id, 4], [$otroProducto->id, 3]]);
        $this->crearPedido($fecha, 'ENTREGADO', [[$producto->id, 100]]);

        $this->getJson("/api/v1/produccion/disponibilidad?fecha={$fecha}&categoria_id={$categoria->id}")
            ->assertOk()
            ->assertExactJson([
                'success' => true,
                'data' => [
                    'fecha' => $fecha,
                    'categoria_id' => $categoria->id,
                    'capacidad_maxima' => 7,
                    'ocupado' => 4,
                    'disponible' => 3,
                ],
            ]);

        $this->getJson("/api/v1/produccion/disponibilidad?fecha={$fecha}")
            ->assertOk()
            ->assertJsonPath('data.categoria_id', null)
            ->assertJsonPath('data.ocupado', 7)
            ->assertJsonPath('data.disponible', 13);
    }

    public function test_disponibilidad_sin_configuracion_responde_404(): void
    {
        $this->getJson('/api/v1/produccion/disponibilidad?fecha=2026-10-10')
            ->assertNotFound()
            ->assertJsonPath('codigo_error', 'PRD_CAPACIDAD_NO_CONFIGURADA');
    }

    public function test_creacion_valida_capacidad_y_rechaza_configuracion_activa_duplicada(): void
    {
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $token = $this->tokenAdmin();
        $payload = [
            'fecha' => '2026-10-11',
            'categoria_id' => $categoria->id,
            'capacidad_maxima' => 15,
        ];

        $this->withToken($token)->postJson('/api/v1/admin/produccion', [
            ...$payload,
            'capacidad_maxima' => 0,
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['capacidad_maxima']]);

        $creada = $this->withToken($token)->postJson('/api/v1/admin/produccion', $payload)
            ->assertCreated()
            ->assertJsonPath('data.capacidad_maxima', 15)
            ->assertJsonPath('data.ocupado', 0)
            ->assertJsonPath('data.disponible', 15);
        $id = (int) $creada->json('data.id');
        $this->assertDatabaseHas('configuracion_produccion', ['id' => $id, 'activo' => true]);

        $this->withToken($token)->postJson('/api/v1/admin/produccion', $payload)
            ->assertUnprocessable()
            ->assertJsonPath('codigo_error', 'PRD_CONFIG_DUPLICADA');

        $this->withToken($token)->postJson('/api/v1/admin/produccion', $payload + ['activo' => false])
            ->assertCreated();
    }

    public function test_put_conserva_omitidos_reactiva_si_no_hay_duplicado_y_delete_desactiva(): void
    {
        $configuracion = ConfiguracionProduccionModelo::factory()->inactiva()->create([
            'fecha' => '2026-10-12',
            'capacidad_maxima' => 10,
        ]);
        $token = $this->tokenAdmin();

        $this->withToken($token)->putJson("/api/v1/admin/produccion/{$configuracion->id}", [
            'capacidad_maxima' => 6,
            'activo' => true,
        ])->assertOk()
            ->assertJsonPath('data.fecha', '2026-10-12')
            ->assertJsonPath('data.capacidad_maxima', 6)
            ->assertJsonPath('data.activo', true);

        $this->withToken($token)->deleteJson("/api/v1/admin/produccion/{$configuracion->id}")
            ->assertOk();
        $this->assertDatabaseHas('configuracion_produccion', [
            'id' => $configuracion->id,
            'activo' => false,
        ]);
    }

    public function test_reactivar_una_configuracion_duplicada_responde_422(): void
    {
        $fecha = '2026-10-13';
        ConfiguracionProduccionModelo::factory()->create(['fecha' => $fecha]);
        $inactiva = ConfiguracionProduccionModelo::factory()->inactiva()->create(['fecha' => $fecha]);

        $this->withToken($this->tokenAdmin())
            ->putJson("/api/v1/admin/produccion/{$inactiva->id}", ['activo' => true])
            ->assertUnprocessable()
            ->assertJsonPath('codigo_error', 'PRD_CONFIG_DUPLICADA');
        $this->assertDatabaseHas('configuracion_produccion', ['id' => $inactiva->id, 'activo' => false]);
    }

    public function test_listado_admin_filtra_fecha_categoria_y_estado_con_ocupacion(): void
    {
        $fecha = '2026-10-14';
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $producto = ProductoModelo::factory()->create(['categoria_id' => $categoria->id]);
        ConfiguracionProduccionModelo::factory()->create([
            'fecha' => $fecha,
            'categoria_id' => $categoria->id,
            'capacidad_maxima' => 10,
        ]);
        ConfiguracionProduccionModelo::factory()->inactiva()->create([
            'fecha' => $fecha,
            'categoria_id' => null,
        ]);
        $this->crearPedido($fecha, 'EN_PREPARACION', [[$producto->id, 3]]);

        $this->withToken($this->tokenAdmin())
            ->getJson("/api/v1/admin/produccion?fecha={$fecha}&categoria_id={$categoria->id}&activo=1")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.ocupado', 3)
            ->assertJsonPath('data.0.disponible', 7);
    }

    public function test_verificador_rechaza_exceso_global_y_torta_sin_configuracion(): void
    {
        $fecha = '2026-10-15';
        $categoria = CategoriaModelo::factory()->raiz()->create();
        $producto = ProductoModelo::factory()->create(['categoria_id' => $categoria->id]);
        ConfiguracionProduccionModelo::factory()->create([
            'fecha' => $fecha,
            'capacidad_maxima' => 5,
        ]);
        $this->crearPedido($fecha, 'PENDIENTE', [[$producto->id, 4]]);
        $verificador = $this->app->make(VerificarCapacidadProduccion::class);

        try {
            DB::transaction(fn () => $verificador->execute(
                new SolicitudCapacidadProduccionDTO($fecha, [$categoria->id => 2], [$categoria->id]),
            ));
            $this->fail('Se esperaba capacidad excedida.');
        } catch (CapacidadProduccionExcedidaException $excepcion) {
            $this->assertSame('PED_SIN_CAPACIDAD', $excepcion->codigo_error);
        }

        $this->expectException(CapacidadProduccionExcedidaException::class);
        DB::transaction(fn () => $verificador->execute(
            new SolicitudCapacidadProduccionDTO('2026-10-16', [$categoria->id => 1], [$categoria->id]),
        ));
    }

    public function test_rutas_administrativas_exigen_token_y_rol_admin(): void
    {
        $rutas = [
            ['GET', '/api/v1/admin/produccion'],
            ['POST', '/api/v1/admin/produccion'],
            ['PUT', '/api/v1/admin/produccion/999999'],
            ['DELETE', '/api/v1/admin/produccion/999999'],
        ];

        foreach ($rutas as [$metodo, $ruta]) {
            $this->json($metodo, $ruta)->assertUnauthorized();
        }

        $this->withToken($this->tokenCliente());
        foreach ($rutas as [$metodo, $ruta]) {
            $this->json($metodo, $ruta)
                ->assertForbidden()
                ->assertJsonPath('codigo_error', 'AUTH_FORBIDDEN');
        }
    }

    /** @param list<array{0: int, 1: int}> $items */
    private function crearPedido(string $fecha, string $estado, array $items): int
    {
        $usuario = UsuarioModelo::factory()->verificado()->create();
        $pedidoId = (int) DB::table('pedidos')->insertGetId([
            'usuario_id' => $usuario->id,
            'fecha_entrega' => $fecha,
            'estado' => $estado,
            'subtotal' => 0,
            'total' => 0,
            'creado_en' => now(),
            'actualizado_en' => now(),
        ]);

        foreach ($items as [$productoId, $cantidad]) {
            DB::table('detalles_pedido')->insert([
                'pedido_id' => $pedidoId,
                'producto_id' => $productoId,
                'nombre_producto' => 'Producto de prueba',
                'cantidad' => $cantidad,
                'precio_unitario' => 0,
                'subtotal' => 0,
                'costo_diseno' => 0,
                'creado_en' => now(),
            ]);
        }

        return $pedidoId;
    }

    private function tokenAdmin(): string
    {
        return UsuarioModelo::factory()->admin()->create()->createToken('test')->plainTextToken;
    }

    private function tokenCliente(): string
    {
        return UsuarioModelo::factory()->verificado()->create()->createToken('test')->plainTextToken;
    }
}
