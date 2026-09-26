<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Notificaciones\Entidades\Notificacion;
use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\NotificacionModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

final class NotificacionRepositorioEloquent implements NotificacionRepositorioInterface
{
    public function guardar(int $usuarioId, ?int $pedidoId, ?int $pagoId, string $tipo, string $titulo, string $mensaje): void
    {
        NotificacionModelo::create([
            'usuario_id' => $usuarioId, 'pedido_id' => $pedidoId, 'pago_id' => $pagoId,
            'tipo' => $tipo, 'titulo' => $titulo, 'mensaje' => $mensaje,
        ]);
    }

    public function administradoresActivos(): array
    {
        return UsuarioModelo::query()->where('activo', true)->whereHas('rol', static fn ($q) => $q->where('nombre', 'ADMIN'))
            ->orderBy('id')->pluck('id')->map(static fn ($id): int => (int) $id)->all();
    }

    public function listar(int $usuarioId, ?bool $leida, int $pagina): array
    {
        $consulta = NotificacionModelo::query()->where('usuario_id', $usuarioId);
        if ($leida !== null) {
            $consulta->where('leida', $leida);
        }
        $paginas = $consulta->orderByDesc('creado_en')->orderByDesc('id')->paginate(20, ['*'], 'page', $pagina);

        return [
            'datos' => array_map($this->mapear(...), $paginas->items()),
            'pagina_actual' => $paginas->currentPage(), 'por_pagina' => $paginas->perPage(),
            'total' => $paginas->total(), 'total_paginas' => $paginas->lastPage(),
            'total_no_leidas' => NotificacionModelo::query()->where('usuario_id', $usuarioId)->where('leida', false)->count(),
        ];
    }

    public function marcarLeida(int $usuarioId, int $id): Notificacion
    {
        return DB::transaction(function () use ($usuarioId, $id): Notificacion {
            $modelo = NotificacionModelo::query()->whereKey($id)->lockForUpdate()->first();
            if ($modelo === null) {
                throw new DominioException('Notificacion no encontrada.', 'NOT_NO_ENCONTRADA', 404);
            }
            if ($modelo->usuario_id !== $usuarioId) {
                throw new DominioException('Notificacion de otro usuario.', 'NOT_AJENA', 403);
            }
            if (! $modelo->leida) {
                $modelo->update(['leida' => true, 'fecha_lectura' => now()]);
            }

            return $this->mapear($modelo);
        }, 3);
    }

    public function marcarTodasLeidas(int $usuarioId): int
    {
        return NotificacionModelo::query()->where('usuario_id', $usuarioId)->where('leida', false)
            ->update(['leida' => true, 'fecha_lectura' => now()]);
    }

    private function mapear(NotificacionModelo $modelo): Notificacion
    {
        return new Notificacion(
            (int) $modelo->id, (int) $modelo->usuario_id, $modelo->pedido_id, $modelo->pago_id,
            $modelo->tipo, $modelo->titulo, $modelo->mensaje, (bool) $modelo->leida,
            $modelo->fecha_lectura !== null ? DateTimeImmutable::createFromInterface($modelo->fecha_lectura) : null,
            DateTimeImmutable::createFromInterface($modelo->creado_en),
        );
    }
}
