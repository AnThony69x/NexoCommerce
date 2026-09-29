<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * RN-AUTH-09 v1.1.2: OAuth solo GOOGLE (se elimina FACEBOOK del CHECK).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        $facebookCount = DB::table('cuentas_oauth')
            ->where('proveedor', 'FACEBOOK')
            ->count();

        if ($facebookCount > 0) {
            throw new RuntimeException(
                'No se puede restringir OAuth a GOOGLE porque existen '
                .$facebookCount.' cuentas FACEBOOK.'
            );
        }

        DB::statement('ALTER TABLE cuentas_oauth DROP CONSTRAINT IF EXISTS chk_oauth_proveedor');
        DB::statement("ALTER TABLE cuentas_oauth ADD CONSTRAINT chk_oauth_proveedor CHECK (proveedor IN ('GOOGLE'))");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE cuentas_oauth DROP CONSTRAINT IF EXISTS chk_oauth_proveedor');
        DB::statement("ALTER TABLE cuentas_oauth ADD CONSTRAINT chk_oauth_proveedor CHECK (proveedor IN ('GOOGLE', 'FACEBOOK'))");
    }
};
