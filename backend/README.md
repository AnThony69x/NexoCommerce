# Backend - NexoCommerce API REST

API REST principal de NexoCommerce construida con **Laravel 11**, estructurada bajo **Clean Architecture / DDD** y desarrollada bajo la metodologia **SDD (Spec-Driven Development / Desarrollo Dirigido por Especificaciones)**.

---

## Responsable
**Anthony** (Laptop 3 - Backend Laravel x2)

---

## Tecnologias

- **Lenguaje:** PHP 8.3 (Strict Types)
- **Framework:** Laravel 11
- **Autenticacion:** Laravel Sanctum (Tokens Bearer)
- **Base de datos:** PostgreSQL (Driver `pdo_pgsql` - Laptop 4: Melanie)
- **Contenedores:** Docker (2 instancias backend balanceadas)
- **Herramientas de IA y Contexto:** Laravel Boost + MCP (.agents local)
- **Documentacion y Contratos:** OpenAPI 3.1 + Specs Markdown en `../docs/04-api/`
- **Testing:** PHPUnit / Pest

---

## Metodologia: SDD (Spec-Driven Development)

Ningun endpoint o logica se codifica en Laravel sin antes contar con su contrato tecnico aprobado.

Toda la documentacion de especificaciones y contratos se encuentra centralizada en:
- **Guia y Roadmap del backend:** [ROADMAP.md](ROADMAP.md)
- **Directorio de contratos:** [../docs/04-api/](../docs/04-api/)
- **Especificaciones por modulo:** [../docs/04-api/specs/](../docs/04-api/specs/)
- **Contrato OpenAPI unificado:** [../docs/04-api/openapi/openapi.yaml](../docs/04-api/openapi/openapi.yaml)

---

## Roadmap y Fases de Desarrollo

El progreso detallado, dependencias tecnicas y estado de cada modulo se gestionan en [ROADMAP.md](ROADMAP.md):

- **Fase 0: Configuracion Base e Infraestructura** (En progreso: Laravel 11, Sanctum, Boost MCP, .agents)
- **Fase 1: Autenticacion y Usuarios** (Login, registro, roles admin/cliente, tokens)
- **Fase 2: Tiendas y Parametrizacion** (Configuracion global del negocio)
- **Fase 3: Catalogo** (Categorias, subcategorias y productos)
- **Fase 4: Personalizaciones** (Opciones dinamicas: texto, color, tamano, diseno)
- **Fase 5: Carrito de Compras** (Persistencia, calculo de subtotales)
- **Fase 6: Gestion de Pedidos** (Transacciones atomicas, reserva de stock, maquina de estados)
- **Fase 7: Pagos y Comprobantes** (Transferencias bancarias, validacion administrativa)
- **Fase 8: Integracion Multimedia** (Servidor de archivos Linux de Laptop 5)
- **Fase 9: Notificaciones del Sistema** (Alertas de pedidos y pagos)
- **Fase 10: Pruebas de Carga y Despliegue** (Docker dual + balanceo NGINX)

---

## Flujo de Trabajo Obligatorio en 6 Pasos

Todo desarrollo sigue rigurosamente esta secuencia:

1. **Paso 1: Planificacion**
   Analizar el contrato en `../docs/04-api/specs/<modulo>.spec.md` y presentar un plan detallado antes de escribir codigo.

2. **Paso 2: Desarrollo con Buenas Practicas y Patrones de Diseno**
   - Principios SOLID y diseno guiado por el dominio (DDD).
   - Separacion estricta de capas en `app/`.
   - PHP 8.3 estricto (`declare(strict_types=1);`).

3. **Paso 3: Pruebas Unitarias**
   - Ejecutar pruebas unitarias en `tests/Unitarias/` para validar logica de negocio y entidades aisladas de la base de datos.
   - Corregir fallos de inmediato.

4. **Paso 4: Pruebas de Integracion**
   - Ejecutar pruebas en `tests/Integracion/` contra PostgreSQL.
   - Validar el flujo completo: autenticacion, validaciones (422), persistencia y envelope JSON de respuesta.

