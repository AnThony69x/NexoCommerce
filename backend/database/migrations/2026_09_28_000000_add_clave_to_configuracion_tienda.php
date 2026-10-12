<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $existingCount = DB::table('configuracion_tienda')->count();

        if ($existingCount > 1) {
            throw new RuntimeException(
                'No se puede agregar la clave principal porque configuracion_tienda '
                .'contiene '.$existingCount.' filas. Consolide los datos antes de migrar.'
            );
        }

        Schema::table('configuracion_tienda', function (Blueprint $table): void {
            $table->string('clave', 50)->nullable()->after('id');
        });

        if ($existingCount === 1) {
            DB::table('configuracion_tienda')->update([
                'clave' => 'principal',
            ]);
        }

        Schema::table('configuracion_tienda', function (Blueprint $table): void {
            $table->string('clave', 50)->nullable(false)->change();
        });

        Schema::table('configuracion_tienda', function (Blueprint $table): void {
            $table->unique('clave', 'uq_configuracion_tienda_clave');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion_tienda', function (Blueprint $table): void {
            $table->dropUnique('uq_configuracion_tienda_clave');
            $table->dropColumn('clave');
        });
    }
};