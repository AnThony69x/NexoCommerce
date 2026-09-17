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

* Imágenes: JPG, JPEG, PNG y WEBP.
* Comprobantes: también PDF.
* Tamaño máximo según el contrato: 5 MB (5120 KB).

## Arquitectura

```text
Web / App móvil → NGINX (Laptop 1) → Laravel ×2 (Laptop 3)
                                         ├── SFTP → VM Linux (Laptop 5)
                                         └── SQL  → PostgreSQL (Laptop 4)
```

El Backend administra las operaciones y permisos de los archivos.

La propuesta es utilizar **OpenSSH/SFTP para transferir archivos** y **NGINX para servir recursos públicos** desde la VM Linux. PostgreSQL guarda los metadatos; los archivos físicos permanecen en la Laptop 5.

Para consultar imágenes públicas, el NGINX de Laptop 1 puede reenviar `/storage/` al NGINX de la VM, manteniendo una entrada común para los clientes. Los archivos privados deben descargarse mediante el backend después de verificar permisos. Esta separación requiere ajustar el contrato actual.

## Reglas

* Validar extensión.
* Validar tamaño.
* Evitar archivos no permitidos.
* Mantener una estructura organizada.
* Registrar operaciones importantes.
* No almacenar archivos dentro del código fuente del Backend.

## Ejemplo de estructura

```text
/srv/nexocommerce/
├── public/
│   ├── productos/
│   ├── publicaciones/
│   ├── tienda/
│   └── plantillas/
└── private/
    ├── comprobantes/
    └── personalizaciones/
```

El backend debe traducir los destinos permitidos a carpetas conocidas. Esta estructura propuesta no habilita automáticamente nuevos destinos en la API.

## Requisitos de la máquina virtual Linux

Los siguientes recursos son una propuesta para la demostración académica, no mínimos impuestos por las bases.

| Recurso | Configuración propuesta |
| --- | --- |
| Virtualización | VirtualBox, VMware o Hyper-V, según disponibilidad. |
| Sistema operativo | Ubuntu Server LTS, sin escritorio gráfico. |
| CPU | 2 núcleos virtuales. |
| RAM | 2 GB; 4 GB si la laptop tiene capacidad disponible. |
| Disco | 30–40 GB iniciales, ampliables según el volumen de archivos. |
| Red | Adaptador en modo puente sobre Ethernet, conectado al switch del equipo. |
| Dirección IP | Fija o reserva DHCP, en la misma subred que las demás laptops. |
| Servicios | OpenSSH/SFTP y NGINX. |
| Persistencia | Directorio permanente y respaldos fuera de la VM. |

No se necesita instalar PostgreSQL ni Laravel en esta VM. Las bases obligan a contenerizar el backend; el servidor de archivos puede ejecutar sus servicios directamente en Linux.

Las IP definitivas deben acordarse con el equipo. Las direcciones de ejemplo de las especificaciones no representan IP ya asignadas.

## Instalación inicial en Ubuntu

Ejecutar dentro de la VM:

```bash
sudo apt update
sudo apt install openssh-server nginx
sudo systemctl enable --now ssh nginx
```

Comprobar los servicios y la configuración inicial:

```bash
sudo systemctl status ssh nginx
sudo sshd -t
sudo nginx -t
ip -br address
```

Estos comandos solo instalan y comprueban los servicios base. Para completar el despliegue faltan el usuario SFTP, las claves, los directorios, los permisos, la configuración de NGINX y el firewall.

## Red, usuarios y permisos

| Puerto en la VM | Uso | Origen autorizado propuesto |
| --- | --- | --- |
| 22/TCP | Transferencia SFTP | Backend de Laptop 3. |
| 22/TCP | Administración SSH | Equipo o dirección de administración acordada. |
| 80/TCP | Lectura HTTP de recursos públicos en la LAN | NGINX de Laptop 1. |

* Configurar el firewall con las IP reales, permitiendo el acceso administrativo antes de aplicar restricciones.
* Crear un usuario exclusivo para el backend, con clave SSH, acceso limitado a SFTP y permisos sobre los directorios necesarios.
* Utilizar una cuenta separada para administrar Linux.
* Mantener las claves privadas y credenciales fuera del repositorio y verificar la identidad del servidor SSH desde el backend.
* Dar a NGINX acceso de lectura únicamente a los recursos públicos, desactivar el listado de carpetas y no publicar el directorio privado.
* Mantener los archivos fuera del código fuente del backend y comprobar su persistencia tras reinicios.
* Programar respaldos en otro disco o equipo y probar su restauración. Una copia dentro de la misma VM no protege ante la pérdida de esa VM.

