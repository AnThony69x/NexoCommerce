<?php

namespace Tests\Integracion;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EsquemaBaseDatosTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_crea_la_tabla_users_de_laravel(): void
    {
        $this->assertFalse(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('usuarios'));
    }

    public function test_crea_las_25_tablas_de_negocio(): void
    {
        $tablas = [
            'roles',
            'usuarios',
            'cuentas_oauth',
            'verificaciones_correo',
            'multimedia',
            'configuracion_tienda',
            'categorias',
            'productos',
            'tortas',
            'detalles',
            'sublimaciones',
            'disenos_torta',
            'plantillas_diseno',
            'disenos_personalizados',
            'producto_multimedia',
            'publicaciones',
            'publicacion_multimedia',
            'carritos',
            'detalles_carrito',
            'pedidos',
            'detalles_pedido',
            'configuracion_produccion',
            'pagos',
            'comprobantes_pago',
            'notificaciones',
        ];

        foreach ($tablas as $tabla) {
            $this->assertTrue(Schema::hasTable($tabla), "Falta la tabla {$tabla}");
        }
    }

    public function test_seed_crea_roles_admin_cliente_y_tienda_dulces_aesca(): void
    {
        $this->seed();

        $this->assertDatabaseHas('roles', ['id' => 1, 'nombre' => 'ADMIN']);
        $this->assertDatabaseHas('roles', ['id' => 2, 'nombre' => 'CLIENTE']);
        $this->assertDatabaseHas('configuracion_tienda', [
            'nombre_tienda' => 'Dulces Aesca',
            'color_primario' => '#8B5CF6',
            'color_secundario' => '#EC4899',
        ]);
    }
}
