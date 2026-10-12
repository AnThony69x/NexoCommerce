<?php

declare(strict_types=1);

namespace App\Providers;

use App\Aplicacion\Autenticacion\Contratos\NotificacionServiceInterface;
use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Aplicacion\Multimedia\Contratos\AlmacenamientoArchivosInterface;
use App\Aplicacion\Notificaciones\Listeners\CrearAvisos;
use App\Dominio\Autenticacion\Repositorios\CuentaOAuthRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;
use App\Dominio\Carrito\Repositorios\CarritoRepositorioInterface;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;
use App\Dominio\Notificaciones\Eventos\EstadoPedidoCambiado;
use App\Dominio\Notificaciones\Eventos\PagoRegistrado;
use App\Dominio\Notificaciones\Eventos\PagoVerificado;
use App\Dominio\Notificaciones\Eventos\PedidoCreado;
use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;
use App\Dominio\Pagos\Repositorios\PagoRepositorioInterface;
use App\Dominio\Pedidos\Repositorios\PedidoRepositorioInterface;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;
use App\Dominio\Tienda\Repositorios\ConfiguracionTiendaRepositorioInterface;
use App\Infraestructura\Almacenamiento\LocalAlmacenamientoArchivos;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\CarritoRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\CategoriaRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\ConfiguracionProduccionRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\ConfiguracionTiendaRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\CuentaOAuthRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\MultimediaRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\NotificacionRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\PagoRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\PedidoRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\ProductoRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\PublicacionRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\UsuarioRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\VerificacionCorreoRepositorioEloquent;
use App\Infraestructura\Servicios\MailNotificacionService;
use App\Infraestructura\Servicios\SanctumTokenService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Fase 1: Autenticacion y Usuarios
        $this->app->bind(UsuarioRepositorioInterface::class, UsuarioRepositorioEloquent::class);
        $this->app->bind(VerificacionCorreoRepositorioInterface::class, VerificacionCorreoRepositorioEloquent::class);
        $this->app->bind(CuentaOAuthRepositorioInterface::class, CuentaOAuthRepositorioEloquent::class);
        $this->app->bind(TokenServiceInterface::class, SanctumTokenService::class);
        $this->app->bind(NotificacionServiceInterface::class, MailNotificacionService::class);

        // Fase 2: Multimedia
        $this->app->bind(MultimediaRepositorioInterface::class, MultimediaRepositorioEloquent::class);
        $this->app->bind(AlmacenamientoArchivosInterface::class, LocalAlmacenamientoArchivos::class);

        // Fase 3: Configuracion de tienda
        $this->app->bind(ConfiguracionTiendaRepositorioInterface::class, ConfiguracionTiendaRepositorioEloquent::class);

        // Fase 4: Categorias
        $this->app->bind(CategoriaRepositorioInterface::class, CategoriaRepositorioEloquent::class);

        // Fase 5: Productos y personalizacion
        $this->app->bind(ProductoRepositorioInterface::class, ProductoRepositorioEloquent::class);

        // Fase 6: Publicaciones
        $this->app->bind(PublicacionRepositorioInterface::class, PublicacionRepositorioEloquent::class);

        // Fase 8: Carrito
        $this->app->bind(CarritoRepositorioInterface::class, CarritoRepositorioEloquent::class);

        // Fase 9: Pedidos
        $this->app->bind(PedidoRepositorioInterface::class, PedidoRepositorioEloquent::class);

        // Fase 10: Pagos
        $this->app->bind(PagoRepositorioInterface::class, PagoRepositorioEloquent::class);

        // Fase 11: Notificaciones
        $this->app->bind(NotificacionRepositorioInterface::class, NotificacionRepositorioEloquent::class);

        // Fase 7: Produccion
        $this->app->bind(ConfiguracionProduccionRepositorioInterface::class, ConfiguracionProduccionRepositorioEloquent::class);
    }

    public function boot(): void
    {
        Event::listen(PedidoCreado::class, [CrearAvisos::class, 'pedidoCreado']);
        Event::listen(PagoRegistrado::class, [CrearAvisos::class, 'pagoRegistrado']);
        Event::listen(PagoVerificado::class, [CrearAvisos::class, 'pagoVerificado']);
        Event::listen(EstadoPedidoCambiado::class, [CrearAvisos::class, 'estadoPedidoCambiado']);
    }
}
