<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\Contratos;

/**
 * Puerto de notificaciones transaccionales.
 * Las implementaciones concretas viven en Infraestructura.
 */
interface NotificacionServiceInterface
{
    /**
     * Envia el codigo de verificacion de correo electronico al usuario.
     *
     * @param  string  $correo  Direccion de destino
     * @param  string  $nombre  Nombre completo del destinatario
     * @param  string  $codigo  Codigo de 6 digitos
     * @param  string  $expiraEn  Descripcion legible de la expiracion (ej: "24 horas")
     */
    public function enviarCodigoVerificacion(
        string $correo,
        string $nombre,
        string $codigo,
        string $expiraEn = '24 horas',
    ): void;
}
