# Tests — NexoCommerce

Pruebas utilizadas para verificar el funcionamiento e integración del sistema.

## Tipos de pruebas

### Unitarias

Validan componentes individuales.

```text
Servicio
Entidad
Regla de negocio
```

### Funcionales

Validan funcionalidades completas de la API.

```text
Login
Productos
Carrito
Pedidos
Pagos
```

### Integración

Verifican la comunicación entre componentes:

```text
Frontend
   ↓
NGINX
   ↓
Backend
   ↓
PostgreSQL
```

### E2E

Validan el flujo completo:

```text
Registro
 ↓
Login
 ↓
Catálogo
 ↓
Carrito
 ↓
Pedido
 ↓
Pago
 ↓
Confirmación
```

### Resiliencia

Validar:

* Caída de Backend 1.
* Caída de Backend 2.
* Problemas de PostgreSQL.
* Desconexión del servidor de archivos.
* Timeouts.

## Objetivos

* Detectar errores.
* Validar requisitos.
* Comprobar integración.
* Verificar tolerancia a fallos.

## Estado

En desarrollo.
