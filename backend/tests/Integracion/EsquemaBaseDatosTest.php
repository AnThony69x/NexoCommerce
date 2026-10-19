<?php

namespace Tests\Integracion;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EsquemaBaseDatosTest extends TestCase
{
    use DatabaseTransactions;

    public function test_no_crea_la_tabla_users_de_laravel(): void
    {
        $this->assertFalse(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('auth.usuarios'));
    }

    public function test_crea_las_25_tablas_de_negocio(): void
    {
        $tablas = [
            'auth.roles',
            'auth.usuarios',
            'auth.cuentas_oauth',
            'auth.verificaciones_correo',
            'media.multimedia',
            'tienda.configuracion_tienda',
            'catalogo.categorias',
            'catalogo.productos',
            'catalogo.tortas',
            'catalogo.detalles',
            'catalogo.sublimaciones',
            'catalogo.disenos_torta',
            'catalogo.plantillas_diseno',
            'ventas.disenos_personalizados',
            'catalogo.producto_multimedia',
            'publicaciones.publicaciones',
            'publicaciones.publicacion_multimedia',
            'ventas.carritos',
            'ventas.detalles_carrito',
            'ventas.pedidos',
            'ventas.detalles_pedido',
            'produccion.configuracion_produccion',
            'pagos.pagos',
            'pagos.comprobantes_pago',
            'notificaciones.notificaciones',
        ];

        foreach ($tablas as $tabla) {
            $this->assertTrue(Schema::hasTable($tabla), "Falta la tabla {$tabla}");
        }
    }

    public function test_seed_crea_roles_admin_cliente_y_tienda_dulces_aesca(): void
    {
        $this->seed();

        $this->assertDatabaseHas('auth.roles', ['id' => 1, 'nombre' => 'ADMIN']);
        $this->assertDatabaseHas('auth.roles', ['id' => 2, 'nombre' => 'CLIENTE']);
        $this->assertDatabaseHas('tienda.configuracion_tienda', [
            'nombre_tienda' => 'Dulces Aesca',
            'color_primario' => '#8B5CF6',
            'color_secundario' => '#EC4899',
        ]);
    }
}
