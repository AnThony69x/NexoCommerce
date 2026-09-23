<?php

declare(strict_types=1);

namespace App\Providers;

use App\Aplicacion\Autenticacion\Contratos\TokenServiceInterface;
use App\Dominio\Autenticacion\Repositorios\CuentaOAuthRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\UsuarioRepositorioInterface;
use App\Dominio\Autenticacion\Repositorios\VerificacionCorreoRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\CuentaOAuthRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\UsuarioRepositorioEloquent;
use App\Infraestructura\Persistencia\Eloquent\Repositorios\VerificacionCorreoRepositorioEloquent;
use App\Infraestructura\Servicios\SanctumTokenService;
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
    }

    public function boot(): void
    {
        //
    }
}
