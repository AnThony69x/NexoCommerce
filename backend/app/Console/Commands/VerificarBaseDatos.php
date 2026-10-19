<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class VerificarBaseDatos extends Command
{
    protected $signature = 'bd:verificar {--connection= : Conexion a revisar (por defecto la configurada)}';

    protected $description = 'Revisa conexion, cuenta y estado del esquema antes de correr migrate';

    public function handle(): int
    {
        $conexion = $this->option('connection') ?: config('database.default');
        $config = config("database.connections.{$conexion}");
        if ($config === null) {
            $this->error("La conexion {$conexion} no esta configurada en config/database.php.");

            return self::FAILURE;
        }

        try {
            $datos = DB::connection($conexion)->selectOne(
                "select current_user as usuario, has_schema_privilege('public', 'CREATE') as puede_crear,
                 to_regclass('auth.usuarios') is not null as instalado"
            );
        } catch (Throwable $e) {
            $this->error("No hay conexion a {$config['host']}:{$config['port']} (base {$config['database']}).");
            $this->line('Revisa DB_HOST, DB_PORT y que el servidor este encendido. Detalle: '.strtok($e->getMessage(), "\n"));

            return self::FAILURE;
        }

        if ($datos->instalado) {
            $this->info("Esquema ya instalado en {$config['database']}. migrate no creara tablas de negocio.");

            return self::SUCCESS;
        }

        if (! $datos->puede_crear) {
            $this->error("La cuenta {$datos->usuario} no puede crear tablas en public.");
            $this->line('Para migrate usa la cuenta administrativa (DB_USERNAME) y deja la de la aplicacion para el resto.');

            return self::FAILURE;
        }

        $this->info("Lista para migrate como {$datos->usuario} en {$config['database']}.");

        return self::SUCCESS;
    }
}
