<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Crea el esquema de negocio con los schemas/*.sql copiados de database/ (mismo orden que instalar.sql).
     * Copia de la fuente de Melanie: si ella cambia el SQL, hay que volver a copiarlo y validarlo.
     * Si ya existe auth.usuarios (base instalada con instalar.sql), no hace nada.
     */
    public function up(): void
    {
        if (DB::selectOne("select to_regclass('auth.usuarios') as tabla")->tabla !== null) {
            return;
        }

        $sql = collect(file(database_path('instalar.sql')))
            ->filter(fn (string $linea): bool => str_starts_with($linea, '\ir '))
            ->map(fn (string $linea): string => file_get_contents(database_path(trim(substr($linea, 4)))))
            ->implode("\n");

        DB::unprepared($sql);
    }

    /** No se revierte: borrar el esquema destruiria datos de negocio. */
    public function down(): void {}
};
