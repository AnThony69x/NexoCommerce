<?php

declare(strict_types=1);

namespace Tests\Unitarias\Carrito;

use App\Dominio\Carrito\Entidades\DetalleCarrito;
use App\Dominio\Carrito\Servicios\ReglasCarrito;
use PHPUnit\Framework\TestCase;

class ReglasCarritoTest extends TestCase
{
    public function test_precio_y_subtotal_usan_centavos_exactos(): void
    {
        $this->assertSame('12.35', ReglasCarrito::precio('10.05', '2.30'));
        $this->assertSame('0.30', ReglasCarrito::precio('0.10', '0.20'));
        $item = new DetalleCarrito(1, 1, 'Producto', 'TORTA', null, 3, '0.30', null, null, null, null, null, false, []);
        $this->assertSame('0.90', $item->subtotal());
    }

    public function test_combinaciones_por_tipo(): void
    {
        $this->assertTrue(ReglasCarrito::configuracionValida('TORTA', null, null, null));
        $this->assertTrue(ReglasCarrito::configuracionValida('TORTA', 1, null, null));
        $this->assertFalse(ReglasCarrito::configuracionValida('TORTA', null, 1, null));
        $this->assertFalse(ReglasCarrito::configuracionValida('SUBLIMACION', null, null, null));
        $this->assertTrue(ReglasCarrito::configuracionValida('SUBLIMACION', null, 1, null));
        $this->assertTrue(ReglasCarrito::configuracionValida('SUBLIMACION', null, null, 1));
        $this->assertFalse(ReglasCarrito::configuracionValida('SUBLIMACION', null, 1, 1));
        $this->assertTrue(ReglasCarrito::configuracionValida('DETALLE', null, null, null));
        $this->assertFalse(ReglasCarrito::configuracionValida('DETALLE', 1, null, null));
    }
}
