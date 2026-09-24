<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * RN-AUTH-09 v1.1.2: OAuth solo GOOGLE (se elimina FACEBOOK del CHECK).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE cuentas_oauth DROP CONSTRAINT IF EXISTS chk_oauth_proveedor');
        DB::statement("ALTER TABLE cuentas_oauth ADD CONSTRAINT chk_oauth_proveedor CHECK (proveedor IN ('GOOGLE'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE cuentas_oauth DROP CONSTRAINT IF EXISTS chk_oauth_proveedor');
        DB::statement("ALTER TABLE cuentas_oauth ADD CONSTRAINT chk_oauth_proveedor CHECK (proveedor IN ('GOOGLE', 'FACEBOOK'))");
    }
};
