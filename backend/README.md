# Backend - NexoCommerce API REST

API REST pura de NexoCommerce consumen `/api/v1`.

Estructura objetivo: **Clean Architecture / DDD**. Metodo: **SDD**. Fuente de datos: `../database/database.sql`. Contratos: `../docs/04-api/`.

---

## Responsable
**Anthony** (Laptop 3 - Backend Laravel x2)

---

## Stack Tecnologico (2026-09-17)

| Componente | Version instalada | Notas |
| :--- | :--- | :--- |
| PHP | 8.5.10 | `composer.json` exige `^8.3` (8.5 cumple) |
| Composer | 2.10.3 | Unico gestor de dependencias de la API |
| Laravel | **13.30.1** | Framework de la API |
| Sanctum | 4.3.3 | Tokens Bearer |
| PHPUnit | 12.5.34 | Suites: `tests/Unit`, `tests/Feature`, `tests/Integracion` |
| Pint | 1.31.0 | Formato PSR-12 |
| Boost | 2.8.1 | Dev / MCP |

**Extensiones PHP cargadas:** `pdo_pgsql`, `pgsql`, `intl`, `mbstring`, `xml`, `curl`, `zip`, `bcmath`, `openssl`, `fileinfo`, `iconv`.

---

## Metodologia: SDD (Spec-Driven Development)

Ningun endpoint se codifica sin especificacion aprobada.

- **Guia y Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Contratos:** [../docs/04-api/](../docs/04-api/)
- **Specs:** [../docs/04-api/specs/](../docs/04-api/specs/)
- **OpenAPI:** [../docs/04-api/openapi/openapi.yaml](../docs/04-api/openapi/openapi.yaml)
- **Entrega a Web y Movil:** [../docs/04-api/guia-integracion-web-movil.md](../docs/04-api/guia-integracion-web-movil.md)
- **Bitacora:** [../docs/09-bitacora/bitacora-backend.md](../docs/09-bitacora/bitacora-backend.md)
- **SQL:** [../database/database.sql](../database/database.sql)

---

## Roadmap y Fases de Desarrollo

El progreso detallado, dependencias tecnicas y estado de cada modulo se gestionan en [ROADMAP.md](ROADMAP.md):

- **Fase 0: Configuracion Base e Infraestructura** (En progreso: Laravel 13.30.1, PHP 8.5.10, Sanctum 4.3.3, migraciones desde `database.sql`)
- **Fase 1: Autenticacion y Usuarios** (`usuarios`, roles `ADMIN`/`CLIENTE`, OAuth, verificacion de correo)
- **Fase 2: Multimedia** (tabla `multimedia`, subida con `id` para FKs)
- **Fase 3: Tienda** (`configuracion_tienda`, Dulces Aesca)
- **Fase 4: Categorias** (`categoria_padre_id`, sin slug)
- **Fase 5: Productos y personalizacion** (TORTA / DETALLE / SUBLIMACION)
- **Fase 6: Publicaciones**
- **Fase 7: Produccion** (`configuracion_produccion`)
- **Fase 8: Carrito** (`detalles_carrito`, una sola FK de diseño)
- **Fase 9: Pedidos** (`fecha_entrega`, estados SQL)
- **Fase 10: Pagos y comprobantes** (`PASARELA` / `TRANSFERENCIA`)
- **Fase 11: Notificaciones**
- **Fase 12: Pruebas de carga y despliegue** (Docker dual + NGINX)

---

## Flujo de Trabajo Obligatorio

Orden fijo. Un commit por entrega, ejecutado por Anthony.

1. **Bitacora:** leer el ultimo cambio en `../docs/09-bitacora/bitacora-backend.md`.
2. **Roadmap:** tomar la siguiente tarea `[ ]` en [ROADMAP.md](ROADMAP.md).
3. **Spec:** leer `../docs/04-api/specs/<modulo>.spec.md` y planear antes de codificar.
4. **Codigo:** API JSON, capas Dominio / Aplicacion / Infraestructura / Http. PHP estricto (`declare(strict_types=1);`). Sin UI.
5. **Pruebas unitarias:** `tests/Unit/` (objetivo tambien `tests/Unitarias/`).
6. **Pruebas de integracion:** `tests/Integracion/` y `tests/Feature/` (HTTP, PostgreSQL, envelope JSON).
7. **Roadmap:** marcar `[x]` con fecha y hora.
8. **Bitacora:** registrar la fila (fecha, fase, tarea, mensaje de commit, Anthony).
9. **Commit:** el agente entrega **un** mensaje Conventional Commits. Anthony lo lee, ejecuta y sube. El agente no hace `git commit` ni `git push`.

