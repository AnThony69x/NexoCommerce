# NGINX — NexoCommerce

Componente encargado del Reverse Proxy y Load Balancing.

## Responsable

**Michi**

## Funciones

* Reverse Proxy.
* Load Balancer.
* Entrada principal de solicitudes.
* Distribución entre Backend 1 y Backend 2.
* Timeouts.
* Manejo de errores.
* Logs.
* Control de disponibilidad.

## Arquitectura

```text
             ┌──► Backend 1
Cliente ─► NGINX
             └──► Backend 2
```

## Backend

```text
Backend 1 → <IP>:8001
Backend 2 → <IP>:8002
```

Las IP y puertos definitivos se configurarán durante el despliegue.

## Prueba de tolerancia

Debe ser posible detener Backend 1 y continuar atendiendo solicitudes mediante Backend 2.

```text
NGINX
 │
 ├── X Backend 1
 │
 └── ✓ Backend 2
```

## Logs

Los logs deben permitir identificar:

* Solicitudes.
* Errores.
* Backend utilizado.
* Problemas de conexión.

## Estado

En desarrollo.
