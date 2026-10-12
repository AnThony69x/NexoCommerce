<?php

declare(strict_types=1);

namespace Tests\Unitarias\Pagos;

use App\Dominio\Pagos\Servicios\ReglasPago;
use PHPUnit\Framework\TestCase;

class ReglasPagoTest extends TestCase
{
    public function test_monto_se_compara_en_centavos(): void
    {
        $this->assertTrue(ReglasPago::montoCoincide('0.30', '0.30'));
        $this->assertTrue(ReglasPago::montoCoincide('35.00', '35.00'));
        $this->assertFalse(ReglasPago::montoCoincide('35.01', '35.00'));
    }

    public function test_solo_pendiente_puede_verificarse_una_vez(): void
    {
        $this->assertTrue(ReglasPago::puedeVerificarse('PENDIENTE', 'APROBADO'));
        $this->assertTrue(ReglasPago::puedeVerificarse('PENDIENTE', 'RECHAZADO'));
        $this->assertFalse(ReglasPago::puedeVerificarse('APROBADO', 'RECHAZADO'));
        $this->assertFalse(ReglasPago::puedeVerificarse('RECHAZADO', 'APROBADO'));
        $this->assertFalse(ReglasPago::puedeVerificarse('PENDIENTE', 'PENDIENTE'));
    }
}