Formatos de mensaje:
- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `test: ...`
- `docs: ...`
- `chore: ...`

---

## Arquitectura por Capas (`app/`)

Capas SDD listas para Fases 1+. Laravel 13 conserva `app/Models/` y `app/Http/Controllers/Controller.php` hasta migrar cada modulo. Hoy solo existen carpetas y `.gitkeep`. Los `.php` del arbol son la convencion de nombres; se crean al implementar cada spec.

**Idioma de carpetas**

| Capa | Carpetas | Archivos |
| :--- | :--- | :--- |
| `Dominio/` | Espanol (modulo + `Entidades/`, `Repositorios/`, `Servicios/`) | Espanol (`Usuario.php`, `UsuarioRepositorio.php`) |
| `Aplicacion/` | Espanol (modulo + `CasosUso/`, `DTOs/`) | Espanol (`IniciarSesion.php`, `IniciarSesionDatos.php`) |
| `Infraestructura/` | Espanol (`Persistencia/`, `Modelos/`, `Repositorios/`, ...) | Espanol (`EloquentUsuarioRepositorio.php`) |
| `Http/` | Ingles (convencion Laravel: `Controllers/`, `Requests/`, `Resources/`, `Middleware/`) | Espanol + sufijo Laravel (`UsuarioController.php`, `IniciarSesionRequest.php`) |

```text
backend/
├── app/
│   ├── Dominio/                          # Logica de negocio pura. Cero Laravel.
│   │   ├── Autenticacion/
│   │   │   ├── Entidades/
│   │   │   ├── Repositorios/            # Interfaces (contratos)
│   │   │   └── Servicios/
│   │   ├── Usuarios/
│   │   │   ├── Entidades/
│   │   │   │   └── Usuario.php
│   │   │   ├── Repositorios/
│   │   │   │   └── UsuarioRepositorio.php
│   │   │   └── Servicios/
│   │   ├── Tiendas/
│   │   ├── Categorias/
│   │   ├── Productos/                   # TORTA, DETALLE, SUBLIMACION y disenos
│   │   ├── Publicaciones/
│   │   ├── Produccion/
│   │   ├── Carrito/
│   │   ├── Pedidos/
│   │   ├── Pagos/
│   │   ├── Notificaciones/
│   │   └── Multimedia/
│   │
│   ├── Aplicacion/                       # Casos de uso y DTOs
│   │   ├── Autenticacion/
│   │   │   ├── CasosUso/
│   │   │   │   ├── RegistrarCliente.php
│   │   │   │   ├── IniciarSesion.php
│   │   │   │   └── CerrarSesion.php
│   │   │   └── DTOs/
│   │   │       ├── RegistrarClienteDatos.php
│   │   │       └── IniciarSesionDatos.php
│   │   ├── Usuarios/
│   │   ├── Tiendas/
│   │   ├── Catalogo/
│   │   ├── Publicaciones/
│   │   ├── Produccion/
│   │   ├── Carrito/
│   │   ├── Pedidos/
│   │   ├── Pagos/
│   │   └── Multimedia/
│   │
│   ├── Infraestructura/                  # Adaptadores (Eloquent, storage, pagos)
│   │   ├── Persistencia/
│   │   │   └── Eloquent/
│   │   │       ├── Modelos/
│   │   │       │   └── Usuario.php
│   │   │       └── Repositorios/
│   │   │           └── EloquentUsuarioRepositorio.php
│   │   ├── Almacenamiento/              # Servidor de archivos (Laptop 5)
│   │   ├── Pagos/
│   │   └── Notificaciones/
│   │
│   └── Http/                             # Entrada y salida HTTP. Carpetas en ingles.
│       ├── Controllers/
│       │   └── AutenticacionController.php
│       ├── Requests/
│       │   ├── RegistrarClienteRequest.php
│       │   └── IniciarSesionRequest.php
│       ├── Resources/
│       │   └── UsuarioResource.php
│       └── Middleware/
│           └── VerificarRol.php
│
├── .agents/                              # Rules y Skills de Laravel Boost
│   ├── rules/backend-rules.md
│   └── skills/sdd-module-implementation/
│
├── database/                             # Migraciones, Seeders y Factories de PostgreSQL
├── routes/                               # Rutas de API versionadas (/api/v1/...)
└── tests/                                # Pruebas automatizadas (Unitarias, Integracion)
```

