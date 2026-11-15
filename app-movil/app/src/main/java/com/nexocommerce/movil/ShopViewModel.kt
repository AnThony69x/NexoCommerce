package com.nexocommerce.movil

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.IOException
import java.net.URLEncoder

class ShopViewModel : ViewModel() {
    // El token vive solo en memoria: nunca se escribe sin cifrar en disco.
    @Volatile private var token: String? = null
    private val api = ApiClient(token = { token }, onUnauthorized = { token = null })
    var user by mutableStateOf<String?>(null); private set
    var busy by mutableStateOf(false); private set
    var message by mutableStateOf<String?>(null); private set
    var products by mutableStateOf(emptyList<Product>()); private set
    var selected by mutableStateOf<Product?>(null); private set
    var cart by mutableStateOf<JSONObject?>(null); private set
    var orders by mutableStateOf(emptyList<JSONObject>()); private set
    var page by mutableStateOf(1); private set
    var pages by mutableStateOf(1); private set
    var type by mutableStateOf(""); private set
    var sort by mutableStateOf("recientes"); private set
    var verified by mutableStateOf(true); private set
    var createdOrder by mutableStateOf<JSONObject?>(null); private set
    var orderDetail by mutableStateOf<JSONObject?>(null); private set
    private var search = ""

    init { catalog() }

    private fun action(block: suspend () -> Unit) {
        if (busy) return
        busy = true
        message = null
        viewModelScope.launch {
            try { block() }
            catch (e: CancellationException) { throw e }
            catch (e: ApiException) {
                if (e.status == 401) {
                    user = null; cart = null; orders = emptyList(); createdOrder = null; orderDetail = null
                }
                message = e.message
            }
            catch (e: IOException) { message = "No pudimos conectarnos con la tienda. Comprueba tu conexión y vuelve a intentarlo." }
            catch (e: org.json.JSONException) { message = "No pudimos cargar esta información. Inténtalo de nuevo más tarde." }
            finally { busy = false }
        }
    }

    fun catalog(query: String = search, requestedPage: Int = 1,
        productType: String = type, order: String = sort) = action {
        val typeQuery = if (productType.isBlank()) "" else "&tipo=$productType"
        val result = api.request("productos?buscar=${URLEncoder.encode(query, "UTF-8")}&page=$requestedPage&ordenar=$order$typeQuery")
        products = result.getJSONArray("data").objects().map(Product::from)
        page = result.getJSONObject("meta").getInt("pagina_actual")
        pages = result.getJSONObject("meta").getInt("total_paginas")
        search = query
        type = productType
        sort = order
    }

    fun detail(product: Product) = action {
        selected = Product.from(api.request("productos/${product.id}").getJSONObject("data"))
    }
    fun closeDetail() { selected = null }
    fun dismissMessage() { message = null }

    fun login(email: String, password: String) = action {
        val data = api.request("auth/login", "POST", JSONObject()
            .put("correo", email.trim()).put("password", password).put("device_name", "NexoCommerce Android"))
            .getJSONObject("data")
        if (data.getJSONObject("usuario").getString("rol") != "CLIENTE") {
            token = data.getString("token")
            try { api.request("auth/logout", "POST") } finally { token = null }
            message = "Esta aplicación está destinada a cuentas CLIENTE."
        } else {
            token = data.getString("token")
            user = data.getJSONObject("usuario").getString("nombre_completo")
            verified = data.getJSONObject("usuario").optBoolean("correo_verificado")
            message = "Sesión iniciada."
        }
    }

    fun logout() = action {
        api.request("auth/logout", "POST")
        token = null; user = null; cart = null; orders = emptyList(); createdOrder = null; orderDetail = null
    }

    fun add(product: Product, design: Design?, quantity: Int = 1, comment: String = "") {
        if (user == null) { message = "Inicia sesión desde Cuenta para agregar productos."; return }
        action {
            val body = JSONObject().put("producto_id", product.id).put("cantidad", quantity)
            if (comment.isNotBlank()) body.put("comentario", comment.trim())
            design?.let { body.put(if (product.type == "TORTA") "diseno_torta_id" else "plantilla_diseno_id", it.id) }
            cart = api.request("carrito/items", "POST", body).getJSONObject("data")
            selected = null
            message = "Producto agregado al carrito."
        }
    }
    fun loadCart() = action { cart = api.request("carrito").getJSONObject("data") }
    fun quantity(id: Int, quantity: Int) = action {
        cart = if (quantity < 1) api.request("carrito/items/$id", "DELETE").getJSONObject("data")
        else api.request("carrito/items/$id", "PUT", JSONObject().put("cantidad", quantity)).getJSONObject("data")
    }
    fun loadOrders() = action { orders = api.request("pedidos").getJSONArray("data").objects() }

    fun register(name: String, email: String, phone: String, password: String, confirmation: String) = action {
        val data = api.request("auth/registro", "POST", JSONObject()
            .put("nombre_completo", name.trim()).put("correo", email.trim()).put("telefono", phone.trim())
            .put("password", password).put("password_confirmation", confirmation)
            .put("terminos_aceptados", true).put("version_terminos", "1.0")).getJSONObject("data")
        token = data.getString("token")
        user = data.getJSONObject("usuario").getString("nombre_completo")
        verified = data.getJSONObject("usuario").optBoolean("correo_verificado")
        message = "Cuenta creada. Revisa tu correo para verificarla."
    }

    fun verify(code: String) = action {
        api.request("auth/verificar-correo", "POST", JSONObject().put("codigo", code.trim()))
        verified = true
        message = "Correo verificado."
    }
    fun resendCode() = action {
        api.request("auth/reenviar-verificacion", "POST")
        message = "Código enviado a tu correo."
    }

    fun checkout(date: String, delivery: String, address: String, phone: String) = action {
        val total = cart?.get("total")?.toString()?.toBigDecimalOrNull()
            ?: throw IOException("Actualiza el carrito antes de continuar.")
        val body = JSONObject().put("fecha_entrega", date)
            .put("total_esperado", total.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString())
            .put("tipo_entrega", delivery)
        if (delivery == "DOMICILIO") body.put("direccion_entrega", address.trim())
        if (phone.isNotBlank()) body.put("telefono_contacto", phone.trim())
        try {
            createdOrder = api.request("pedidos", "POST", body).getJSONObject("data")
            cart = null
        } catch (e: ApiException) {
            if (e.code == "PED_PRECIO_CAMBIADO") {
                cart = api.request("carrito").getJSONObject("data")
                message = "El precio cambió. Revisa el total actualizado y confirma de nuevo para crear el pedido."
            } else throw e
        }
    }
    fun clearConfirmation() { createdOrder = null }
    fun showOrder(id: Int) = action { orderDetail = api.request("pedidos/$id").getJSONObject("data") }
    fun closeOrder() { orderDetail = null }
}
