# NexoCommerce — Checklist de Desarrollo de Backend (Metodología SDD)

Este checklist es la guía operativa para Anthony (responsable del Backend) para desarrollar paso a paso los módulos del sistema bajo la metodología **SDD (Spec-Driven Development)** y la arquitectura limpia por capas (**Dominio, Aplicación, Infraestructura, Http**).

---

## 📌 Regla de Oro SDD antes de marcar cada módulo:
1. [ ] **Spec**: La especificación técnica en `docs/04-api/specs/XX-modulo.spec.md` está redactada y acordada con Frontend Web y Móvil.
2. [ ] **Migración**: Migración PostgreSQL creada y ejecutada.
3. [ ] **Dominio**: Entidad, RepositorioInterface y Servicios de dominio implementados.
4. [ ] **Aplicación**: Casos de Uso y DTOs creados.
5. [ ] **Infraestructura**: Modelo Eloquent y RepositorioEloquent implementados.
6. [ ] **Http**: FormRequests (validación), Controladores y API Resources (transformación).
7. [ ] **Rutas**: Rutas registradas bajo `/api/v1/...` con sus middlewares.
8. [ ] **Pruebas**: Tests automatizados pasando (Feature y Unitarias).

---

## 🚀 FASE 0: Base e Infraestructura del Backend

- [x] Inicializar proyecto Laravel 11 en `backend/`
- [x] Configurar estructura de carpetas (`Dominio`, `Aplicacion`, `Infraestructura`, `Http`)
- [x] Instalar y configurar `laravel/sanctum` para autenticación con tokens
- [ ] Configurar variables de entorno `.env` para conexión a PostgreSQL (Laptop 4 - Melanie)
- [ ] Configurar excepciones globales en `bootstrap/app.php` para respuestas JSON estandarizadas
- [ ] Configurar CORS en `config/cors.php` para admitir peticiones del Frontend Web (Vite) y Móvil
- [ ] Crear `Dockerfile` para empaquetar el backend
- [ ] Crear `docker-compose.yml` para levantar las dos instancias (`backend-1:8001` y `backend-2:8002`)
- [ ] Verificar endpoint de salud `/up` y conectividad a base de datos

---

## 🔐 FASE 1: Módulo de Autenticación y Usuarios

### 1.1 Autenticación (`/api/v1/auth`)
- [ ] Redactar especificación [01-autenticacion.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/01-autenticacion.spec.md)
- [ ] `POST /api/v1/auth/registro` (Registro de clientes)
- [ ] `POST /api/v1/auth/login` (Autenticación y emisión de token Sanctum)
- [ ] `POST /api/v1/auth/logout` (Revocación del token actual)
- [ ] `GET /api/v1/auth/perfil` (Datos del usuario autenticado)
- [ ] Pruebas automatizadas de autenticación (credenciales válidas, inválidas, token revocado)

### 1.2 Usuarios y Roles (`/api/v1/usuarios`)
- [ ] Redactar especificación [02-usuarios.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/02-usuarios.spec.md)
- [ ] Migración de roles: `administrador`, `cliente`
- [ ] Middleware para control de acceso por roles
- [ ] `GET /api/v1/usuarios` (Solo administradores)
- [ ] `PUT /api/v1/usuarios/{id}` (Actualización de perfil / cambio de contraseña)
- [ ] Pruebas automatizadas de autorización (403 Forbidden para clientes en rutas admin)

---

## 🏬 FASE 2: Módulo de Tiendas y Parametrización

- [ ] Redactar especificación [09-tiendas.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/09-tiendas.spec.md)
- [ ] Migración de tabla `tiendas` / `configuraciones` (Nombre, logo, moneda, teléfono, términos)
- [ ] `GET /api/v1/tienda/configuracion` (Pública para Web y Móvil)
- [ ] `PUT /api/v1/tienda/configuracion` (Solo administradores)
- [ ] Permitir parametrizar el tipo de negocio (Repostería, Detalles, Sublimación, etc.)

---

## 📦 FASE 3: Catálogo (Categorías, Subcategorías y Productos)

### 3.1 Categorías (`/api/v1/categorias`)
- [ ] Redactar especificación [03-categorias.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/03-categorias.spec.md)
- [ ] Migración de `categorias` (con soporte para subcategorías jerárquicas `parent_id`)
- [ ] `GET /api/v1/categorias` (Árbol de categorías públicas)
- [ ] `POST /api/v1/categorias` (Crear - Admin)
- [ ] `PUT /api/v1/categorias/{id}` (Actualizar - Admin)
- [ ] `DELETE /api/v1/categorias/{id}` (Eliminar/Desactivar - Admin)

### 3.2 Productos (`/api/v1/productos`)
- [ ] Redactar especificación [04-productos.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/04-productos.spec.md)
- [ ] Migración de `productos` (nombre, descripción, precio, stock, categoria_id, activo, imagen_url)
- [ ] `GET /api/v1/productos` (Listado paginado con filtros: categoría, precio, búsqueda por nombre)
- [ ] `GET /api/v1/productos/{id}` (Detalle del producto)
- [ ] `POST /api/v1/productos` (Crear producto - Admin)
- [ ] `PUT /api/v1/productos/{id}` (Editar producto - Admin)
- [ ] `DELETE /api/v1/productos/{id}` (Eliminación lógica / desactivación)

