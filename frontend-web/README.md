# Frontend Web — NexoCommerce

Aplicación web de **NexoCommerce** destinada a clientes y administradores.

El Frontend Web constituye la capa de presentación del sistema distribuido y es responsable de la interfaz de usuario, navegación, formularios, visualización de información y consumo de los servicios proporcionados por la API REST.

El frontend no accede directamente a PostgreSQL. Toda operación relacionada con datos o lógica de negocio se realiza mediante la API REST del Backend.

---

## Responsable

**Nathalia — Portátil 2: Frontend Web**

---

## Stack Tecnológico

Stack base configurado para el desarrollo del Frontend Web de NexoCommerce.

| Componente | Versión instalada | Función |
|---|---:|---|
| Node.js | 24.15.0 | Entorno de ejecución para herramientas de desarrollo |
| npm | 11.13.0 | Gestor de dependencias |
| React | 19.3.0 | Construcción de interfaces de usuario |
| React DOM | 19.3.0 | Renderizado de React en el navegador |
| TypeScript | 6.0.3 | Tipado estático del proyecto |
| Vite | 8.3.1 | Servidor de desarrollo y construcción |
| ESLint | 10.11.0 | Análisis estático y calidad del código |
| React Router DOM | 7.18.4 | Navegación y enrutamiento |
| Axios | 1.20.0 | Comunicación HTTP con la API REST |
| React Hook Form | 7.89.0 | Gestión de formularios |
| Tailwind CSS | 4.3.3 | Estilos de la interfaz |
| @tailwindcss/vite | 4.3.3 | Integración de Tailwind CSS con Vite |

---

## Arquitectura Distribuida

NexoCommerce utiliza una arquitectura distribuida en la que cada componente del sistema se ejecuta de forma independiente.

El Frontend Web corresponde al componente asignado al **Portátil 2**.

```text
                        CLIENTE WEB
                         Navegador
                            │
                            ▼
                 ┌─────────────────────┐
                 │    FRONTEND WEB     │
                 │     Portátil 2      │
                 │ React + TypeScript  │
                 │       + Vite        │
                 └──────────┬──────────┘
                            │
                         HTTP/REST
                            │
                            ▼
                 ┌─────────────────────┐
                 │        NGINX        │
                 │     Portátil 1      │
                 │ Reverse Proxy / LB  │
                 └──────────┬──────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
              Backend 1         Backend 2
                :8001             :8002
                   │                 │
                   └────────┬────────┘
                            │
                            ▼
                       PostgreSQL
                        Portátil 4

Backend ──────────────────► Servidor de archivos
                              Portátil 5
```

### Flujo principal de comunicación

```text
Frontend Web
     │
     ▼
NGINX
     │
     ▼
Backend Laravel
     │
     ▼
PostgreSQL
```

El Frontend Web **no debe conectarse directamente a PostgreSQL**.

---

## API REST

El Frontend Web consume exclusivamente la API REST proporcionada por el Backend de NexoCommerce.

La API está versionada bajo:

```text
/api/v1
```

La dirección del servidor no debe escribirse directamente dentro de los componentes.

Se utilizará una variable de entorno:

```env
VITE_API_URL=http://<IP_NGINX>/api/v1
```

La comunicación HTTP será centralizada mediante **Axios**.

```text
Página / Componente
        │
        ▼
     Servicio
        │
        ▼
      Axios
        │
        ▼
  VITE_API_URL
        │
        ▼
      NGINX
        │
        ▼
 Laravel REST API
```

---

## Contratos de la API

El Frontend Web debe respetar los contratos definidos para NexoCommerce.

Las fuentes principales de los contratos se encuentran en:

```text
../docs/04-api/
../docs/04-api/specs/
../docs/04-api/openapi/openapi.yaml
```

Antes de integrar una funcionalidad con el Backend se debe verificar:

- Método HTTP.
- Ruta.
- Parámetros.
- Cuerpo de la petición.
- Campos obligatorios.
- Respuesta exitosa.
- Respuestas de error.
- Requisitos de autenticación.
- Roles autorizados.

No se deben inventar endpoints, campos o reglas que no estén definidos en los contratos del sistema.

---

## Formato Estándar de Respuestas API

