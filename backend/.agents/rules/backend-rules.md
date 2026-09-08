# Reglas de Desarrollo - NexoCommerce Backend

Estas reglas son de cumplimiento obligatorio para cualquier tarea dentro del backend y su integracion con la API.

---

## 1. Regla General de Comunicacion y Codigo
- Prohibido terminantemente el uso de emojis en cualquier archivo de codigo, comentarios, respuestas, documentacion y mensajes de commit.
- Comunicacion tecnica, concisa, directa y profesional.

---

## 2. Flujo de Trabajo Obligatorio para Cada Tarea (6 Pasos)

Todo desarrollo debe seguir estrictamente este orden:

### Paso 1: Planificacion
Antes de escribir cualquier linea de codigo, definir un plan claro y detallado de lo que se va a implementar en el momento.

### Paso 2: Desarrollo con Buenas Practicas
- Implementar el codigo aplicando principios SOLID y patrones de diseno (Clean Architecture, Repositorio, DTO, Servicios).
- Respetar la separacion estricta de capas dentro de `app/`:
  - `Dominio/<Modulo>/`: Entidades puras y Repositorios (Interfaces) en PHP nativo. Cero dependencias de Laravel o Eloquent.
  - `Aplicacion/<Modulo>/`: Casos de uso de accion unica y DTOs fuertemente tipados.
  - `Infraestructura/`: Persistencia con Eloquent/PostgreSQL y servicios externos.
  - `Http/`: Controladores delgados, Solicitudes (FormRequests) para validacion estricta y Recursos (API Resources) para transformacion JSON.
- Tipado estricto en PHP 8.3 (`declare(strict_types=1);`).

### Paso 3: Pruebas Unitarias
- Ejecutar pruebas unitarias en `tests/Unitarias/` para aislar y validar la logica de dominio y casos de uso.
- Detectar errores de codigo inmediatamente y corregirlos antes de avanzar.

### Paso 4: Pruebas de Integracion
- Ejecutar pruebas de integracion en `tests/Integracion/` para validar el flujo completo (peticion HTTP, validaciones, persistencia en base de datos y formato del JSON envelope de respuesta).
- Asegurar que todos los tests pasen exitosamente en verde.

### Paso 5: Generacion del Commit
Una vez que todas las pruebas pasen sin errores, proporcionar al usuario el comando de commit exacto siguiendo el formato de Conventional Commits:

- Nueva caracteristica:
  `git commit -m "feat: agrega endpoint para productos"`
- Correccion de errores:
  `git commit -m "fix: corrige validacion de productos"`
- Reorganizacion o limpieza de codigo:
  `git commit -m "refactor: separa logica de productos en servicios"`
- Pruebas automatizadas:
  `git commit -m "test: agrega pruebas para productos"`
- Documentacion:
  `git commit -m "docs: actualiza contrato de pedidos"`
- Mantenimiento o configuracion:
  `git commit -m "chore: ajusta variables de entorno"`

### Paso 6: Registro y Trazabilidad (Obligatorio)
Inmediatamente despues de realizar el commit:
1. Marcar con `[x]` la tarea correspondiente en `ROADMAP.md` indicando la fecha y hora de finalizacion.
2. Registrar una nueva entrada en `../docs/09-bitacora/bitacora-backend.md` con: Fecha y Hora, Fase/Modulo, Tarea Realizada, Commit y Responsable (Anthony).

---

## 3. Metodologia SDD (Spec-Driven Development)
- Todo endpoint debe coincidir estrictamente con su especificacion en `../docs/04-api/specs/<modulo>.spec.md`.
- Si no existe especificacion previa, redactarla en `../docs/04-api/specs/` antes de comenzar a programar.
- Verificar el estado y tareas en `ROADMAP.md`.
