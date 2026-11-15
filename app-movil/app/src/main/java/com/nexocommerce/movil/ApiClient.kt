package com.nexocommerce.movil

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.MediaType.Companion.toMediaType
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

class ApiException(val status: Int, val code: String, message: String) : IOException(message)

class ApiClient(
    private val baseUrl: String = BuildConfig.API_URL,
    private val token: () -> String? = { null },
    private val onUnauthorized: () -> Unit = {},
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS)
        .followRedirects(false).followSslRedirects(false).build(),
) {
    suspend fun request(path: String, method: String = "GET", body: JSONObject? = null): JSONObject =
        withContext(Dispatchers.IO) {
            val builder = Request.Builder().url(baseUrl.trimEnd('/') + "/" + path)
                .header("Accept", "application/json")
            token()?.let { builder.header("Authorization", "Bearer $it") }
            val payload = if (method in listOf("POST", "PUT", "PATCH"))
                (body ?: JSONObject()).toString().toRequestBody("application/json; charset=utf-8".toMediaType())
            else null
            client.newCall(builder.method(method, payload).build()).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                val json = runCatching { JSONObject(raw) }.getOrNull()
                if (response.code == 401) onUnauthorized()
                if (!response.isSuccessful || json?.optBoolean("success", false) == false) {
                    val errors = json?.optJSONObject("errors")
                    val detail = errors?.keys()?.asSequence()?.flatMap { key ->
                        errors.optJSONArray(key)?.let { values ->
                            (0 until values.length()).map { values.optString(it) }.asSequence()
                        } ?: emptySequence()
                    }?.joinToString("\n").orEmpty()
                    throw ApiException(response.code, json?.optString("codigo_error").orEmpty(),
                        listOf(json?.optString("message").orEmpty().ifBlank { "Error HTTP ${response.code}" }, detail)
                            .filter { it.isNotBlank() }.joinToString("\n"))
                }
                json ?: throw IOException("El servidor no devolvió JSON. Revisa la URL de la API.")
            }
        }
}

fun JSONArray.objects(): List<JSONObject> = (0 until length()).map { getJSONObject(it) }

data class Product(val id: Int, val name: String, val description: String, val type: String,
    val price: String, val image: String?, val options: List<Design> = emptyList(),
    val characteristics: String = "") {
    companion object {
        fun from(json: JSONObject): Product {
            val options = json.optJSONObject("torta")?.optJSONArray("disenos")
                ?: json.optJSONObject("sublimacion")?.optJSONArray("plantillas")
            val image = json.optJSONObject("imagen_principal")
                ?: json.optJSONArray("imagenes")?.optJSONObject(0)
            return Product(json.getInt("id"), json.getString("nombre"),
                if (json.isNull("descripcion")) "" else json.optString("descripcion"),
                json.getString("tipo"), json.get("precio_base").toString(),
                image?.takeUnless { it.isNull("url") }?.optString("url"),
                options?.objects()?.filter { it.optBoolean("activo", true) }?.map {
                    Design(it.getInt("id"), it.getString("nombre"), it.optString("costo_adicional", "0"))
                }.orEmpty(),
                json.optJSONObject("torta")?.let {
                    "${it.optString("sabor")} · ${it.optString("tamano")} · ${it.optInt("porciones")} porciones"
                } ?: json.optJSONObject("sublimacion")?.optString("tipo_material").orEmpty())
        }
    }
}
data class Design(val id: Int, val name: String, val extra: String)
