# Cambios: Migraciones y configuración de tienda

## Rama

`fix/migraciones-configuracion`

## Objetivo

Corregir los hallazgos relacionados con migraciones y configuración de tienda identificados durante la revisión del backend, evitando problemas de compatibilidad con SQLite, registros OAuth heredados y duplicación de la configuración de la tienda.

---

## 1. Migración OAuth — Solo Google

**Archivo:**

`backend/database/migrations/2026_09_24_010000_oauth_solo_google.php`

### Problema identificado

La migración utilizaba sentencias `ALTER TABLE` directamente. Esto podía provocar errores al ejecutar las migraciones sobre SQLite, utilizado principalmente para pruebas.

Además, al cambiar la restricción para permitir únicamente `GOOGLE`, era necesario controlar previamente si existían registros antiguos con proveedor `FACEBOOK`.

### Cambio realizado

Se agregó una validación del motor de base de datos:

* Si el driver no es PostgreSQL, la migración no ejecuta las sentencias específicas de PostgreSQL.
* En PostgreSQL se verifica la existencia de cuentas con proveedor `FACEBOOK`.
* Si existen registros `FACEBOOK`, la migración se detiene y solicita su revisión antes de aplicar la nueva restricción.
* Si no existen, se elimina la restricción anterior y se crea nuevamente permitiendo únicamente `GOOGLE`.
* El método `down()` permite restaurar la restricción anterior con `GOOGLE` y `FACEBOOK`.

### Motivo

Con esto se evita ejecutar SQL específico de PostgreSQL sobre SQLite y se evita realizar el cambio de proveedor OAuth cuando todavía existen datos incompatibles.

---

## 2. Clave estable para la configuración de tienda

**Archivo nuevo:**

`backend/database/migrations/2026_09_28_000000_add_clave_to_configuracion_tienda.php`

### Problema identificado

La configuración de la tienda se identificaba mediante `nombre_tienda`.

Esto podía provocar problemas si el administrador cambiaba el nombre de la tienda. El seeder podía dejar de encontrar la configuración existente y crear otra fila.

### Cambio realizado

Se agregó la columna:

```text
clave
```

La configuración principal utiliza:

```text
clave = principal
```

La migración realiza el siguiente proceso:

1. Cuenta los registros existentes en `configuracion_tienda`.
2. Si existen más de una configuracion, la migración se detiene para evitar asignar una clave principal de forma arbitraria.
3. Agrega temporalmente `clave` como nullable.
4. Si existe una única configuración, le asigna `principal`.
5. Convierte `clave` a `NOT NULL`.
6. Crea una restricción `UNIQUE` sobre `clave`.

La columna se agrega inicialmente como nullable porque, cuando ya existe un registro, primero es necesario insertar el valor `principal` y posteriormente convertir la columna en obligatoria.

### Motivo

La configuración principal deja de depender de un dato modificable como el nombre de la tienda y pasa a identificarse mediante una clave estable.

---

## 3. Actualización del Seeder

**Archivo:**

`backend/database/seeders/ConfiguracionTiendaSeeder.php`

### Cambio

Anteriormente la configuración se identificaba mediante el nombre:

```text
nombre_tienda = Dulces Aesca
```

Ahora se utiliza:

```text
clave = principal
```

mediante `updateOrInsert`.

### Motivo

El seeder puede ejecutarse nuevamente aunque el nombre de la tienda haya sido modificado, evitando crear una configuración duplicada.

---

## 4. Actualización del modelo

**Archivo:**

`backend/app/Infraestructura/Persistencia/Eloquent/Modelos/ConfiguracionTiendaModelo.php`

Se agregó `clave` a los campos `$fillable` del modelo.

Esto permite que el nuevo campo pueda ser manejado correctamente mediante Eloquent.

---

## 5. Actualización del repositorio

**Archivo:**

`backend/app/Infraestructura/Persistencia/Eloquent/Repositorios/ConfiguracionTiendaRepositorioEloquent.php`

El método `buscarActiva()` ahora identifica la configuración mediante:

```text
clave = principal
activo = true
```

En lugar de depender del nombre de la tienda.

Esto mantiene consistente la lógica del repositorio con el nuevo mecanismo de identificación de la configuración principal.

---

## 6. Pruebas agregadas

**Archivo:**

`backend/tests/Integracion/Tienda/ConfiguracionTiendaTest.php`

Se agregó una prueba para comprobar que el seeder reutiliza la configuración existente aunque su nombre haya cambiado.

El escenario probado es:

1. Se modifica el nombre de la tienda.
2. Se ejecuta nuevamente `ConfiguracionTiendaSeeder`.
3. Se verifica que continúe existiendo una sola configuración.
4. Se verifica que la configuración conserve `clave = principal`.

---

## Validaciones realizadas

Se ejecutaron las siguientes validaciones:

```text
php -l database/migrations/2026_09_28_000000_add_clave_to_configuracion_tienda.php
```

Resultado: sintaxis correcta.

También:

```text
git diff --check
```

Resultado: sin errores de espacios o formato en el diff revisado.

Los tests completos de Laravel no se ejecutaron en el entorno actual debido a que no está disponible `vendor/autoload.php` y el entorno utiliza PHP 8.2, mientras el proyecto requiere PHP 8.3.

## Archivos modificados

* `backend/database/migrations/2026_09_24_010000_oauth_solo_google.php`
* `backend/database/migrations/2026_09_28_000000_add_clave_to_configuracion_tienda.php`
* `backend/database/seeders/ConfiguracionTiendaSeeder.php`
* `backend/app/Infraestructura/Persistencia/Eloquent/Modelos/ConfiguracionTiendaModelo.php`
* `backend/app/Infraestructura/Persistencia/Eloquent/Repositorios/ConfiguracionTiendaRepositorioEloquent.php`
* `backend/tests/Integracion/Tienda/ConfiguracionTiendaTest.php`

`database/database.sql` no fue modificado.
