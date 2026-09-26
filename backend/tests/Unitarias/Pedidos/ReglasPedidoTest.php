<?php

declare(strict_types=1);

namespace Tests\Unitarias\Pedidos;

use App\Dominio\Pedidos\Servicios\EstadosPedido;
use App\Dominio\Pedidos\Servicios\IndicacionesPedido;
use PHPUnit\Framework\TestCase;

class ReglasPedidoTest extends TestCase
{
    public function test_estados_solo_avanzan_un_paso(): void
    {
        $this->assertTrue(EstadosPedido::admite('PENDIENTE', 'EN_PREPARACION'));
        $this->assertTrue(EstadosPedido::admite('EN_PREPARACION', 'LISTO'));
        $this->assertTrue(EstadosPedido::admite('LISTO', 'ENTREGADO'));
        $this->assertFalse(EstadosPedido::admite('PENDIENTE', 'LISTO'));
        $this->assertFalse(EstadosPedido::admite('LISTO', 'PENDIENTE'));
        $this->assertFalse(EstadosPedido::admite('ENTREGADO', 'ENTREGADO'));
    }

    public function test_indicaciones_conservan_ambas_fuentes(): void
    {
        $this->assertSame("Comentario: Empacar\nDiseño personalizado: Texto azul", IndicacionesPedido::combinar('Empacar', 'Texto azul'));
        $this->assertSame('Empacar', IndicacionesPedido::combinar('Empacar', null));
        $this->assertSame('Texto azul', IndicacionesPedido::combinar(null, 'Texto azul'));
        $this->assertNull(IndicacionesPedido::combinar(null, null));
    }
}