5. **Paso 5: Generacion del Commit**
   Una vez que todas las pruebas pasen en verde, se propone el commit con el formato correspondiente:
   - Nueva funcionalidad: `git commit -m "feat: agrega endpoint para productos"`
   - Correccion de errores: `git commit -m "fix: corrige validacion de productos"`
   - Refactorizacion: `git commit -m "refactor: separa logica de productos en servicios"`
   - Pruebas: `git commit -m "test: agrega pruebas para productos"`
   - Documentacion: `git commit -m "docs: actualiza contrato de pedidos"`
   - Mantenimiento: `git commit -m "chore: ajusta variables de entorno"`

6. **Paso 6: Registro y Trazabilidad (Obligatorio)**
   Inmediatamente tras el commit:
   - Marcar con `[x]` en [ROADMAP.md](ROADMAP.md) con fecha y hora.
   - Registrar la entrada en [../docs/09-bitacora/bitacora-backend.md](../docs/09-bitacora/bitacora-backend.md) con fecha, modulo, tarea, commit y responsable.

---

## Arquitectura por Capas (`app/`)

Se conserva la estructura del framework integrando la arquitectura por capas dentro de `app/`:

```text
backend/
├── app/
│   ├── Dominio/                 # Logica de negocio pura (Sin dependencias de Laravel)
│   │   ├── Autenticacion/       # Entidades, Repositorios (Interfaces), Servicios de Dominio
│   │   ├── Usuarios/
│   │   ├── Tiendas/
│   │   ├── Categorias/
│   │   ├── Productos/
│   │   ├── Personalizacion/
│   │   ├── Carrito/
│   │   ├── Pedidos/
│   │   ├── Pagos/
│   │   ├── Notificaciones/
│   │   └── Multimedia/
│   │
│   ├── Aplicacion/              # Casos de uso y DTOs
│   │   ├── Autenticacion/       # CasosUso/ y DTOs/
│   │   ├── Usuarios/
│   │   ├── Tiendas/
│   │   ├── Catalogo/
│   │   ├── Carrito/
│   │   ├── Pedidos/
│   │   ├── Pagos/
│   │   └── Multimedia/
│   │
│   ├── Infraestructura/         # Implementaciones tecnologicas
│   │   ├── Persistencia/
│   │   │   └── Eloquent/
│   │   │       ├── Modelos/     # Modelos Eloquent de base de datos
│   │   │       └── Repositorios/# Implementacion de interfaces de Dominio
│   │   ├── Almacenamiento/      # Conexion con Servidor de Archivos Linux (Laptop 5)
│   │   ├── Pagos/
│   │   └── Notificaciones/
│   │
│   └── Http/                    # Entrada y salida HTTP
│       ├── Controladores/       # Controladores delgados (delegan a Casos de Uso)
│       ├── Solicitudes/         # FormRequests (validacion segun especificaciones)
│       ├── Recursos/            # API Resources (envelope JSON estandarizado)
│       └── Middleware/          # Autenticacion Sanctum y autorizacion por roles
│
├── .agents/                     # Rules y Skills de Antigravity / Laravel Boost
│   ├── rules/backend-rules.md
│   └── skills/sdd-module-implementation/
│
├── database/                    # Migraciones, Seeders y Factories de PostgreSQL
├── routes/                      # Rutas de API versionadas (/api/v1/...)
└── tests/                       # Pruebas automatizadas (Unitarias, Integracion)
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
# 1. Instalar dependencias
composer install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Migrar base de datos PostgreSQL
php artisan migrate --seed

# 4. Iniciar servidor de desarrollo
php artisan serve
```

---

## Docker y Despliegue Distribuido

El backend se ejecuta en **dos instancias independientes** detras del balanceador de carga NGINX (Laptop 1 - Michael):

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
                    (Laptop 4)
```

Ambas instancias comparten el mismo codigo fuente en `backend/`.

---

## Reglas Obligatorias del Backend

1. **Spec First:** Primero se redacta y revisa la especificacion en `../docs/04-api/specs/` antes de escribir codigo.
2. **Acceso Exclusivo a BD:** El Backend es el unico componente autorizado para conectarse directamente a PostgreSQL.
3. **Desacoplamiento:** Las clases en `Dominio/` nunca deben importar clases de Eloquent ni Facades de Laravel.
4. **Respuestas Estandarizadas:** Toda respuesta de la API debe utilizar el envelope JSON estandar `{ success, data/errors, message }`.
5. **Sin Emojis:** Prohibido el uso de emojis en codigo, comentarios, documentacion o mensajes de commit.
