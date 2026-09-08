# Base de Datos — NexoCommerce

Base de datos principal del sistema.

## Responsable

**Melanie**

## Tecnología

**PostgreSQL**

## Responsabilidades

* Diseño de base de datos.
* Modelo entidad-relación.
* Tablas.
* Relaciones.
* Restricciones.
* Índices.
* Migraciones.
* Seeders.
* Backups.
* Recuperación.

## Entidades principales

```text
tiendas
usuarios
roles
categorias
subcategorias
productos
multimedia
carritos
pedidos
pedido_detalles
pagos
comprobantes_pago
entregas
notificaciones
publicaciones
```

## Acceso

La base de datos solamente debe ser accesible por el Backend.

```text
Web ──┐
      ├──► Backend ──► PostgreSQL
Mobile┘
```

## Backup

Objetivos:

```text
RPO ≤ 24 horas
RTO ≤ 4 horas
```

## Estado

En desarrollo.
