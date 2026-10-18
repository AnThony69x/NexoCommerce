<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('auth.roles')->insertOrIgnore([
            ['nombre' => 'ADMIN'],
            ['nombre' => 'CLIENTE'],
        ]);
    }
}
