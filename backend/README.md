# Backend — NexoCommerce

API REST principal de NexoCommerce.

## Responsable

**Anthony**

## Tecnologías

* Laravel
* PHP
* PostgreSQL
* Laravel Sanctum
* Docker

## Responsabilidades

* Autenticación y autorización.
* Gestión de usuarios y roles.
* Gestión de tienda.
* Categorías y subcategorías.
* Productos.
* Personalización.
* Carrito.
* Pedidos.
* Pagos.
* Notificaciones.
* Multimedia.
* Integración con PostgreSQL.
* Integración con servidor de archivos.
* Manejo de errores y logs.

## Arquitectura

```text
HTTP
 ↓
Controladores
 ↓
Aplicación
 ↓
Dominio
 ↓
Repositorios
 ↓
Infraestructura
 ↓
PostgreSQL / Servicios externos
```

## API

La API utiliza:

```text
/api/v1
```

Ejemplo:

```text
POST /api/v1/auth/login
GET  /api/v1/productos
GET  /api/v1/carrito
POST /api/v1/pedidos
POST /api/v1/pagos
```

## Ejecución

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## Docker

El Backend debe ejecutarse mediante dos instancias:

```text
backend-1
backend-2
```

Ambas utilizan el mismo código y se encuentran detrás de NGINX.

## Regla

El Backend es el único componente que accede directamente a PostgreSQL.

## Estado

En desarrollo.