El Frontend Web debe interpretar el formato estándar definido por el Backend.

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Operacion realizada con exito.",
  "data": {},
  "meta": {}
}
```

### Error de validación

```json
{
  "success": false,
  "message": "Los datos proporcionados no son validos.",
  "errors": {}
}
```

### Error de negocio o autorización

```json
{
  "success": false,
  "message": "Descripcion del error.",
  "codigo_error": "CODIGO_OPCIONAL"
}
```

---

## Autenticación

La autenticación será proporcionada por el Backend mediante **Laravel Sanctum**.

Las rutas protegidas utilizarán:

```http
Authorization: Bearer <token>
```

Los roles principales definidos por el sistema son:

```text
CLIENTE
ADMIN
```

El frontend podrá utilizar la información del usuario y su rol para controlar la navegación y mostrar las interfaces correspondientes.

La autorización definitiva de cualquier operación siempre será responsabilidad del Backend.

---

## Módulos del Frontend

El Frontend Web se divide en funcionalidades para clientes y administradores.

### Cliente

El cliente podrá acceder progresivamente a los siguientes módulos:

- Registro.
- Inicio de sesión.
- Cierre de sesión.
- Perfil.
- Inicio.
- Catálogo.
- Categorías.
- Productos.
- Repostería.
- Detalles personalizados.
- Sublimación.
- Personalización de productos.
- Carrito.
- Checkout.
- Pagos.
- Comprobantes.
- Pedidos.
- Notificaciones.

### Administrador

El panel administrativo contempla:

- Dashboard.
- Gestión de productos.
- Gestión de categorías.
- Gestión de tortas.
- Gestión de diseños.
- Gestión de productos de sublimación.
- Gestión de plantillas.
- Gestión de publicaciones.
- Gestión de multimedia.
- Gestión de pedidos.
- Gestión de pagos.
- Gestión de usuarios.
- Configuración de la tienda.

Los módulos serán desarrollados progresivamente de acuerdo con la disponibilidad de los contratos y endpoints del Backend.

---

## Flujo Principal del Cliente

```text
Registro / Login
       │
       ▼
     Inicio
       │
       ▼
    Catálogo
       │
       ▼
    Producto
       │
       ├────► Personalización de torta
       │
       └────► Personalización de sublimación
       │
       ▼
     Carrito
       │
       ▼
    Checkout
       │
       ▼
      Pago
       │
       ▼
     Pedido
       │
       ▼
Seguimiento del pedido
       │
       ▼
  Notificaciones
```

---

## Flujo Principal del Administrador

```text
Login
  │
  ▼
Dashboard
  │
  ├── Productos
  ├── Categorías
  ├── Tortas
  ├── Diseños
  ├── Sublimación
  ├── Plantillas
  ├── Publicaciones
  ├── Multimedia
  ├── Pedidos
  ├── Pagos
  ├── Usuarios
  └── Configuración
```

---

## Arquitectura del Frontend

El Frontend Web mantendrá separadas las responsabilidades de presentación, navegación, estado, tipado y comunicación con la API.

La estructura objetivo del proyecto será:

```text
frontend-web/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── catalog/
│   │   ├── cart/
│   │   └── admin/
│   │
│   ├── layouts/
│   │   ├── PublicLayout/
│   │   ├── ClientLayout/
│   │   └── AdminLayout/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── catalog/
│   │   ├── bakery/
│   │   ├── details/
│   │   ├── sublimation/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── payments/
│   │   ├── orders/
│   │   ├── notifications/
│   │   └── admin/
│   │
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

Las carpetas de la arquitectura objetivo se crearán progresivamente conforme se implementen los módulos.

---

## Capa de Servicios

Las peticiones HTTP no deben implementarse directamente dentro de los componentes visuales.

La comunicación con la API será centralizada en:

```text
src/services/
```

Estructura objetivo:

```text
services/
├── api.ts
├── authService.ts
├── userService.ts
├── categoryService.ts
├── productService.ts
├── customizationService.ts
├── cartService.ts
├── orderService.ts
├── paymentService.ts
├── notificationService.ts
└── multimediaService.ts
```

### `api.ts`

Será responsable de la configuración general de Axios:

```text
Base URL
Headers
Bearer Token
Interceptores
Manejo general de respuestas
Manejo general de errores
```

Los demás servicios encapsularán las operaciones correspondientes a cada módulo.

---

## Backend en Desarrollo

Frontend y Backend se desarrollan de manera independiente.

Cuando una funcionalidad del Backend todavía no esté disponible, el Frontend podrá utilizar datos simulados.

```text
Mock Data
    │
    ▼
Servicio
    │
    ▼
Componente React
```

Posteriormente:

```text
Laravel API
    │
    ▼
Servicio
    │
    ▼
Componente React
```

Esto permite desarrollar las interfaces sin acoplar los componentes directamente al estado actual del Backend.

Los mocks deberán respetar, siempre que exista el contrato correspondiente, la estructura definida por la API.

---

## Variables de Entorno

Las configuraciones dependientes del entorno deben mantenerse separadas del código fuente.

Ejemplo:

```env
VITE_API_URL=http://<IP_NGINX>/api/v1
```

El proyecto utilizará:

```text
.env
.env.example
```

`.env.example` servirá como referencia de las variables necesarias para ejecutar el Frontend.

No deben almacenarse credenciales o secretos dentro del código fuente.

---

## Tailwind CSS

Tailwind CSS está integrado mediante el plugin oficial para Vite:

```text
tailwindcss
@tailwindcss/vite
```

La integración se realiza desde:

```text
vite.config.ts
```

y los estilos globales se cargan desde:

```text
src/index.css
```

---

## Navegación

La navegación del Frontend será administrada mediante:

```text
React Router DOM
```

Se contemplan tres grupos principales de rutas:

