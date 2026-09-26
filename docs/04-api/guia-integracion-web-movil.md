# Entrega de la API a Web y Movil

**Para:** Nathalia (React/Vite) y Emilio (Android/Kotlin). **Backend:** Anthony.  
**Estado:** integracion inicial directa por LAN; NGINX, PostgreSQL de Melanie y servidor de archivos de Emilio se conectaran en la Fase 12.

## Direccion y contrato

Anthony comunicara la IP de su computadora y confirmara que ambos clientes alcanzan `http://<IP_LAN_ANTHONY>:8001/api/v1/salud`. La URL base inicial es `http://<IP_LAN_ANTHONY>:8001/api/v1`; cuando Michael active NGINX, cambien solo esa URL de configuracion. Nunca usen `localhost` desde otra computadora o desde un dispositivo movil.

- Web: definir `VITE_API_URL=http://<IP_LAN_ANTHONY>:8001/api/v1` en el entorno local de Vite. Anthony debe añadir **el origen de Vite** (protocolo, IP y puerto, sin `/api/v1`) a `CORS_ALLOWED_ORIGINS` del backend.
- Movil: definir `API_URL=http://<IP_LAN_ANTHONY>:8001/api/v1` en la configuracion de desarrollo de Android y permitir HTTP sin cifrar para esta prueba LAN en su configuracion de red. CORS solo aplica al navegador; la app movil igualmente debe enviar el token. En el despliegue final se debera usar HTTPS.
- Contrato completo: [OpenAPI 1.1.0](openapi/openapi.yaml) y [especificaciones por modulo](README.md). Los nombres de campos JSON estan en español y coinciden con SQL.
- Usar `Accept: application/json`. Para rutas protegidas enviar `Authorization: Bearer <token>`. Para JSON enviar `Content-Type: application/json`; para archivos usar `multipart/form-data` generado por el cliente HTTP.

El token llega en `data.token` al registrar o iniciar sesion. Guardarlo de forma segura en el cliente y retirarlo al cerrar sesion. Ante `401`, pedir login nuevamente; no hay endpoint de renovacion. Los roles son `CLIENTE` y `ADMIN`. El backend decide permisos y precios: los clientes no deben enviar `precio_unitario` ni decidir el total del pedido.

## Flujo minimo que deben implementar

1. **Conectividad y catalogo:** `GET /salud`, `GET /tienda/configuracion`, `GET /categorias`, `GET /productos` y `GET /productos/{id}`. Consultar los IDs devueltos; el seeder no promete IDs fijos. La base de demostracion trae un DETALLE de `5.00`, una TORTA con diseño y una SUBLIMACION con plantilla.
2. **Sesion:** `POST /auth/login` con `{"correo":"...","password":"..."}`. Separar sesiones CLIENTE y ADMIN. El registro `POST /auth/registro` crea un CLIENTE nuevo y envia un codigo por correo; las cuentas de demostracion ya estan verificadas. OAuth solo admite `GOOGLE` y necesita credenciales Google reales.
3. **Carrito y pedido del CLIENTE:** `POST /carrito/items` con `{"producto_id":<id>,"cantidad":1}` para el DETALLE. `GET /carrito` devuelve `total`, disponibilidad y avisos. Enviar `POST /pedidos` con `{"fecha_entrega":"AAAA-MM-DD","total_esperado":"5.00"}` usando el total vigente como **texto decimal con dos posiciones**. Si responde `PED_PRECIO_CAMBIADO`, consultar de nuevo el carrito y pedir confirmacion al usuario antes de reintentar.
4. **Pago y notificaciones:** para TRANSFERENCIA, subir el comprobante con `POST /multimedia` (`archivo` + `destino=comprobantes`), tomar `data.id` y enviarlo como `multimedia_id` en `POST /pagos` junto con `pedido_id`, `metodo=TRANSFERENCIA` y `monto` en texto decimal. Para PASARELA se usa `referencia_pasarela`; actualmente **no hay cobro real ni aprobacion automatica**. Un ADMIN verifica en `PATCH /admin/pagos/{id}/verificar`; entonces el CLIENTE consulta `GET /notificaciones` y sus pedidos. Las notificaciones son un buzon consultable, sin push ni WebSocket.
5. **Imagenes y archivos:** las imagenes publicas tienen `url` utilizable directamente y se sirven desde `/multimedia/publico/{ruta}`. En comprobantes y personalizaciones `url` es `null`: usar `GET /multimedia/{id}/archivo` con Bearer. Web debe descargar los bytes con el token antes de crear una URL `Blob`; movil debe enviar el token en su cliente HTTP. Una imagen se puede subir como ADMIN y asociar por `multimedia_id` al producto correspondiente.