## Integración con el backend — coordinación con Anthony

Laravel soporta SFTP mediante un adaptador de Flysystem. No es necesario crear otra API en la VM para recibir las subidas.

Tareas pendientes:

1. Instalar el adaptador SFTP compatible y configurar el disco remoto en `backend/config/filesystems.php`.
2. Configurar IP, puerto, usuario, clave, directorio remoto y tiempos de espera mediante variables de entorno y secretos externos al repositorio.
3. Implementar `POST /api/v1/multimedia/subir`, protegido con Sanctum, validando contenido, formato, tamaño, destino y permisos.
4. Generar nombres únicos y limitar las carpetas a destinos conocidos, sin aceptar rutas arbitrarias del cliente.
5. Guardar el archivo por SFTP y registrar sus metadatos en PostgreSQL después de confirmar la transferencia. Si falla el registro, gestionar la limpieza del archivo y registrar cualquier fallo de limpieza.
6. Construir las URLs públicas mediante la entrada de Laptop 1 y gestionar descargas privadas con autorización del backend.
7. Configurar ambas instancias del backend para utilizar el mismo almacenamiento remoto.
8. Manejar la caída del servidor con tiempos de espera limitados, errores controlados y logs de diagnóstico.
9. Ajustar los límites de PHP y del proxy para aceptar el archivo de 5 MB más el contenido adicional de la petición multipart.

### Ajustes pendientes del contrato multimedia

* El contrato actual describe lectura pública incluso para comprobantes. Se propone mantener comprobantes y personalizaciones de clientes privados, con descarga autorizada a través del backend.
* La regla de negocio limita PDF a comprobantes, pero la validación de ejemplo permite PDF sin distinguir carpeta. La implementación debe reflejar la restricción por destino.
* `tienda` aparece en la validación de carpetas, pero no en la tabla de campos. Unificar los destinos permitidos.

Estos ajustes deben coordinarse antes de implementar el módulo.

## Pruebas y evidencias de entrega

* Subir una imagen desde el sistema y comprobar el archivo físico en la VM y sus metadatos en PostgreSQL.
* Consultar la imagen pública desde web y móvil mediante la entrada del sistema.
* Confirmar que ambas instancias del backend acceden a los mismos archivos.
* Rechazar formatos no permitidos, archivos mayores al límite y destinos inválidos.
* Verificar que los archivos privados no tienen acceso público y que el backend rechaza descargas sin autorización.
* Reiniciar la VM y comprobar el inicio de los servicios y la persistencia de los archivos.
* Desconectar temporalmente el servidor y demostrar errores controlados; comprobar qué funciones independientes del almacenamiento siguen disponibles.
* Revisar logs de SSH, NGINX y backend para identificar fallos.
* Restaurar un archivo desde un respaldo.

Documentar IPs, puertos, versiones, configuración de servicios, respaldos y resultados de las pruebas en el manual de implementación.

## Referencias

* [Bases del proyecto integrador](../docs/00-proyecto/enunciado-proyecto-integrador.md).
* [Arquitectura general](../README.md).
* [Contrato de multimedia](../docs/04-api/specs/08-multimedia.spec.md).
* [Esquema SQL](../database/database.sql): tabla `multimedia` con nombre, ruta, MIME, tamaño y usuario.
* [OpenSSH en Ubuntu](https://ubuntu.com/server/docs/openssh-server/).
* [NGINX en Ubuntu](https://ubuntu.com/server/docs/how-to/web-services/install-nginx/).
* [Almacenamiento y SFTP en Laravel](https://laravel.com/framework/docs/filesystem).

## Estado

En desarrollo. La configuración descrita es una propuesta pendiente de implementar y probar; no representa un servidor desplegado.

Al revisar el repositorio, el backend utiliza Laravel 13 y Sanctum, pero el endpoint multimedia aún no está implementado y no existe un disco SFTP configurado. Esta carpeta contiene documentación, sin configuraciones ejecutables del servidor, y el `docker-compose.yml` raíz está vacío.
