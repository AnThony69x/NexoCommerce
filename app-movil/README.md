# Dulces Aesca · Android

Cliente nativo Kotlin, Jetpack Compose y Material 3, basado en el frontend de NexoCommerce. Consume la API Laravel con Sanctum.

## Referencia del frontend

Se adaptó el flujo de CLIENTE de `origin/frontend-web/feat`, commit `b41cfed`: marca Dulces Aesca, portada «Momentos dulces», categorías, ilustraciones SVG originales, paleta stone/rose, tarjetas, personalización, carrito, registro y checkout. La carpeta `frontend-web` de la rama de trabajo solo contiene la pantalla inicial. No se cambió de rama ni se modificó la web.

Las pantallas se implementan en Compose para Android. Los productos, usuarios, precios y pedidos provienen de la API; los mocks de React no se copiaron. Las ilustraciones editoriales de portada y categorías se incluyen en `app/src/main/assets/web`; se usan también como alternativa cuando un producto no tiene imagen.

## Ejecutar

1. Abrir `app-movil` en Android Studio.
2. En Settings > Build, Execution, Deployment > Build Tools > Gradle, seleccionar **Distribution: Wrapper** y **Gradle JDK: 21** (también se admite 17).
3. Instalar SDK Platform 35 y Build Tools 35.0.0 desde SDK Manager.
4. En `local.properties`, conservar `sdk.dir` y definir:

```properties
API_URL=http://<IP_LAN_ANTHONY>:8001/api/v1/
```

5. Sincronizar Gradle y ejecutar la configuración `app` en un emulador o teléfono.

Para un teléfono físico, usar la IP LAN real y conectarlo a la misma red del backend. `10.0.2.2` solo sirve para un emulador cuyo backend está en esta computadora. Verificar desde el teléfono `http://<IP>:8001/api/v1/salud`.

HTTP por LAN se permite únicamente en debug. Release necesita HTTPS y firma de distribución. Cuando se active NGINX, cambiar solo API_URL. No incluir credenciales de PostgreSQL.

```powershell
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest
```

También se admite `-PAPI_URL=https://dominio/api/v1/`.

## Flujos disponibles

- Inicio con portada, categorías, productos del catálogo y bloques de personalización/beneficios.
- Catálogo con búsqueda, filtro TORTA/DETALLE/SUBLIMACION, orden por precio o fecha y paginación.
- Detalle con imagen, características reales, diseños o plantillas, cantidad e instrucciones.
- Login y registro CLIENTE, aceptación de términos versión 1.0 y verificación de correo con reenvío.
- Carrito con cantidades, eliminación, disponibilidad y avisos del servidor.
- Checkout para retiro o domicilio, fecha y teléfono. Envía `total_esperado` como texto decimal de dos posiciones. Si cambia el precio, actualiza el carrito y requiere pulsar Confirmar nuevamente. No reintenta automáticamente.
- Confirmación del pedido y consulta de pedidos y sus detalles. El pedido queda pendiente de pago.

La sesión vive solo en memoria y sobrevive rotaciones mediante ViewModel. Se vuelve a iniciar sesión al terminar el proceso. No se guardan contraseñas ni tokens en archivos. Un 401 retira la sesión; la API no ofrece renovación.

## Alcance

Esta adaptación cubre el cliente Android. El panel administrativo de la web sigue siendo web. No incluye todavía carga de diseños propios, pagos/comprobantes, notificaciones ni edición del perfil; la lista de pedidos muestra la primera página. No hay cobros ni confirmaciones de pago simuladas.

Las opciones de sabor/tamaño de la web son mocks: en Android se muestran los atributos reales del producto y se eligen los diseños publicados por el backend. Los precios se calculan en el servidor. No se crean productos ni se usa la base de datos directamente.

## Código

- `MainActivity.kt`: tema, navegación, inicio, catálogo y detalle de producto.
- `StoreScreens.kt`: cuenta, registro, carrito, checkout y pedidos.
- `ShopViewModel.kt`: sesión, estado y operaciones.
- `ApiClient.kt`: HTTP, envelope JSON, errores y modelos de catálogo.
- `app/src/test/`: pruebas HTTP con MockWebServer y lectura de Resources.

Contrato de integración: [guía web/móvil](../docs/04-api/guia-integracion-web-movil.md). Para probar el flujo completo hacen falta el backend accesible y una cuenta CLIENTE, o registrar una y verificar su correo.
