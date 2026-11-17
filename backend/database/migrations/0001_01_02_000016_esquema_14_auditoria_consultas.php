<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Ejecuta schemas/14_auditoria_consultas.sql tal cual lo entrego la base de datos. */
    public function up(): void
    {
        DB::unprepared(file_get_contents(database_path('schemas/14_auditoria_consultas.sql')));
    }

    /** No se revierte: borrar el esquema destruiria datos de negocio. */
    public function down(): void {}
};
