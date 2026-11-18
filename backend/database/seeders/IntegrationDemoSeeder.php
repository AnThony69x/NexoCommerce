<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Aplicacion\Multimedia\Contratos\AlmacenamientoArchivosInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CategoriaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ConfiguracionProduccionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PublicacionModelo;
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
                $cuentas[$rol] = UsuarioModelo::query()->updateOrCreate(
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
            $this->sembrarDetalles($categoria);

            $reposteria = CategoriaModelo::query()->firstOrCreate(
                ['categoria_padre_id' => null, 'nombre' => 'Repostería'],
                ['activo' => true],
            );
            $tortas = CategoriaModelo::query()->firstOrCreate(
                ['categoria_padre_id' => $reposteria->id, 'nombre' => 'Tortas'],
                ['activo' => true],
            );

            $torta = ProductoModelo::query()
                ->where(['categoria_id' => $categoria->id, 'nombre' => 'DEMO Torta chocolate', 'tipo' => 'TORTA'])
                ->first();

            if ($torta !== null) {
                $torta->categoria_id = $tortas->id;
                $torta->save();
            } else {
                $torta = ProductoModelo::query()->firstOrCreate(
                    ['categoria_id' => $tortas->id, 'nombre' => 'DEMO Torta chocolate', 'tipo' => 'TORTA'],
                    ['descripcion' => 'Torta con diseno del catalogo.', 'precio_base' => '20.00', 'activo' => true],
                );
            }
            TortaModelo::query()->firstOrCreate(['producto_id' => $torta->id], ['tamano' => 'Mediana', 'porciones' => 12, 'sabor' => 'Chocolate']);
            $flores = DisenoTortaModelo::query()->firstOrCreate(
                ['torta_id' => $torta->id, 'nombre' => 'DEMO Flores'],
                ['costo_adicional' => '2.00', 'activo' => true, 'multimedia_id' => $this->imagenFixture('reposteria', 'disenos/demo-flores.png', 'DISENO_TORTA')->id],
            );

            $postres = $this->categoriaDemo('Postres y tartas', $reposteria->id);
            $vainilla = $this->tortaDemo($tortas->id, 'DEMO Torta vainilla', '18.00', 'Vainilla', 12);
            $this->tortaDemo($postres->id, 'DEMO Cheesecake de frutos rojos', '24.00', 'Frutos rojos', 8);
            $this->tortaDemo($postres->id, 'DEMO Tarta de limón', '16.00', 'Limón', 8);

            $sublimacion = $this->categoriaDemo('Sublimación');
            $tazas = $this->categoriaDemo('Tazas', $sublimacion->id);
            $regalos = $this->categoriaDemo('Regalos sublimados', $sublimacion->id);
            $anterior = ProductoModelo::query()->where([
                'categoria_id' => $categoria->id, 'nombre' => 'DEMO Taza', 'tipo' => 'SUBLIMACION',
            ])->first();
            $anterior?->update(['categoria_id' => $tazas->id]);
            $taza = $this->sublimacionDemo($tazas->id, 'DEMO Taza', '8.00', 'Cerámica');
            $this->sublimacionDemo($tazas->id, 'DEMO Taza negra', '12.00', 'Cerámica');
            $vaso = $this->sublimacionDemo($regalos->id, 'DEMO Vaso térmico', '25.00', 'Acero inoxidable');
            $bolsa = $this->sublimacionDemo($regalos->id, 'DEMO Bolsa de tela', '15.00', 'Poliéster');
            $estrellas = $this->plantillaDemo($taza, 'DEMO Estrellas', '1.00', 'estrellas');
            $this->plantillaDemo($bolsa, 'DEMO Regalo', '2.00', 'regalo');
            $this->enlazarImagen($torta, 'reposteria');

            foreach (range(1, 30) as $dia) {
                $fecha = now()->addDays($dia)->toDateString();
                foreach ([$categoria->id, $tortas->id, $postres->id] as $categoriaId) {
                    ConfiguracionProduccionModelo::query()->firstOrCreate(
                        ['fecha' => $fecha, 'categoria_id' => $categoriaId],
                        ['capacidad_maxima' => 50, 'activo' => true],
                    );
                }
            }
            $this->repararDiseno($flores->multimedia_id, 'reposteria');
            $this->publicaciones($cuentas['ADMIN']->id, $torta, $taza);
            app(IntegrationDemoHistory::class)->sembrar(
                $credenciales['CLIENT'], $cuentas['ADMIN']->id,
                $torta, $flores->id, $vainilla, $taza, $estrellas->id, $vaso, $this->imagenFixture(...),
            );
        });
    }

    private function sembrarDetalles(CategoriaModelo $categoriaAnterior): void
    {
        $raiz = CategoriaModelo::query()->firstOrCreate(
            ['categoria_padre_id' => null, 'nombre' => 'Detalles personalizados'],
            ['activo' => true],
        );
        $familias = [
            [null, 'cajas', [
                ['DEMO Tarjeta de regalo', 'Tarjeta para acompañar un regalo con tu mensaje.', '8.00', 40],
            ]],
            ['Cajas de regalo', 'cajas', [
                ['DEMO Caja regalo', 'Caja con una selección de dulces para regalar.', '5.00', 25],
                ['DEMO Caja celebración', 'Caja surtida para una ocasión especial.', '28.00', 12],
            ]],
            ['Kits personalizados', 'kits', [
                ['DEMO Kit cumpleaños', 'Kit con accesorios y una tarjeta para cumpleaños.', '24.00', 18],
                ['DEMO Kit premium', 'Selección de regalos con presentación especial.', '45.00', 8],
            ]],
            ['Detalles dulces', 'dulces', [
                ['DEMO Bolsa de chocolates', 'Bolsa con chocolates artesanales surtidos.', '12.00', 30],
                ['DEMO Mini caja dulce', 'Caja pequeña con bocados dulces.', '16.00', 0],
            ]],
        ];
        $imagenes = [];
        foreach ($familias as [$nombre, $archivo, $productos]) {
            $categoria = $nombre === null ? $raiz : CategoriaModelo::query()->firstOrCreate(
                ['categoria_padre_id' => $raiz->id, 'nombre' => $nombre],
                ['activo' => true],
            );
            $imagen = $imagenes[$archivo] ??= $this->imagenDetalle($archivo);

            foreach ($productos as [$producto, $descripcion, $precio, $stock]) {
                $claves = ['nombre' => $producto, 'tipo' => 'DETALLE'];
                if ($producto === 'DEMO Caja regalo') {
                    $anterior = ProductoModelo::query()
                        ->where($claves + ['categoria_id' => $categoriaAnterior->id])->first();
                    if ($anterior !== null) {
                        $anterior->categoria_id = $categoria->id;
                        $anterior->save();
                    }
                }
                $detalle = ProductoModelo::query()->firstOrCreate(
                    $claves + ['categoria_id' => $categoria->id],
                    ['descripcion' => $descripcion, 'precio_base' => $precio, 'activo' => true],
                );
                DetalleModelo::query()->firstOrCreate(['producto_id' => $detalle->id], ['stock' => $stock]);
                if (! $detalle->multimedia()->wherePivot('es_principal', true)->exists()) {
                    $detalle->multimedia()->syncWithoutDetaching([$imagen->id => ['orden' => 1, 'es_principal' => true]]);
                }
            }
        }
    }

    private function imagenDetalle(string $archivo): MultimediaModelo
    {
        return $this->imagenFixture($archivo, 'productos/demo-detalles-'.$archivo.'.png', 'PRODUCTO');
    }

    public function imagenFixture(string $archivo, string $ruta, string $modulo, ?int $propietario = null): MultimediaModelo
    {
        $nombre = basename($ruta);
        $extension = pathinfo($nombre, PATHINFO_EXTENSION);
        $contenido = file_get_contents(__DIR__.'/fixtures/detalles/'.$archivo.'.'.$extension);
        $dimensiones = $contenido === false ? false : getimagesizefromstring($contenido);
        if ($contenido === false || ($extension !== 'pdf' && $dimensiones === false)) {
            throw new RuntimeException('Imagen de demostración inválida: '.$nombre);
        }

        $almacenamiento = app(AlmacenamientoArchivosInterface::class);
        if ($almacenamiento->leer($ruta) !== $contenido) {
            $almacenamiento->guardar($ruta, $contenido);
        }

        return MultimediaModelo::query()->updateOrCreate(
            ['ruta_archivo' => $ruta],
            [
                'nombre_archivo' => $nombre, 'modulo' => $modulo, 'subido_por_id' => $propietario, 'tipo_mime' => $extension === 'pdf' ? 'application/pdf' : 'image/png',
                'checksum_sha256' => hash('sha256', $contenido), 'tamano_bytes' => strlen($contenido),
                'ancho' => $dimensiones[0] ?? null, 'alto' => $dimensiones[1] ?? null, 'activo' => true,
            ],
        );
    }

    private function categoriaDemo(string $nombre, ?int $padre = null): CategoriaModelo
    {
        return CategoriaModelo::query()->firstOrCreate(
            ['nombre' => $nombre, 'categoria_padre_id' => $padre], ['activo' => true],
        );
    }

    private function productoDemo(int $categoria, string $nombre, string $tipo, string $precio): ProductoModelo
    {
        return ProductoModelo::query()->firstOrCreate(
            ['categoria_id' => $categoria, 'nombre' => $nombre, 'tipo' => $tipo],
            ['precio_base' => $precio, 'activo' => true],
        );
    }

    private function tortaDemo(int $categoria, string $nombre, string $precio, string $sabor, int $porciones): ProductoModelo
    {
        $producto = $this->productoDemo($categoria, $nombre, 'TORTA', $precio);
        TortaModelo::query()->firstOrCreate(
            ['producto_id' => $producto->id], ['tamano' => 'Mediana', 'porciones' => $porciones, 'sabor' => $sabor],
        );
        $this->enlazarImagen($producto, 'reposteria');

        return $producto;
    }

    private function sublimacionDemo(int $categoria, string $nombre, string $precio, string $material): ProductoModelo
    {
        $producto = $this->productoDemo($categoria, $nombre, 'SUBLIMACION', $precio);
        SublimacionModelo::query()->firstOrCreate(
            ['producto_id' => $producto->id], ['tipo_material' => $material, 'costo_diseno_personalizado' => '3.00'],
        );
        $this->enlazarImagen($producto, 'sublimacion');

        return $producto;
    }

    private function enlazarImagen(ProductoModelo $producto, string $archivo): void
    {
        $imagen = $this->imagenFixture($archivo, 'productos/demo-'.$archivo.'.png', 'PRODUCTO');
        if (! $producto->multimedia()->wherePivot('es_principal', true)->exists()) {
            $producto->multimedia()->syncWithoutDetaching([$imagen->id => ['orden' => 1, 'es_principal' => true]]);
        }
    }

    private function plantillaDemo(ProductoModelo $producto, string $nombre, string $precio, string $slug): PlantillaDisenoModelo
    {
        $imagen = $this->imagenFixture('sublimacion', 'disenos/demo-'.$slug.'.png', 'PLANTILLA');
        $plantilla = PlantillaDisenoModelo::query()->firstOrCreate(
            ['sublimacion_id' => $producto->id, 'nombre' => $nombre],
            ['costo_adicional' => $precio, 'activo' => true, 'multimedia_id' => $imagen->id],
        );
        $this->repararDiseno($plantilla->multimedia_id, 'sublimacion');

        return $plantilla;
    }

    private function repararDiseno(int $id, string $archivo): void
    {
        $imagen = MultimediaModelo::query()->findOrFail($id);
        if (in_array($imagen->ruta_archivo, ['demo/DISENO_TORTA.png', 'demo/PLANTILLA.png'], true)) {
            $ruta = 'disenos/demo-legado-'.strtolower($imagen->modulo).'.png';
            $nueva = $this->imagenFixture($archivo, $ruta, $imagen->modulo);
            if ($imagen->modulo === 'PLANTILLA') {
                PlantillaDisenoModelo::query()->where('multimedia_id', $id)->update(['multimedia_id' => $nueva->id]);
            } else {
                DisenoTortaModelo::query()->where('multimedia_id', $id)->update(['multimedia_id' => $nueva->id]);
            }
        }
    }

    private function publicaciones(int $admin, ProductoModelo $torta, ProductoModelo $taza): void
    {
        foreach ([
            ['DEMO Repostería para celebrar', 'PUBLICADA', $torta, 'reposteria'],
            ['DEMO Regalos sublimados', 'PUBLICADA', $taza, 'sublimacion'],
            ['DEMO Colección anterior', 'ARCHIVADA', $torta, 'reposteria'],
        ] as [$titulo, $estado, $producto, $archivo]) {
            $publicacion = PublicacionModelo::query()->firstOrCreate(
                ['titulo' => $titulo, 'usuario_id' => $admin],
                ['producto_id' => $producto->id, 'categoria_id' => $producto->categoria_id,
                    'estado' => $estado, 'publicada_en' => now()],
            );
            $imagen = $this->imagenFixture($archivo, 'publicaciones/demo-'.$archivo.'.png', 'PUBLICACION');
            DB::table('publicaciones.publicacion_multimedia')->insertOrIgnore([
                'publicacion_id' => $publicacion->id, 'multimedia_id' => $imagen->id, 'orden' => 1,
            ]);
        }
    }
}
