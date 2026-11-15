package com.nexocommerce.movil

import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class ApiClientTest {
    private lateinit var server: MockWebServer
    @Before fun start() { server = MockWebServer(); server.start() }
    @After fun stop() { server.shutdown() }

    @Test fun `login envia nombres de campos del backend y lee el envelope`() = runBlocking {
        server.enqueue(MockResponse().setBody("""{"success":true,"data":{"token":"test-token"}}"""))
        val api = ApiClient(server.url("/api/v1/").toString())
        val response = api.request("auth/login", "POST", JSONObject()
            .put("correo", "cliente@example.com").put("password", "prueba123"))
        val request = server.takeRequest()
        assertEquals("/api/v1/auth/login", request.path)
        assertEquals("application/json", request.getHeader("Accept"))
        assertEquals("cliente@example.com", JSONObject(request.body.readUtf8()).getString("correo"))
        assertEquals("test-token", response.getJSONObject("data").getString("token"))
    }

    @Test fun `un 401 invalida sesion y transmite el error`() = runBlocking {
        server.enqueue(MockResponse().setResponseCode(401).setBody("""{"success":false,"message":"No autenticado."}"""))
        var expired = false
        val api = ApiClient(server.url("/api/v1").toString(), { "token" }, { expired = true })
        try { api.request("carrito"); fail("Debía fallar") }
        catch (e: ApiException) { assertEquals(401, e.status) }
        assertTrue(expired)
        assertEquals("Bearer token", server.takeRequest().getHeader("Authorization"))
    }

    @Test fun `validacion conserva los mensajes de campo`() = runBlocking {
        server.enqueue(MockResponse().setResponseCode(422).setBody("""{"success":false,"message":"Datos inválidos","errors":{"cantidad":["Cantidad mínima 1"]}}"""))
        try { ApiClient(server.url("/api/v1/").toString()).request("carrito/items", "POST"); fail("Debía fallar") }
        catch (e: ApiException) { assertTrue(e.message.orEmpty().contains("Cantidad mínima 1")) }
    }

    @Test fun `detalle extrae plantillas e imagenes del Resource real`() {
        val product = Product.from(JSONObject("""{
            "id":9,"nombre":"Taza","descripcion":null,"tipo":"SUBLIMACION","precio_base":5.5,
            "imagenes":[{"url":"https://example.com/taza.jpg"}],
            "sublimacion":{"plantillas":[{"id":7,"nombre":"Flores","costo_adicional":2,"activo":true}]}
        }"""))
        assertEquals("", product.description)
        assertEquals("https://example.com/taza.jpg", product.image)
        assertEquals(7, product.options.single().id)
    }

    @Test fun `checkout conserva el codigo de cambio de precio sin reintentar`() = runBlocking {
        server.enqueue(MockResponse().setResponseCode(400).setBody("""{"success":false,"message":"El precio cambió","codigo_error":"PED_PRECIO_CAMBIADO"}"""))
        val api = ApiClient(server.url("/api/v1/").toString(), { "token" })
        try {
            api.request("pedidos", "POST", JSONObject().put("fecha_entrega", "2026-12-01").put("total_esperado", "5.00"))
            fail("Debía exigir reconfirmación")
        } catch (e: ApiException) {
            assertEquals("PED_PRECIO_CAMBIADO", e.code)
        }
        val body = JSONObject(server.takeRequest().body.readUtf8())
        assertTrue(body.get("total_esperado") is String)
        assertEquals("5.00", body.getString("total_esperado"))
        assertEquals(1, server.requestCount)
    }

    @Test fun `detalle muestra atributos reales y excluye disenos inactivos`() {
        val product = Product.from(JSONObject("""{
            "id":10,"nombre":"Torta","tipo":"TORTA","precio_base":20,"imagenes":[],
            "torta":{"sabor":"Vainilla","tamano":"Mediana","porciones":12,"disenos":[
                {"id":1,"nombre":"Rosas","costo_adicional":0,"activo":true},
                {"id":2,"nombre":"Retirado","costo_adicional":5,"activo":false}]}
        }"""))
        assertEquals("Vainilla · Mediana · 12 porciones", product.characteristics)
        assertEquals(listOf(1), product.options.map { it.id })
        assertNull(product.image)
    }
}
