# NexoCommerce

### Sistema de Comercio Electrónico Modular, Parametrizable y Distribuido

NexoCommerce es un sistema de comercio electrónico diseñado con una arquitectura distribuida y modular. Permite gestionar productos, categorías, personalizaciones, carritos, pedidos, pagos y contenido multimedia.

El sistema cuenta con una aplicación web y una aplicación móvil que consumen una misma API REST.

## Arquitectura

El sistema está distribuido en **5 laptops conectadas mediante una red LAN**:

```text
                 NexoCommerce
                      │
                    NGINX
                Reverse Proxy
                Load Balancer
                      │
             ┌────────┴────────┐
             │                 │
         Backend 1         Backend 2
          Docker             Docker
             │                 │
             └────────┬────────┘
                      │
             ┌────────┴────────┐
             │                 │
         PostgreSQL       File Server
```

Clientes:

```text
Frontend Web ──┐
               ├──→ NGINX → Backend → PostgreSQL
App Móvil ─────┘                 │
                                 └──→ File Server
```

## Distribución de nodos

| Laptop | Componente              | Responsable |
| ------ | ----------------------- | ----------- |
| 1      | NGINX / Load Balancer   | Michi       |
| 2      | Frontend Web            | Nathalia    |
| 3      | Backend Laravel ×2      | Anthony     |
| 4      | PostgreSQL              | Melanie     |
| 5      | App Móvil + File Server | Emilio      |

## Tecnologías

* **Backend:** Laravel + PHP + REST API + Sanctum
* **Frontend:** React + TypeScript + Vite
* **Móvil:** Kotlin + Jetpack Compose
* **Base de datos:** PostgreSQL
* **Servidor de archivos:** Linux
* **Infraestructura:** Docker + NGINX
* **Control de versiones:** Git + GitHub

## Arquitectura del Backend

El backend utiliza un **monolito modular** con principios de:

* Clean Architecture
* DDD
* Separación de responsabilidades
* Inversión de dependencias

Módulos principales:

```text
Autenticación
Usuarios
Tiendas
Categorías
Productos
Personalización
Carrito
Pedidos
Pagos
Notificaciones
Publicaciones
Multimedia
```

## Estructura del proyecto

```text
NexoCommerce/
│
├── backend/
├── frontend-web/
├── app-movil/
├── servidor-archivos/
├── nginx/
├── database/
├── docs/
├── tests/
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Características principales

* Autenticación y roles.
* Catálogo de productos.
* Categorías y subcategorías.
* Personalización de productos.
* Carrito de compras.
* Gestión de pedidos.
* Gestión de pagos.
* Comprobantes de pago.
* Notificaciones.
* Gestión de imágenes y archivos.
* Aplicación web.
* Aplicación móvil.
* Balanceo entre dos instancias del backend.
* Manejo de fallos y errores.
* Pruebas de integración y resiliencia.

## Objetivo

Desarrollar una solución de comercio electrónico **reutilizable, modular y distribuida**, capaz de adaptarse a diferentes tipos de negocios mediante configuración sin modificar la lógica principal del sistema.

---

**Universidad Laica Eloy Alfaro de Manabí (ULEAM)**
**IS-803 — Integración e Implementación de Software**
**Periodo 2026-2**
