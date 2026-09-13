# NexoCommerce

### Sistema de Comercio Electronico Modular, Parametrizable y Distribuido

NexoCommerce es un sistema de comercio electronico con arquitectura distribuida. El **backend es una API REST pura** (sin vistas web). La aplicacion web y la aplicacion movil son clientes que consumen `/api/v1`.

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
| 1      | NGINX / Load Balancer   | Michael     |
| 2      | Frontend Web            | Nathalia    |
| 3      | Backend Laravel ×2      | Anthony     |
| 4      | PostgreSQL              | Melanie     |
| 5      | App Móvil + File Server | Emilio      |

## Tecnologías

* **Backend (API REST):** Laravel + PHP + Sanctum. Sin Blade, Vite ni sesiones web.
* **Frontend Web (cliente):** React + TypeScript + Vite — Nathalia
* **Móvil (cliente):** Kotlin + Jetpack Compose — Emilio
* **Base de datos:** PostgreSQL — Melanie
* **Servidor de archivos:** Linux — Emilio
* **Infraestructura:** Docker + NGINX
* **Control de versiones:** Git + GitHub
* **Metodo de desarrollo del backend:** SDD (Spec-Driven Development). Contratos en `docs/04-api/`. Guia: `backend/ROADMAP.md`.

## Arquitectura del Backend

El backend es un **monolito modular API-only** (Clean Architecture, DDD, SDD). No renderiza HTML.

Modulos:

```text
Autenticacion
Usuarios
Tienda
Categorias
Productos (TORTA / DETALLE / SUBLIMACION)
Publicaciones
Produccion
Carrito
Pedidos
Pagos
Notificaciones
Multimedia
```

Flujo de trabajo del backend (obligatorio):

1. Leer `docs/09-bitacora/bitacora-backend.md` (ultimo cambio).
2. Leer `backend/ROADMAP.md` (siguiente tarea `[ ]`).
3. Leer spec en `docs/04-api/specs/`.
4. Codificar API JSON.
5. Pruebas.
6. Marcar ROADMAP y apuntar bitacora.
7. Anthony recibe **un** mensaje de commit por entrega y el sube.

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
* Catálogo de productos (tortas, detalles, sublimacion).
* Categorías y subcategorías.
* Personalización segun tipo de producto (diseños de torta, plantillas, diseños del cliente).
* Carrito de compras.
* Gestión de pedidos.
* Gestión de pagos.
* Comprobantes de pago.
* Notificaciones.
* Gestión de imágenes y archivos.
* API REST consumida por web y móvil (el backend no sirve UI).
* Balanceo entre dos instancias del backend.
* Manejo de fallos y errores.
* Pruebas de integración y resiliencia.

## Objetivo

Desarrollar una solución de comercio electrónico **reutilizable, modular y distribuida**, capaz de adaptarse a diferentes tipos de negocios mediante configuración sin modificar la lógica principal del sistema.

---

**Universidad Laica Eloy Alfaro de Manabí (ULEAM)**
**IS-803 — Integración e Implementación de Software**
**Periodo 2026-2**
