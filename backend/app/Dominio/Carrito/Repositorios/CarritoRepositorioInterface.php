<?php

declare(strict_types=1);

namespace App\Dominio\Carrito\Repositorios;

use App\Dominio\Carrito\Entidades\Carrito;

interface CarritoRepositorioInterface
{
    public function obtener(int $usuarioId): Carrito;

    public function agregar(int $usuarioId, int $productoId, int $cantidad, ?string $comentario, ?int $disenoTortaId, ?int $plantillaId, ?int $personalizadoId): Carrito;

    public function actualizarCantidad(int $usuarioId, int $itemId, int $cantidad): Carrito;

    public function eliminarItem(int $usuarioId, int $itemId): Carrito;

    public function vaciar(int $usuarioId): Carrito;
}
