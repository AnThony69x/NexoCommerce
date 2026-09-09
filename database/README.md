# Base de Datos — NexoCommerce

## Descripción

Esta carpeta contiene la estructura, configuración y scripts correspondientes a la base de datos del sistema NexoCommerce.

El motor de base de datos utilizado es **PostgreSQL 18**.

## Responsable

**Melanie**

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

## Tecnologías Directas de la Base de Datos

* **Motor:** PostgreSQL 18
* **Cliente:** `psql` compatible con PostgreSQL 18
* **Lenguaje:** SQL
* **Puerto:** 5432/TCP

## Dependencias de la VM

La máquina virtual destinada al servicio de base de datos requiere:

| Dependencia   | Propósito                                                 |
| ------------- | --------------------------------------------------------- |
| PostgreSQL 18 | Motor de base de datos relacional                         |
| `psql`        | Cliente de línea de comandos compatible con PostgreSQL 18 |

Los recursos de CPU, RAM, almacenamiento y sistema operativo serán definidos por el responsable de infraestructura según las necesidades del despliegue y las características de la máquina virtual.

## Entidades principales

```text
roles
usuarios
cuentas_oauth
verificaciones_correo
multimedia
configuracion_tienda
categorias
productos
tortas
detalles
sublimaciones
rangos_personas
rango_persona_torta
disenos_torta
plantillas_diseno
disenos_personalizados
producto_multimedia
publicaciones
publicacion_multimedia
carritos
detalles_carrito
pedidos
detalles_pedido
configuracion_produccion
pagos
comprobantes_pago
notificaciones
```

## Acceso

La base de datos solamente debe ser accesible por el Backend.

```text
Web ──┐
      ├──► Backend ──► PostgreSQL 18
Mobile┘
```

## Comunicación

La VM de base de datos deberá permitir las conexiones provenientes de los servicios autorizados de NexoCommerce.

* **Protocolo:** TCP
* **Puerto:** 5432
* **Cliente autorizado:** Backend API
* **Motor:** PostgreSQL 18

El acceso al puerto `5432` deberá restringirse a los servicios autorizados por la infraestructura del proyecto.

## Estructura

El esquema actual de la base de datos se encuentra en:

`database.sql`

El archivo contiene:

* Creación de tablas.
* Claves primarias y foráneas.
* Restricciones `CHECK`.
* Índices.
* Relaciones entre entidades.
* Datos iniciales para los roles.
* Configuración inicial de la tienda.

## Inicialización

Una vez instalado PostgreSQL 18, se debe crear la base de datos correspondiente a la instalación de NexoCommerce y ejecutar el archivo `database.sql`.

Ejemplo:

```bash
psql -U <usuario> -d <base_de_datos> -f database.sql
```

Los valores utilizados para el usuario y la base de datos dependerán de la configuración definida para el entorno de despliegue.

## Variables de Conexión

El Backend API deberá utilizar variables de entorno para establecer la conexión con PostgreSQL.

Variables esperadas:

* `DB_HOST`
* `DB_PORT`
* `DB_NAME`
* `DB_USER`
* `DB_PASSWORD`

Las credenciales reales **no deben almacenarse en el repositorio**.

## Persistencia

Los datos de PostgreSQL deberán almacenarse en un volumen persistente para evitar la pérdida de información ante reinicios o recreación de la máquina virtual.

La configuración de respaldos deberá definirse como parte de las políticas de infraestructura del proyecto.

## Conectividad

Los parámetros de conexión tendrán la siguiente estructura:

```text
Host: <IP_O_HOST_DE_LA_VM>
Puerto: 5432
Base de datos: <NOMBRE_DE_LA_BASE>
Usuario: <USUARIO>
Contraseña: <CONFIGURADA_EN_EL_ENTORNO>
```

Las direcciones IP, credenciales y demás parámetros específicos del entorno serán definidos durante la configuración de infraestructura.

## Backup

Objetivos:

```text
RPO ≤ 24 horas
RTO ≤ 4 horas
```

La estrategia y programación de los respaldos deberán coordinarse con la infraestructura del proyecto.

## Consideraciones para la Infraestructura

La VM de base de datos deberá:

* Tener PostgreSQL 18 instalado y ejecutándose.
* Mantener disponible el puerto `5432/TCP` para los servicios autorizados.
* Restringir el acceso a PostgreSQL mediante las reglas de red correspondientes.
* Contar con almacenamiento persistente.
* Mantener las credenciales fuera del repositorio.
* Permitir la ejecución del esquema `database.sql`.
* Contar con recursos suficientes para el funcionamiento del servicio.

La configuración de **NGINX/HAProxy, balanceo de carga y reglas generales de red** corresponde al área de infraestructura y no a esta carpeta.

## Estado

En desarrollo.