```text
Rutas públicas
Rutas protegidas del cliente
Rutas protegidas del administrador
```

Ejemplos de rutas previstas:

```text
/
├── /catalogo
├── /productos/:id
├── /reposteria
├── /detalles
├── /sublimacion
├── /login
├── /registro
│
├── /perfil
├── /carrito
├── /checkout
├── /pedidos
├── /pedidos/:id
├── /notificaciones
│
└── /admin
    ├── /productos
    ├── /categorias
    ├── /tortas
    ├── /disenos
    ├── /sublimacion
    ├── /plantillas
    ├── /publicaciones
    ├── /multimedia
    ├── /pedidos
    ├── /pagos
    ├── /usuarios
    └── /configuracion
```

Estas rutas representan la estructura prevista del Frontend y se implementarán progresivamente.

---

## Ejecución Local

### Requisitos

```text
Node.js 24.15.0
npm 11.13.0
```

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

Vite inicia por defecto el servidor local en:

```text
http://localhost:5173/
```

### 3. Verificar calidad del código

```bash
npm run lint
```

### 4. Generar build de producción

```bash
npm run build
```

El resultado de producción se genera en:

```text
dist/
```

---

## Validación Inicial

La configuración inicial del proyecto fue comprobada mediante:

```bash
npm run lint
npm run build
```

Estado:

```text
ESLint: OK
TypeScript: OK
Vite Build: OK
```

---

## Git y Flujo de Trabajo

El desarrollo del Frontend Web se realiza en una rama independiente:

```text
frontend-web/feat
```

Los cambios correspondientes al Frontend deben mantenerse dentro de:

```text
frontend-web/
```

No se deben modificar desde este equipo los componentes asignados a otros integrantes:

```text
app-movil/
backend/
database/
nginx/
servidor-archivos/
```

---

## Sparse Checkout

Para mantener en el equipo únicamente el componente correspondiente al Frontend Web se utiliza **Git Sparse Checkout**.

Configuración utilizada:

```bash
git sparse-checkout init --cone
git sparse-checkout set frontend-web
```

Esto permite trabajar con:

```text
frontend-web/
```

sin mantener físicamente todas las carpetas de los demás componentes del sistema en el árbol de trabajo.

Sparse Checkout no elimina los demás componentes del repositorio remoto.

---

## Convención de Commits

Se utilizará la convención **Conventional Commits**.

Formatos principales:

```text
feat: nueva funcionalidad
fix: corrección de errores
docs: documentación
style: cambios visuales o de formato
refactor: reorganización del código
test: pruebas
chore: configuración o mantenimiento
```

Cuando sea conveniente se indicará el ámbito:

```text
feat(frontend): ...
fix(auth): ...
feat(catalog): ...
feat(cart): ...
docs(frontend): ...
```

Ejemplo del commit de configuración inicial:

```text
feat(frontend): crear estructura inicial del proyecto web
```

---

## Reglas del Frontend

1. El Frontend Web no debe conectarse directamente a PostgreSQL.
2. Toda operación de negocio debe realizarse mediante la API REST.
3. La URL de la API debe configurarse mediante variables de entorno.
4. Las peticiones HTTP deben mantenerse separadas de los componentes visuales.
5. Los nombres de campos deben respetar los contratos definidos por la API.
6. No se deben inventar endpoints que no estén definidos en los contratos.
7. El frontend no debe considerar como definitivos cálculos de precios, stock o disponibilidad que correspondan al Backend.
8. Las rutas privadas requieren autenticación.
9. Las rutas administrativas requieren autenticación y rol `ADMIN`.
10. La autorización final siempre debe ser validada por el Backend.
11. Los módulos que todavía no dispongan de endpoints funcionales podrán trabajar temporalmente con mocks desacoplados.


---

## Estado Actual

### Fase 0 — Configuración Base del Frontend

```text
[x] Repositorio Git configurado
[x] Rama frontend-web/feat
[x] Sparse Checkout configurado
[x] Node.js 24.15.0
[x] npm 11.13.0
[x] React 19.3.0
[x] TypeScript 6.0.3
[x] Vite 8.3.1
[x] ESLint 10.11.0
[x] React Router DOM 7.18.4
[x] Axios 1.20.0
[x] React Hook Form 7.89.0
[x] Tailwind CSS 4.3.3
[x] Integración Tailwind + Vite
[x] Validación ESLint
[x] Build de producción
[ ] Arquitectura completa de carpetas
[ ] Sistema de rutas
[ ] Capa de servicios
[ ] Variables de entorno
[ ] Sistema de autenticación
[ ] Integración con API REST
[ ] Módulos del cliente
[ ] Panel administrativo
[ ] Pruebas del Frontend
```

---

## Estado del Proyecto

**En desarrollo.**

Actualmente se encuentra completada la configuración tecnológica inicial del Frontend Web.

La siguiente etapa corresponde a la creación de la arquitectura interna del proyecto, configuración del sistema de rutas, capa de servicios y preparación de los módulos funcionales.