---

## Formato Estandar de Respuestas API (Envelope JSON)

Toda respuesta de la API cumple con el siguiente formato:

### Respuesta Exitosa (200, 201)
```json
{
  "success": true,
  "message": "Operacion realizada con exito.",
  "data": { ... },
  "meta": { ... }
}
```

### Error de Validacion (422)
```json
{
  "success": false,
  "message": "Los datos proporcionados no son validos.",
  "errors": {
    "campo": ["Detalle del error"]
  }
}
```

### Error de Negocio o Autorizacion (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "message": "Descripcion del error.",
  "codigo_error": "CODIGO_OPCIONAL"
}
```

---

## Ejecucion Local

```bash
# 1. Instalar dependencias PHP (no npm)
composer install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Migrar base de datos PostgreSQL (cuando existan las migraciones del SQL)
php artisan migrate --seed

# 4. Iniciar API
php artisan serve --host=0.0.0.0 --port=8000
# o: composer run dev
```

Comprobar stack:

```bash
php -v
php artisan --version
composer show laravel/framework laravel/sanctum phpunit/phpunit
```

---

## Docker y Despliegue Distribuido

El backend se ejecuta en **dos instancias independientes** detras del balanceador de carga NGINX (Laptop 1 - Michael). No son microservicios: misma imagen, mismo codigo, misma base de datos.

```text
                       NGINX
                   (Load Balancer)
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
         backend-1               backend-2
        Puerto :8001            Puerto :8002
             │                       │
             └───────────┬───────────┘
                         ▼
                    PostgreSQL
              (hoy Supabase; destino Laptop 4)
```

Ambas instancias comparten el mismo codigo en `backend/` y leen `.env` en tiempo de ejecucion (no se copia a la imagen). El proceso escucha `0.0.0.0:$PORT` (`PORT=8000` dentro del contenedor). Runtime de la imagen: PHP 8.4 CLI (`php:8.4-cli-bookworm`); el host local sigue en PHP 8.5.

Durante la integracion inicial, `API_PUBLIC_ORIGIN` fija el origen LAN que devuelven ambas instancias y el volumen `multimedia-data` comparte los archivos. Para levantar una base `nexo_demo` aislada y entregar credenciales de prueba a Web y Movil, seguir la [guia de integracion](../docs/04-api/guia-integracion-web-movil.md). NGINX y el servidor de archivos externo siguen pendientes.

```bash
cd backend
docker compose up --build -d

curl -s http://127.0.0.1:8001/up
curl -s http://127.0.0.1:8002/up
curl -s http://127.0.0.1:8001/api/v1/salud

docker compose exec backend-1 php artisan db:show
docker compose down
```

- `backend-1` publica `8001 -> 8000`
- `backend-2` publica `8002 -> 8000`
- Healthcheck interno: `GET http://127.0.0.1:8000/up`

---

## Reglas Obligatorias del Backend

1. **Spec First:** Primero se redacta y revisa la especificacion en `../docs/04-api/specs/` antes de escribir codigo.
2. **Acceso Exclusivo a BD:** El Backend es el unico componente autorizado para conectarse directamente a PostgreSQL.
3. **Desacoplamiento:** Las clases en `Dominio/` nunca deben importar clases de Eloquent ni Facades de Laravel.
4. **Respuestas Estandarizadas:** Toda respuesta de la API debe utilizar el envelope JSON estandar `{ success, data/errors, message }`.
5. **Sin Emojis:** Prohibido el uso de emojis en codigo, comentarios, documentacion o mensajes de commit.
6. **API pura:** prohibido Blade, Vite, Tailwind y sesiones web en este servicio.
7. **Flujo SDD:** bitacora → roadmap → spec → codigo → pruebas → roadmap/bitacora → un mensaje de commit para Anthony.
