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
