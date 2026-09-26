<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Pagos\Entidades\ComprobantePago;
use App\Dominio\Pagos\Entidades\Pago;
use App\Dominio\Pagos\Repositorios\PagoRepositorioInterface;
use App\Dominio\Pagos\Servicios\ReglasPago;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ComprobantePagoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PagoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PedidoModelo;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

final class PagoRepositorioEloquent implements PagoRepositorioInterface
{
    public function registrar(int $usuarioId, int $pedidoId, string $metodo, string $monto, ?string $referenciaPasarela, ?int $multimediaId): Pago
    {
        return DB::transaction(function () use ($usuarioId, $pedidoId, $metodo, $monto, $referenciaPasarela, $multimediaId): Pago {
            $pedido = PedidoModelo::query()->whereKey($pedidoId)->lockForUpdate()->first();
            if ($pedido === null) {
                throw new DominioException('Pedido no encontrado.', 'PED_NO_ENCONTRADO', 404);
            }
            if ($pedido->usuario_id !== $usuarioId) {
                throw new DominioException('Pedido de otro usuario.', 'PED_AJENO', 403);
            }
            if ($pedido->estado !== 'PENDIENTE') {
                throw $this->error('El pedido ya no esta pendiente.', 'PAG_PEDIDO_NO_PENDIENTE');
            }
            if (! in_array($metodo, ['PASARELA', 'TRANSFERENCIA'], true)
                || ($metodo === 'PASARELA' && ($referenciaPasarela === null || $referenciaPasarela === '' || $multimediaId !== null))
                || ($metodo === 'TRANSFERENCIA' && ($multimediaId === null || $referenciaPasarela !== null))) {
                throw $this->error('Configuracion de pago invalida.', 'PAG_METODO_INVALIDO');
            }
            if (! ReglasPago::montoCoincide($monto, (string) $pedido->total)) {
                throw $this->error('Monto distinto al total del pedido.', 'PAG_MONTO_INVALIDO');
            }
            if (PagoModelo::query()->where('pedido_id', $pedidoId)->whereIn('estado', ['PENDIENTE', 'APROBADO'])->exists()) {
                throw $this->error('El pedido ya tiene un pago activo.', 'PAG_PAGO_ACTIVO');
            }

            if ($metodo === 'PASARELA') {
                DB::select('SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))', ['pagos.referencia', $referenciaPasarela]);
                if (PagoModelo::query()->where('referencia_pasarela', $referenciaPasarela)->exists()) {
                    throw $this->error('Referencia de pasarela ya usada.', 'PAG_REFERENCIA_DUPLICADA');
                }
            } else {
                $archivo = MultimediaModelo::query()->whereKey($multimediaId)->lockForUpdate()->first();
                if ($archivo === null || ! $archivo->activo || ! str_starts_with($archivo->ruta_archivo, 'comprobantes/')) {
                    throw $this->error('Comprobante no disponible.', 'PAG_COMPROBANTE_INVALIDO');
                }
                if ($archivo->subido_por_id !== $usuarioId) {
                    throw new DominioException('Comprobante de otro usuario.', 'PAG_COMPROBANTE_AJENO', 403);
                }
                if (ComprobantePagoModelo::query()->where('multimedia_id', $multimediaId)->exists()) {
                    throw $this->error('Comprobante ya usado.', 'PAG_COMPROBANTE_EN_USO');
                }
            }

            $pago = PagoModelo::create([
                'pedido_id' => $pedidoId, 'metodo' => $metodo, 'estado' => 'PENDIENTE',
                'monto' => $pedido->total, 'referencia_pasarela' => $referenciaPasarela,
            ]);
            if ($metodo === 'TRANSFERENCIA') {
                $pago->comprobante()->create(['multimedia_id' => $multimediaId]);
            }

            return $this->mapear($pago->load('comprobante'), $pedido->estado);
        }, 3);
    }

    public function consultar(int $usuarioId, bool $admin, int $pedidoId): ?Pago
    {
        $pedido = PedidoModelo::query()->find($pedidoId);
        if ($pedido === null) {
            throw new DominioException('Pedido no encontrado.', 'PED_NO_ENCONTRADO', 404);
        }
        if (! $admin && $pedido->usuario_id !== $usuarioId) {
            throw new DominioException('Pedido de otro usuario.', 'PED_AJENO', 403);
        }
        $pago = PagoModelo::query()->with('comprobante')->where('pedido_id', $pedidoId)->orderByDesc('id')->first();

        return $pago !== null ? $this->mapear($pago, $pedido->estado) : null;
    }

    public function verificar(int $adminId, int $pagoId, string $estado, ?string $comentario): Pago
    {
        return DB::transaction(function () use ($adminId, $pagoId, $estado, $comentario): Pago {
            $pedidoId = PagoModelo::query()->whereKey($pagoId)->value('pedido_id');
            if ($pedidoId === null) {
                throw new DominioException('Pago no encontrado.', 'PAG_NO_ENCONTRADO', 404);
            }
            $pedido = PedidoModelo::query()->whereKey($pedidoId)->lockForUpdate()->firstOrFail();
            $pago = PagoModelo::query()->whereKey($pagoId)->lockForUpdate()->firstOrFail();
            if ($pedido->estado !== 'PENDIENTE') {
                throw $this->error('El pedido ya no esta pendiente.', 'PAG_PEDIDO_NO_PENDIENTE');
            }
            if (! ReglasPago::puedeVerificarse($pago->estado, $estado)) {
                throw $this->error('El pago ya fue verificado.', 'PAG_ESTADO_INVALIDO');
            }
            if ($estado === 'APROBADO' && PagoModelo::query()->where('pedido_id', $pedidoId)->whereKeyNot($pagoId)->where('estado', 'APROBADO')->exists()) {
                throw $this->error('El pedido ya tiene un pago aprobado.', 'PAG_PAGO_ACTIVO');
            }
            $pago->update(['estado' => $estado, 'fecha_pago' => $estado === 'APROBADO' ? now() : null]);
            $comprobante = $pago->comprobante;
            if ($comprobante !== null) {
                $comprobante->update([
                    'revisado_por_id' => $adminId, 'fecha_revision' => now(), 'comentario_revision' => $comentario,
                ]);
            }

            return $this->mapear($pago->load('comprobante'), $pedido->estado);
        }, 3);
    }

    private function mapear(PagoModelo $modelo, string $pedidoEstado): Pago
    {
        $modelo->loadMissing('comprobante');
        $comprobante = $modelo->comprobante;

        return new Pago(
            (int) $modelo->id, (int) $modelo->pedido_id, $modelo->metodo, $modelo->estado,
            (string) $modelo->monto, $modelo->referencia_pasarela,
            $modelo->fecha_pago !== null ? DateTimeImmutable::createFromInterface($modelo->fecha_pago) : null,
            $comprobante !== null ? new ComprobantePago(
                (int) $comprobante->id, (int) $comprobante->multimedia_id,
                $comprobante->revisado_por_id !== null ? (int) $comprobante->revisado_por_id : null,
                $comprobante->fecha_revision !== null ? DateTimeImmutable::createFromInterface($comprobante->fecha_revision) : null,
                $comprobante->comentario_revision,
            ) : null,
            $pedidoEstado,
        );
    }

    private function error(string $mensaje, string $codigo): DominioException
    {
        return new DominioException($mensaje, $codigo, 400);
    }
}
