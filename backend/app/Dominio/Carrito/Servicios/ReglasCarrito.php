<?php

declare(strict_types=1);

namespace App\Dominio\Carrito\Servicios;

final class ReglasCarrito
{
    public static function centavos(string $importe): int
    {
        if (! preg_match('/^(\d+)(?:\.(\d{1,2}))?$/', $importe, $partes)) {
            throw new \InvalidArgumentException('Importe decimal invalido.');
        }

        return ((int) $partes[1] * 100) + (int) str_pad($partes[2] ?? '', 2, '0');
    }

    public static function decimal(int $centavos): string
    {
        return sprintf('%d.%02d', intdiv($centavos, 100), $centavos % 100);
    }

    public static function precio(string $base, string $adicional): string
    {
        return self::decimal(self::centavos($base) + self::centavos($adicional));
    }

    public static function configuracionValida(string $tipo, ?int $disenoTortaId, ?int $plantillaId, ?int $personalizadoId): bool
    {
        $seleccionados = (int) ($disenoTortaId !== null) + (int) ($plantillaId !== null) + (int) ($personalizadoId !== null);

        return match ($tipo) {
            'TORTA' => $seleccionados <= 1 && $plantillaId === null && $personalizadoId === null,
            'SUBLIMACION' => $seleccionados === 1 && $disenoTortaId === null,
            'DETALLE' => $seleccionados === 0,
            default => false,
        };
    }
}
