<?php

declare(strict_types=1);

namespace Tests\Integracion\Integracion;

use Database\Seeders\IntegrationDemoSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class IntegrationDemoSeederTest extends TestCase
{
    use DatabaseTransactions;

    public function test_crea_cuentas_y_catalogo_repetibles_en_base_aislada(): void
    {
        if (! preg_match('/_(?:demo|test)\z/i', (string) config('database.connections.pgsql.database'))) {
            $this->markTestSkipped('Requiere una base PostgreSQL aislada terminada en _demo o _test.');
        }

        $variables = [
            'INTEGRATION_ADMIN_EMAIL' => 'admin-demo@example.test',
            'INTEGRATION_ADMIN_PASSWORD' => 'DemoAdmin123!',
            'INTEGRATION_CLIENT_EMAIL' => 'cliente-demo@example.test',
            'INTEGRATION_CLIENT_PASSWORD' => 'DemoCliente123!',
        ];
        $anteriores = [];
        foreach ($variables as $nombre => $valor) {
            $anteriores[$nombre] = [$_ENV[$nombre] ?? null, $_SERVER[$nombre] ?? null, getenv($nombre)];
            $_ENV[$nombre] = $valor;
            $_SERVER[$nombre] = $valor;
            putenv($nombre.'='.$valor);
        }

        try {
            config(['app.multimedia_disk' => 'local']);
            Storage::fake('multimedia');
            $this->seed(IntegrationDemoSeeder::class);

            $anterior = DB::table('catalogo.categorias')->whereNull('categoria_padre_id')->where('nombre', 'DEMO Integracion')->value('id');
            $caja = DB::table('catalogo.productos')->where('nombre', 'DEMO Caja regalo')->value('id');
            DB::table('catalogo.productos')->where('id', $caja)->update(['categoria_id' => $anterior]);
            DB::table('catalogo.detalles')->where('producto_id', $caja)->update(['stock' => 17]);
            Storage::disk('multimedia')->delete('productos/demo-detalles-cajas.png');

            $this->seed(IntegrationDemoSeeder::class);

            $raiz = DB::table('catalogo.categorias')->whereNull('categoria_padre_id')->where('nombre', 'Detalles personalizados')->value('id');
            $hijas = DB::table('catalogo.categorias')->where('categoria_padre_id', $raiz)
                ->whereIn('nombre', ['Cajas de regalo', 'Kits personalizados', 'Detalles dulces'])->pluck('id', 'nombre');
            $this->assertCount(3, $hijas);
            $detalles = DB::table('catalogo.productos')->where('tipo', 'DETALLE')
                ->whereIn('categoria_id', [...$hijas->values(), $raiz])
                ->whereIn('nombre', [
                    'DEMO Tarjeta de regalo', 'DEMO Caja regalo', 'DEMO Caja celebración',
                    'DEMO Kit cumpleaños', 'DEMO Kit premium', 'DEMO Bolsa de chocolates', 'DEMO Mini caja dulce',
                ])->get();
            $this->assertCount(7, $detalles);
            $this->assertDatabaseHas('catalogo.productos', ['id' => $caja, 'categoria_id' => $hijas['Cajas de regalo']]);
            $this->assertDatabaseHas('catalogo.detalles', ['producto_id' => $caja, 'stock' => 17]);
            $this->assertDatabaseHas('catalogo.detalles', [
                'producto_id' => $detalles->firstWhere('nombre', 'DEMO Mini caja dulce')->id, 'stock' => 0,
            ]);
            foreach (['cajas', 'kits', 'dulces'] as $imagen) {
                $this->get('/api/v1/multimedia/publico/productos/demo-detalles-'.$imagen.'.png')
                    ->assertOk()->assertHeader('Content-Type', 'image/png');
            }
            $historial = 'historial-'.substr(hash('sha256', $variables['INTEGRATION_CLIENT_EMAIL']), 0, 12).'@example.test';
            $comprador = DB::table('auth.usuarios')->where('correo', $historial)->value('id');
            $pedidos = DB::table('ventas.pedidos')->where('usuario_id', $comprador);
            $this->assertSame(5, (clone $pedidos)->count());
            $this->assertSame(3, (clone $pedidos)->where('estado', 'PENDIENTE')->count());
            $this->assertSame(1, (clone $pedidos)->where('estado', 'ENTREGADO')->count());
            $this->assertSame(1, (clone $pedidos)->where('estado', 'EN_PREPARACION')->count());
            $pagos = DB::table('pagos.pagos')->whereIn('pedido_id', (clone $pedidos)->select('id'));
            $this->assertSame(4, (clone $pagos)->count());
            $this->assertSame(1, (clone $pagos)->where('estado', 'RECHAZADO')->count());
            $this->assertSame(1, (clone $pagos)->where('metodo', 'TRANSFERENCIA')->where('estado', 'PENDIENTE')->count());
            $this->assertDatabaseHas('notificaciones.notificaciones', ['usuario_id' => $comprador, 'leida' => true]);
            $this->assertDatabaseHas('notificaciones.notificaciones', ['usuario_id' => $comprador, 'leida' => false]);
            $this->assertSame(3, DB::table('publicaciones.publicaciones')
                ->where('usuario_id', DB::table('auth.usuarios')->where('correo', $variables['INTEGRATION_ADMIN_EMAIL'])->value('id'))
                ->whereIn('titulo', ['DEMO Repostería para celebrar', 'DEMO Regalos sublimados', 'DEMO Colección anterior'])->count());

            $this->postJson('/api/v1/auth/login', ['correo' => $variables['INTEGRATION_CLIENT_EMAIL'], 'password' => $variables['INTEGRATION_CLIENT_PASSWORD']])
                ->assertOk()->assertJsonPath('data.usuario.rol', 'CLIENTE');
            $this->postJson('/api/v1/auth/login', ['correo' => $variables['INTEGRATION_ADMIN_EMAIL'], 'password' => $variables['INTEGRATION_ADMIN_PASSWORD']])
                ->assertOk()->assertJsonPath('data.usuario.rol', 'ADMIN');
            $token = $this->postJson('/api/v1/auth/login', [
                'correo' => $historial, 'password' => $variables['INTEGRATION_CLIENT_PASSWORD'],
            ])->assertOk()->json('data.token');
            $pagoTransferencia = (clone $pagos)->where('metodo', 'TRANSFERENCIA')->value('id');
            $comprobante = DB::table('pagos.comprobantes_pago')->where('pago_id', $pagoTransferencia)->value('multimedia_id');
            $this->assertNotNull($comprobante);
            $this->withToken($token)->get('/api/v1/multimedia/'.$comprobante.'/archivo')
                ->assertOk()->assertHeader('Content-Type', 'application/pdf');
            $this->getJson('/api/v1/productos')->assertOk();
        } finally {
            foreach ($anteriores as $nombre => [$env, $server, $getenv]) {
                if ($env === null) {
                    unset($_ENV[$nombre]);
                } else {
                    $_ENV[$nombre] = $env;
                }
                if ($server === null) {
                    unset($_SERVER[$nombre]);
                } else {
                    $_SERVER[$nombre] = $server;
                }
                if ($getenv === false) {
                    putenv($nombre);
                } else {
                    putenv($nombre.'='.$getenv);
                }
            }
        }
    }

    public function test_rechaza_base_sin_sufijo_demo_o_test(): void
    {
        $conexion = DB::connection();
        $nombreOriginal = $conexion->getDatabaseName();
        $conexion->setDatabaseName('postgres');

        try {
            $this->expectException(RuntimeException::class);
            (new IntegrationDemoSeeder)->run();
        } finally {
            $conexion->setDatabaseName($nombreOriginal);
        }
    }
}