---

## 🎨 FASE 4: Módulo de Personalización de Productos

- [ ] Redactar especificación en `04-productos.spec.md` (Sección Personalización)
- [ ] Migración de tablas:
  - `opciones_personalizacion` (Ej: Tamaño, Color, Texto grabado, Imagen estampada)
  - `valores_personalizacion` (Ej: Grande +$2.00, Rojo, etc.)
- [ ] `GET /api/v1/productos/{id}/personalizaciones`
- [ ] `POST /api/v1/productos/{id}/personalizaciones` (Asignar opciones de personalización)
- [ ] Validación de reglas de personalización (campos requeridos, longitud máxima de texto)

---

## 🛒 FASE 5: Módulo de Carrito de Compras (`/api/v1/carrito`)

- [ ] Redactar especificación [05-carrito.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/05-carrito.spec.md)
- [ ] Migración de `carritos` y `carrito_items` (soporta personalizaciones seleccionadas)
- [ ] `GET /api/v1/carrito` (Obtener carrito del usuario autenticado con cálculo de subtotales)
- [ ] `POST /api/v1/carrito/items` (Agregar producto al carrito con validación de stock)
- [ ] `PUT /api/v1/carrito/items/{id}` (Modificar cantidad)
- [ ] `DELETE /api/v1/carrito/items/{id}` (Eliminar un ítem)
- [ ] `DELETE /api/v1/carrito` (Vaciar carrito)

---

## 📋 FASE 6: Módulo de Pedidos (`/api/v1/pedidos`)

- [ ] Redactar especificación [06-pedidos.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/06-pedidos.spec.md)
- [ ] Migración de `pedidos` y `pedido_detalles`
- [ ] `POST /api/v1/pedidos` (Crear pedido a partir del carrito: valida stock, descuenta inventario, crea transacción atómica)
- [ ] `GET /api/v1/pedidos` (Listado de pedidos del usuario cliente)
- [ ] `GET /api/v1/pedidos/{id}` (Detalle completo del pedido)
- [ ] `GET /api/v1/admin/pedidos` (Listado global para administradores con filtros por estado)
- [ ] `PATCH /api/v1/admin/pedidos/{id}/estado` (Cambiar estado: `pendiente`, `pagado`, `en_preparacion`, `enviado`, `entregado`, `cancelado`)
- [ ] Pruebas de concurrencia y transacciones atómicas (evitar overselling de stock)

---

## 💳 FASE 7: Módulo de Pagos y Comprobantes (`/api/v1/pagos`)

- [ ] Redactar especificación [07-pagos.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/07-pagos.spec.md)
- [ ] Migración de `pagos` (pedido_id, metodo_pago: `transferencia`, `efectivo`, `tarjeta`, monto, estado: `pendiente`, `aprobado`, `rechazado`, comprobante_url)
- [ ] `POST /api/v1/pagos/registrar` (El cliente registra el pago y sube comprobante)
- [ ] `GET /api/v1/pagos/{pedido_id}` (Consultar estado del pago de un pedido)
- [ ] `PATCH /api/v1/admin/pagos/{id}/verificar` (El administrador aprueba o rechaza el pago)
- [ ] Actualización automática del estado del pedido al aprobar el pago

---

## 📁 FASE 8: Módulo Multimedia e Integración con Servidor de Archivos

- [ ] Redactar especificación [08-multimedia.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/08-multimedia.spec.md)
- [ ] Coordinar con Emilio (Laptop 5 - Servidor de archivos Linux) el protocolo de subida (API REST / SFTP / Disco compartido)
- [ ] `POST /api/v1/multimedia/subir` (Subida de imágenes de productos, comprobantes y personalizaciones)
- [ ] Validación de formatos (`jpg`, `jpeg`, `png`, `webp`, `pdf`) y límite de tamaño (máx 5MB)
- [ ] Almacenar URL pública en PostgreSQL y retornar JSON con metadata

---

## 🔔 FASE 9: Módulo de Notificaciones (`/api/v1/notificaciones`)

- [ ] Redactar especificación [10-notificaciones.spec.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/10-notificaciones.spec.md)
- [ ] Migración de tabla `notificaciones`
- [ ] `GET /api/v1/notificaciones` (Listar notificaciones del usuario)
- [ ] `PATCH /api/v1/notificaciones/{id}/leida` (Marcar como leída)
- [ ] Disparar notificación ante: Pedido creado, Pago aprobado, Pedido enviado

---

## ⚖️ FASE 10: Despliegue Distribuido y Pruebas de Resiliencia

- [ ] Conectar las 2 instancias de Docker (`backend-1:8001` y `backend-2:8002`) con PostgreSQL (Melanie)
- [ ] Coordinar con Michael (Laptop 1 - NGINX) para la configuración del `upstream` y balanceo Round-Robin
- [ ] Ejecutar prueba de fallo: detener `backend-1` y verificar que NGINX redirige a `backend-2` sin interrupción
- [ ] Probar peticiones concurrentes desde Frontend Web y App Móvil
