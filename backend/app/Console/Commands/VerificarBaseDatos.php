<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Migrations\Migrator;
use Illuminate\Support\Facades\DB;
use Throwable;

class VerificarBaseDatos extends Command
{
    /** Version mayor del servidor validada con el esquema (database/README.md). */
    private const VERSION_ESPERADA = 17;

    /**
     * Tablas que usan los modelos de la API. shortcut: lista fija, actualizar al agregar un modelo;
     * el esquema completo tiene 47 tablas de negocio.
     */
    private const TABLAS_API = [
        'auth.cuentas_oauth', 'auth.personal_access_tokens', 'auth.roles', 'auth.usuarios', 'auth.verificaciones_correo',
        'catalogo.categorias', 'catalogo.detalles', 'catalogo.disenos_torta', 'catalogo.plantillas_diseno',
        'catalogo.productos', 'catalogo.sublimaciones', 'catalogo.tortas', 'media.multimedia',
        'notificaciones.notificaciones', 'pagos.comprobantes_pago', 'pagos.pagos',
        'produccion.configuracion_produccion', 'publicaciones.publicaciones', 'tienda.configuracion_tienda',
        'ventas.carritos', 'ventas.detalles_carrito', 'ventas.detalles_pedido', 'ventas.disenos_personalizados',
        'ventas.pedidos',
    ];

    protected $signature = 'bd:verificar {--connection= : Conexion a revisar (por defecto la configurada)}';

    protected $description = 'Revisa version, conexion, cuenta, tablas y migraciones antes de correr migrate';

    public function handle(Migrator $migrator): int
    {
        $conexion = $this->option('connection') ?: config('database.default');
        $config = config("database.connections.{$conexion}");
        if ($config === null) {
            $this->error("La conexion {$conexion} no esta configurada en config/database.php.");

            return self::FAILURE;
        }

        try {
            $datos = DB::connection($conexion)->selectOne(
                "select current_user as usuario, current_setting('server_version_num')::int as version,
                 has_schema_privilege('public', 'CREATE') as puede_crear,
                 to_regclass('auth.usuarios') is not null as instalado"
            );
        } catch (Throwable $e) {
            $this->error("No hay conexion a {$config['host']}:{$config['port']} (base {$config['database']}).");
            $this->line('Revisa DB_HOST, DB_PORT y que el servidor este encendido. Detalle: '.strtok($e->getMessage(), "\n"));

            return self::FAILURE;
        }

        $version = intdiv((int) $datos->version, 10000);
        if ($version !== self::VERSION_ESPERADA) {
            $this->error("PostgreSQL {$version} no es el validado (".self::VERSION_ESPERADA.'.x). Confirma la version con la base antes de migrar.');

            return self::FAILURE;
        }
        $this->line("PostgreSQL {$version} · base {$config['database']} · cuenta {$datos->usuario}");

        $migrator->setConnection($conexion);
        $pendientes = $this->migracionesPendientes($migrator);

        if (! $datos->instalado) {
            if (! $datos->puede_crear) {
                $this->error("La cuenta {$datos->usuario} no puede crear tablas en public.");
                $this->line('Para migrate usa la cuenta administrativa (DB_USERNAME) y deja la de la aplicacion para el resto.');

                return self::FAILURE;
            }

            $this->info('Base vacia. Lista para migrate: '.$this->texto($pendientes, 'migraciones pendientes'));

            return self::SUCCESS;
        }

        $faltan = array_values(array_filter(
            self::TABLAS_API,
            fn (string $tabla): bool => ! DB::connection($conexion)->selectOne("select to_regclass('{$tabla}') is not null as existe")->existe
        ));
        if ($faltan !== []) {
            $this->error('Faltan '.count($faltan).' tablas usadas por la API: '.implode(', ', $faltan));

            return self::FAILURE;
        }

        $this->info('Esquema instalado: '.count(self::TABLAS_API).' tablas de la API presentes.');
        if ($pendientes === null) {
            $this->warn('No se pudo leer el historial de migraciones con la cuenta '.$datos->usuario.'.');
        } elseif ($pendientes !== []) {
            $this->warn('Migraciones pendientes (no se aplicaran sobre esta base): '.implode(', ', $pendientes));
        }

        return self::SUCCESS;
    }

    /** @return list<string>|null null cuando la cuenta no puede leer el historial de migraciones */
    private function migracionesPendientes(Migrator $migrator): ?array
    {
        try {
            $ejecutadas = $migrator->repositoryExists() ? $migrator->getRepository()->getRan() : [];
        } catch (Throwable) {
            return null;
        }

        return array_values(array_diff(array_keys($migrator->getMigrationFiles(database_path('migrations'))), $ejecutadas));
    }

    /** @param list<string>|null $lista */
    private function texto(?array $lista, string $etiqueta): string
    {
        return $lista === null ? "no se pudo leer el historial ({$etiqueta})" : count($lista).' '.$etiqueta;
    }
}
