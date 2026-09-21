<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->updateOrInsert(
            ['id' => 1],
            ['nombre' => 'ADMIN']
        );
        DB::table('roles')->updateOrInsert(
            ['id' => 2],
            ['nombre' => 'CLIENTE']
        );

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles))");
        }
    }
}
