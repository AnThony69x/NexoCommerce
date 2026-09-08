# Servidor de Archivos — NexoCommerce

Servidor encargado del almacenamiento centralizado de archivos utilizados por NexoCommerce.

## Responsable

**Emilio**

## Archivos administrados

* Imágenes de productos.
* Imágenes de publicaciones.
* Diseños de pasteles.
* Plantillas.
* Diseños personalizados.
* Comprobantes de pago.

## Formatos

```text
JPG
PNG
WEBP
```

## Arquitectura

```text
Backend
   ↓
Servidor de archivos
   ↓
Almacenamiento
```

El Backend administra las operaciones y permisos de los archivos.

## Reglas

* Validar extensión.
* Validar tamaño.
* Evitar archivos no permitidos.
* Mantener una estructura organizada.
* Registrar operaciones importantes.
* No almacenar archivos dentro del código fuente del Backend.

## Ejemplo de estructura

```text
storage/
├── productos/
├── publicaciones/
├── disenos/
├── plantillas/
└── comprobantes/
```

## Estado

En desarrollo.
