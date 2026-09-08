# App Móvil — NexoCommerce

Aplicación móvil Android para clientes de NexoCommerce.

## Responsable

**Emilio**

## Tecnologías

* Kotlin
* Jetpack Compose
* Material 3

## Funciones

* Registro.
* Inicio de sesión.
* Catálogo.
* Categorías.
* Productos.
* Personalización.
* Carrito.
* Checkout.
* Pagos.
* Carga de comprobantes.
* Consulta de pedidos.
* Estado del pedido.
* Notificaciones.

## Comunicación

La aplicación utiliza la misma API que el frontend web:

```text
App Móvil
    ↓
  NGINX
    ↓
 REST API
    ↓
 Backend
```

## Importante

La aplicación móvil **no se conecta directamente a PostgreSQL**.

## Ejecución

Abrir el proyecto mediante Android Studio y configurar la URL de la API.

```text
API_URL=http://<IP_NGINX>/api/v1
```

## Estado

En desarrollo.
