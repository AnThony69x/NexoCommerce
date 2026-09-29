<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionProduccionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\SublimacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\TortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class IntegrationDemoSeeder extends Seeder
{
    public function run(): void
    {
        $base = (string) DB::connection()->getDatabaseName();
        if (! app()->environment(['local', 'testing']) || DB::getDriverName() !== 'pgsql'
            || preg_match('/_(?:demo|test)\z/i', $base) !== 1) {
            throw new RuntimeException('El seeder de integracion exige APP_ENV local/testing y una base PostgreSQL terminada en _demo o _test.');
        }

        $credenciales = [];
        foreach (['ADMIN', 'CLIENT'] as $rol) {
            $correo = (string) env('INTEGRATION_'.$rol.'_EMAIL', '');
            $password = (string) env('INTEGRATION_'.$rol.'_PASSWORD', '');
            if (filter_var($correo, FILTER_VALIDATE_EMAIL) === false || mb_strlen($password) < 8) {
                throw new RuntimeException('Faltan credenciales validas INTEGRATION_'.$rol.'_EMAIL y _PASSWORD.');
            }
            $credenciales[$rol] = ['correo' => $correo, 'password' => $password];
        }
        if ($credenciales['ADMIN']['correo'] === $credenciales['CLIENT']['correo']) {
            throw new RuntimeException('ADMIN y CLIENT deben usar correos distintos.');
        }

        DB::transaction(function () use ($credenciales): void {
            $this->call([RolesSeeder::class, ConfiguracionTiendaSeeder::class]);
            foreach (['ADMIN' => 1, 'CLIENT' => 2] as $rol => $rolId) {
                UsuarioModelo::query()->updateOrCreate(
                    ['correo' => $credenciales[$rol]['correo']],
                    [
                        'rol_id' => $rolId, 'nombre_completo' => $rol === 'ADMIN' ? 'Admin Integracion' : 'Cliente Integracion',
                        'password_hash' => Hash::make($credenciales[$rol]['password']),
                        'correo_verificado' => true, 'terminos_aceptados' => true,
                        'version_terminos' => 'demo', 'terminos_aceptados_en' => now(), 'activo' => true,
                    ],
                );
            }

            $categoria = CategoriaModelo::query()->firstOrCreate(
                ['categoria_padre_id' => null, 'nombre' => 'DEMO Integracion'],
                ['descripcion' => 'Catalogo exclusivo para pruebas de integracion.', 'activo' => true],
            );
            $detalle = ProductoModelo::query()->firstOrCreate(
                ['categoria_id' => $categoria->id, 'nombre' => 'DEMO Caja regalo'],
                ['descripcion' => 'Producto con stock para probar el checkout.', 'precio_base' => '5.00', 'activo' => true],
            );
            DetalleModelo::query()->firstOrCreate(['producto_id' => $detalle->id], ['stock' => 25]);

            $torta = ProductoModelo::query()->firstOrCreate(
                ['categoria_id' => $categoria->id, 'nombre' => 'DEMO Torta chocolate'],
                ['descripcion' => 'Torta con diseno del catalogo.', 'precio_base' => '20.00', 'activo' => true],
            );
            TortaModelo::query()->firstOrCreate(['producto_id' => $torta->id], ['tamano' => 'Mediana', 'porciones' => 12, 'sabor' => 'Chocolate']);
            DisenoTortaModelo::query()->firstOrCreate(
                ['torta_id' => $torta->id, 'nombre' => 'DEMO Flores'],
                ['costo_adicional' => '2.00', 'activo' => true],
            );

            $sublimacion = ProductoModelo::query()->firstOrCreate(
                ['categoria_id' => $categoria->id, 'nombre' => 'DEMO Taza'],
                ['descripcion' => 'Sublimacion con plantilla.', 'precio_base' => '8.00', 'activo' => true],
            );
            SublimacionModelo::query()->firstOrCreate(['producto_id' => $sublimacion->id], ['tipo_material' => 'Ceramica']);
            PlantillaDisenoModelo::query()->firstOrCreate(
                ['sublimacion_id' => $sublimacion->id, 'nombre' => 'DEMO Estrellas'],
                ['costo_adicional' => '1.00', 'activo' => true],
            );

            foreach (range(1, 30) as $dia) {
                ConfiguracionProduccionModelo::query()->firstOrCreate(
                    ['fecha' => now()->addDays($dia)->toDateString(), 'categoria_id' => $categoria->id],
                    ['capacidad_maxima' => 50, 'activo' => true],
                );
            }
        });
    }
}
