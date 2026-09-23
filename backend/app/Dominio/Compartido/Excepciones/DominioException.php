<?php

declare(strict_types=1);

namespace App\Dominio\Compartido\Excepciones;

use RuntimeException;

/**
 * Excepcion base para errores de dominio / negocio.
 * Los controladores la capturan via bootstrap/app.php y retornan el envelope JSON.
 */
class DominioException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $codigo_error,
        public readonly int $httpStatus,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