Las respuestas JSON usan `success`, `data`, `message` y, cuando corresponde, `meta`. Validaciones devuelven `422` con `errors`; reglas de negocio devuelven `400` con `codigo_error`; token ausente `401`, recurso ajeno `403` e inexistente `404`. La descarga de archivos devuelve bytes y encabezado `Content-Type`, no el envelope JSON. Revisen cada payload exacto en OpenAPI antes de implementar un formulario.

## Preparacion a cargo de Anthony

La configuracion de demostracion es **opcional** y se usa solo en una base PostgreSQL aislada `nexo_demo`. El seeder se niega a correr fuera de `APP_ENV=local/testing` o en una base cuyo nombre no termine en `_demo` o `_test`. No forma parte de `DatabaseSeeder` y no debe ejecutarse en Supabase ni en la base central de Melanie.

1. En `backend/.env` (sin compartirlo), configurar `APP_KEY`, `APP_ENV=local`, `APP_DEBUG=false`, `API_PUBLIC_ORIGIN=http://<IP_LAN_ANTHONY>:8001`, `CORS_ALLOWED_ORIGINS=http://<ORIGEN_EXACTO_DE_VITE>`, `DB_HOST=demo-db`, `DB_PORT=5432`, `DB_DATABASE=nexo_demo`, `DB_USERNAME=postgres`, un `DB_PASSWORD` propio y `DB_SSLMODE=disable`. Para probar registro sin SMTP externo se puede usar `MAIL_MAILER=log`; Anthony consultara el codigo de verificacion en sus logs. No entregar credenciales de PostgreSQL a web ni movil.
2. Iniciar desde `backend/` con `docker compose -f docker-compose.yml -f docker-compose.demo.yml up --build -d`. Migrar con `docker compose -f docker-compose.yml -f docker-compose.demo.yml exec backend-1 php artisan migrate --force`.
3. Preparar en el entorno de la terminal `INTEGRATION_ADMIN_EMAIL`, `INTEGRATION_ADMIN_PASSWORD`, `INTEGRATION_CLIENT_EMAIL` e `INTEGRATION_CLIENT_PASSWORD` (contraseñas de al menos ocho caracteres). Ejecutar `docker compose -f docker-compose.yml -f docker-compose.demo.yml exec -e INTEGRATION_ADMIN_EMAIL -e INTEGRATION_ADMIN_PASSWORD -e INTEGRATION_CLIENT_EMAIL -e INTEGRATION_CLIENT_PASSWORD backend-1 php artisan db:seed --class=IntegrationDemoSeeder --no-interaction`. Compartir con Nathalia y Emilio **solo** las credenciales de estas cuentas de demostracion, por un canal privado. El seeder es repetible y crea catalogo, stock y capacidad para los siguientes 30 dias.
4. Comprobar `/up` en puertos 8001 y 8002, y `/api/v1/salud` desde otra computadora. Un `curl` al origen equivocado no prueba CORS: verificar la solicitud `OPTIONS` del navegador desde el origen real de Vite. Si cambia la IP de Anthony, actualizar `API_PUBLIC_ORIGIN`, reiniciar Compose y avisar a los clientes.

Ambos contenedores comparten un volumen persistente de multimedia. Un archivo subido por 8001 debe poder leerse por 8002. No ejecutar `docker compose down -v` si se desean conservar los datos y archivos de demostracion. Este almacenamiento es temporal; la integracion con el servidor de Emilio sustituira el disco local.

## Pendiente para la integracion final

- Michael: publicar NGINX y repartir peticiones a `8001` y `8002`; entonces web y movil cambian su URL base al mismo origen NGINX.
- Melanie: ofrecer el PostgreSQL central y sus credenciales **solo** al backend; Anthony cambiara las variables de conexion en ambas instancias.
- Emilio: conectar el servidor de archivos persistente; las rutas de archivos publicos y privados deben seguir el contrato de multimedia.
- Equipo completo: probar desde web y movil a la vez, subida y lectura de un archivo desde instancias distintas, caida de una instancia y logs. La Fase 12 permanecera abierta hasta verificarlo en las computadoras reales.
