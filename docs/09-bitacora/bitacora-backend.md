# Bitacora de Desarrollo del Backend - NexoCommerce

* **Responsable:** Anthony
* **Componente:** Backend Laravel API (Instancias duales)
* **Asignatura:** IS-803 Integracion e Implementacion de Software
* **Periodo:** 2026-2

---

## Registro Cronologico de Actividades

| Fecha y Hora | Fase / Modulo | Tarea Realizada | Commit / Referencia | Responsable |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-07 23:15 | Fase 0: Infraestructura | Creacion de rama `feat/backend-api` e inicializacion de Laravel 11 | `feat(backend): estructura inicial de Laravel API` | Anthony |
| 2026-09-07 23:35 | Fase 0: Especificaciones SDD | Redaccion de contratos tecnicos de API y especificaciones por modulo en `docs/04-api/specs/` | `docs(api): crear especificaciones tecnicas SDD...` | Anthony |
| 2026-09-07 23:55 | Fase 0: IA y Buenas Practicas | Instalacion de `laravel/boost` e integracion con MCP para analisis de codigo y rutas | `chore: instalar y configurar laravel boost...` | Anthony |
| 2026-09-08 00:05 | Fase 0: Arquitectura y Reglas | Configuracion de directrices locales en `.agents/` (Clean Architecture, SDD, sin emojis) y unificacion de `ROADMAP.md` | `docs: consolidar roadmap y guia unica...` | Anthony |
| 2026-09-08 00:10 | Fase 0: Trazabilidad | Creacion de la bitacora oficial de actividades y regla de registro obligatorio de avances | `docs: crear bitacora de desarrollo del backend` | Anthony |
| 2026-09-08 00:13 | Fase 0: Optimizacion | Limpieza de archivos redundantes generados por Boost en Git y exclusion en `.gitignore` | `chore: ignorar carpetas y configuraciones...` | Anthony |
| 2026-09-08 00:16 | Fase 0: Directrices | Ajuste de regla para proponer commits unicamente ante cambios de codigo y actualizacion de ROADMAP.md | `chore: actualizar directrices de commits y roadmap` | Anthony |
| 2026-09-08 00:27 | Fase 0: Base API | Configuracion de Laravel como API REST pura: CORS, blindaje JSON forzoso, eliminacion de vistas web y pruebas de integracion | `feat: configurar backend exclusivamente como API REST pura` | Anthony |
| 2026-09-08 19:35 | Fase 0: Infraestructura | Documentacion detallada de tecnologias y extensiones requeridas del backend en README.md | `docs: detallar tecnologias y dependencias del backend` | Anthony |
| 2026-09-13 11:38 | Fase 0: Contratos SDD | Realineacion de `docs/04-api` (specs 01-12, OpenAPI 1.1.0) y `backend/ROADMAP.md` con las 25 tablas de `database/database.sql` | incluido en el commit de flujo SDD | Anthony |
| 2026-09-17 08:22 | Fase 0: Stack | Verificacion del runtime: PHP 8.5.10, Laravel 13.30.1, Sanctum 4.3.3, Composer 2.10.3, PHPUnit 12.5.34. README del backend actualizado. `package.json`/Vite no forman parte de la API | `docs: alinear README del backend con Laravel 13 y PHP 8.5` | Anthony |
| 2026-09-20 18:20 | Fase 0: Arquitectura | Restauracion del esqueleto Clean Architecture en `app/` (Dominio, Aplicacion, Infraestructura, Http) con `.gitkeep` para que las carpetas vacias no desaparezcan al clonar | `chore: versionar esqueleto de capas Clean Architecture` | Anthony |
| 2026-09-20 18:26 | Fase 0: Arquitectura | Esqueleto de carpetas sin clases de negocio: Dominio/Aplicacion/Infraestructura en espanol; Http en ingles. Eliminadas Controladores/Solicitudes/Recursos | `chore: alinear esqueleto de capas con idioma mixto` | Anthony |
| 2026-09-20 21:08 | Fase 0: Infraestructura | `.env` temporal a PostgreSQL 17.6 de Supabase (session pooler puerto 5432, driver `pgsql`, SSL require). `php artisan db:show` OK. Laptop 4 sigue pendiente | `chore: apuntar .env.example a pgsql/Supabase temporal` | Anthony |
| 2026-09-20 21:12 | Fase 0: Base API | Backend solo API: se elimino Vite/Tailwind/`web.php`; JSON en `/` y `/up`; Sanctum sin cookies CSRF | `feat: dejar Laravel como API REST sin capa web` | Anthony |
| 2026-09-20 21:22 | Fase 0: Base de datos | Schema NexoCommerce en migraciones Laravel (25 tablas, CHECK, indices parciales). Sin tabla `users`. Seeds ADMIN/CLIENTE y Dulces Aesca en Supabase. Laptop 4 sigue pendiente | `feat: portar database.sql a migraciones PostgreSQL` | Anthony |
| 2026-09-20 21:31 | Fase 0: Docker | Imagen `nexocommerce-backend:local` (PHP 8.4 CLI). Compose: `backend-1:8001` y `backend-2:8002` healthy. `/up` JSON en ambos. `db:show` y `roles` ADMIN/CLIENTE contra Supabase. Laptop 4 sigue pendiente | `chore: añadir Docker dual para backend-1:8001 y backend-2:8002` | Anthony |
| 2026-09-22 21:10 | Fase 1: Autenticacion y Usuarios | Implementacion completa de Fase 1 (specs 01 y 02): Dominio (entidades + interfaces), Aplicacion (7 casos de uso auth + 4 usuarios + DTOs + excepciones), Infraestructura (4 modelos Eloquent + 3 repositorios + SanctumTokenService), Http (VerificarRol + 7 FormRequests + UsuarioResource + 3 controllers), rutas bajo `/api/v1`, `config/auth.php` apuntando a `UsuarioModelo`, alias `rol:` en bootstrap. Pruebas: 15 unitarias + 20 integracion HTTP contra PostgreSQL (Supabase) — 45/45 verde. Formateado con pint. | `feat(auth): implementar Fase 1 — autenticacion, usuarios y roles` | Anthony |
| 2026-09-23 21:05 | Fase 1: SDD / Requisitos | Alineacion SDD: RF-01 y RF-02 en `docs/01-requisitos/README.md` actualizados al contrato de specs 01/02 (password min 8, telefono opcional, roles ADMIN/CLIENTE, OAuth GOOGLE, envio de codigo por correo). Specs 01/02 a v1.1.1 con trazabilidad RF y TCs marcados. | `docs(sdd): alinear RF-01/02 con specs auth y usuarios` | Anthony |
| 2026-09-23 21:10 | Fase 1: OAuth solo Google | Decision de negocio: OAuth unicamente `GOOGLE` (sin FACEBOOK). Spec 01 → v1.1.2, OpenAPI, SQL/CHECK, FormRequest, migracion `oauth_solo_google`, ROADMAP y Postman actualizados. | `fix(auth): restringir OAuth a GOOGLE solamente` | Anthony |
| 2026-09-23 21:35 | Fase 2: Multimedia | Implementacion completa de la spec 08: entidad e interfaces de dominio, casos de uso de subida/consulta/desactivacion, puerto de almacenamiento local, modelo y repositorio Eloquent, factory, FormRequest con validacion de PDF por destino, Resource con URL calculada, endpoints Sanctum y autorizacion ADMIN/dueno. Pruebas: 12/12 Multimedia y 57/57 suite completa; Pint aplicado. | `feat(multimedia): implementar Fase 2 con almacenamiento local y endpoints SDD` | Anthony |
| 2026-09-23 21:48 | Fase 3: Tienda | Implementacion de la spec 09: configuracion de tienda con entidad, casos de uso, repositorio Eloquent, factory, Resource, validaciones, endpoints publico y ADMIN; se conserva una unica fila activa y `activo = true`. Pruebas unitarias e integracion agregadas; Pint y suite completa (67 pruebas, 294 aserciones) en verde. | `feat(tienda): implementar configuracion de tienda y endpoints SDD` | Anthony |
| 2026-09-23 22:14 | Fase 4: Categorias | Implementacion de la spec 03: entidad y repositorio, arbol publico con imagen y filtro de activas, CRUD administrativo, unicidad por padre, actualizacion conservando omitidos, proteccion contra ciclos y desactivacion bloqueada por productos activos. Pint aplicado; 22 pruebas nuevas y suite completa (89 pruebas, 380 aserciones) en verde. | `feat(categorias): implementar arbol y gestion administrativa SDD` | Anthony |
