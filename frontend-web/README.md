# Frontend Web — NexoCommerce

Aplicación web de NexoCommerce para clientes y administradores.

## Responsable

**Nathalia**

## Tecnologías

* React
* TypeScript
* Vite
* Tailwind CSS

## Responsabilidades

### Cliente

* Registro.
* Inicio de sesión.
* Catálogo.
* Categorías.
* Productos.
* Personalización.
* Carrito.
* Checkout.
* Pagos.
* Comprobantes.
* Pedidos.
* Notificaciones.

### Administrador

* Productos.
* Categorías.
* Publicaciones.
* Multimedia.
* Pedidos.
* Pagos.
* Configuración de la tienda.

## Comunicación

Guia de integracion, URL inicial, autenticacion y flujos: [Entrega de la API a Web y Movil](../docs/04-api/guia-integracion-web-movil.md).

El frontend consume exclusivamente la API REST:

```text
Frontend
   ↓
NGINX
   ↓
Backend
   ↓
PostgreSQL
```

No existe conexión directa entre el frontend y PostgreSQL.

## Ejecución

```bash
cd frontend-web
npm install
npm run dev
```

## Variables de entorno

La URL de la API debe configurarse mediante variables de entorno.

Ejemplo:

```text
VITE_API_URL=http://<IP_NGINX>/api/v1
```

## Estado

En desarrollo.
