<?php

declare(strict_types=1);

namespace App\Infraestructura\Servicios;

use App\Aplicacion\Autenticacion\Contratos\NotificacionServiceInterface;
use App\Mail\CodigoVerificacionMail;
use Illuminate\Support\Facades\Mail;

/**
 * Implementacion del puerto NotificacionServiceInterface usando el
 * sistema de correo de Laravel (MAIL_MAILER configurable via .env).
 *
 * En desarrollo: MAIL_MAILER=smtp apuntando a Mailtrap.
 * En produccion: MAIL_MAILER=smtp apuntando a Resend / Mailgun / SES.
 */
final class MailNotificacionService implements NotificacionServiceInterface
{
    public function enviarCodigoVerificacion(
        string $correo,
        string $nombre,
        string $codigo,
        string $expiraEn = '24 horas',
    ): void {
        Mail::to($correo)->send(
            new CodigoVerificacionMail($nombre, $codigo, $expiraEn),
        );
    }
}
