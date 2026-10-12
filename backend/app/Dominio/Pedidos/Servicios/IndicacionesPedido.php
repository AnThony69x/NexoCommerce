<?php

declare(strict_types=1);

namespace App\Dominio\Pedidos\Servicios;

final class IndicacionesPedido
{
    public static function combinar(?string $comentario, ?string $diseno): ?string
    {
        $comentario = trim($comentario ?? '');
        $diseno = trim($diseno ?? '');

        if ($comentario !== '' && $diseno !== '') {
            return "Comentario: {$comentario}\nDiseño personalizado: {$diseno}";
        }

        return $comentario !== '' ? $comentario : ($diseno !== '' ? $diseno : null);
    }
}
