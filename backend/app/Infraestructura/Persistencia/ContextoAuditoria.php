<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia;

use Illuminate\Database\Connection;
use Illuminate\Database\Events\TransactionBeginning;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Events\TokenAuthenticated;

/**
 * Declara el contexto de auditoria (usuario, IP, origen) en cada transaccion.
 * set_config(..., true) dura solo la transaccion: se aplica al abrirla y, si el token se
 * valida con una transaccion ya abierta, tambien en esa transaccion.
 */
final class ContextoAuditoria
{
    public static function registrar(): void
    {
        Event::listen(TransactionBeginning::class, fn (TransactionBeginning $evento) => self::aplicar($evento->connection));

        Event::listen(TokenAuthenticated::class, function (TokenAuthenticated $evento): void {
            $conexion = DB::connection();

            if ($conexion->transactionLevel() > 0) {
                self::aplicar($conexion, (int) $evento->token->tokenable_id);
            }
        });
    }

    private static function aplicar(Connection $conexion, ?int $usuarioId = null): void
    {
        $solicitud = request();
        $consola = $solicitud->route() === null;

        $conexion->select(
            "SELECT set_config('app.usuario_id', ?, true), set_config('app.ip_origen', ?, true), set_config('app.origen', ?, true), set_config('app.solicitud_id', ?, true)",
            [
                (string) ($consola ? '' : ($usuarioId ?? auth('sanctum')->id() ?? '')),
                $consola ? '' : (string) $solicitud->ip(),
                $consola ? 'SISTEMA:consola' : 'API',
                $consola ? '' : (string) $solicitud->header('X-Request-Id', ''),
            ],
        );
    }
}
