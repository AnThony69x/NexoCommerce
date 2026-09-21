<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConfiguracionTiendaSeeder extends Seeder
{
    public function run(): void
    {
        $payload = [
            'nombre_tienda' => 'Dulces Aesca',
            'color_primario' => '#8B5CF6',
            'color_secundario' => '#EC4899',
            'color_acento' => '#F59E0B',
            'color_fondo' => '#FFF7ED',
            'color_texto' => '#1F2937',
            'activo' => true,
        ];

        $existente = DB::table('configuracion_tienda')->where('nombre_tienda', 'Dulces Aesca')->first();

        if ($existente) {
            DB::table('configuracion_tienda')->where('id', $existente->id)->update($payload);

            return;
        }

        DB::table('configuracion_tienda')->insert($payload);
    }
}
