package com.nexocommerce.movil

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import java.time.LocalDate

@Composable
internal fun AccountScreen(vm: ShopViewModel) {
    var register by rememberSaveable { mutableStateOf(false) }
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmation by remember { mutableStateOf("") }
    var terms by rememberSaveable { mutableStateOf(false) }
    var code by remember { mutableStateOf("") }
    LaunchedEffect(vm.user) { if (vm.user != null) { password = ""; confirmation = "" } }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        if (vm.user != null) {
            item { Text("Mi cuenta", style = MaterialTheme.typography.headlineMedium); Text("Hola, ${vm.user}") }
            if (!vm.verified) {
                item {
                    Text("Verifica tu correo", style = MaterialTheme.typography.titleMedium)
                    Text("Ingresa el código que enviamos a tu correo electrónico.")
                }
                item { Input(code, { code = it }, "Código de verificación", KeyboardType.Number) }
                item { Button({ vm.verify(code) }, enabled = !vm.busy && code.isNotBlank()) { Text("Verificar correo") } }
                item { TextButton(vm::resendCode, enabled = !vm.busy) { Text("Reenviar código") } }
            } else item { Text("Correo verificado", color = Rose) }
            item { OutlinedButton(vm::logout, enabled = !vm.busy) { Text("Cerrar sesión") } }
        } else {
            item {
                Text(if (register) "ÚNETE A NOSOTROS" else "BIENVENIDO DE NUEVO", color = Rose, style = MaterialTheme.typography.labelMedium)
                Spacer(Modifier.height(12.dp))
                Text(if (register) "Crear cuenta" else "Iniciar sesión", style = MaterialTheme.typography.headlineMedium)
                Text("Tus próximos momentos especiales comienzan aquí.")
            }
            if (register) item { Input(name, { name = it }, "Nombre completo") }
            item { Input(email, { email = it }, "Correo electrónico", KeyboardType.Email) }
            if (register) item { Input(phone, { phone = it }, "Teléfono", KeyboardType.Phone) }
            item {
                OutlinedTextField(password, { password = it }, Modifier.fillMaxWidth(), label = { Text("Contraseña") },
                    singleLine = true, visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password))
            }
            if (register) {
                item {
                    OutlinedTextField(confirmation, { confirmation = it }, Modifier.fillMaxWidth(), label = { Text("Confirmar contraseña") },
                        singleLine = true, visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        isError = confirmation.isNotBlank() && password != confirmation)
                }
                item {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(terms, { terms = it })
                        Text("Acepto los términos y condiciones (versión 1.0).", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            item {
                Button(onClick = {
                    if (register) vm.register(name, email, phone, password, confirmation) else vm.login(email, password)
                }, enabled = !vm.busy && email.contains("@") && password.isNotBlank() &&
                    (!register || (name.isNotBlank() && terms && password.length >= 8 && password == confirmation)),
                    modifier = Modifier.fillMaxWidth()) { Text(if (register) "Crear cuenta" else "Entrar") }
            }
            item {
                TextButton(onClick = { register = !register; password = ""; confirmation = "" }) {
                    Text(if (register) "¿Ya tienes cuenta? Inicia sesión" else "¿Eres nuevo? Crea tu cuenta")
                }
            }
        }
    }
}

@Composable
internal fun Input(value: String, change: (String) -> Unit, label: String, type: KeyboardType = KeyboardType.Text) {
    OutlinedTextField(value, change, Modifier.fillMaxWidth(), label = { Text(label) }, singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = type))
}

@Composable
internal fun SignInPrompt(account: () -> Unit) {
    Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Un detalle más…", style = MaterialTheme.typography.headlineSmall)
        Text("Inicia sesión para continuar tu compra y consultar tus pedidos.")
        Button(account) { Text("Iniciar sesión") }
    }
}

@Composable
internal fun CartScreen(vm: ShopViewModel, account: () -> Unit, checkout: () -> Unit) {
    if (vm.user == null) { SignInPrompt(account); return }
    val cartItems = vm.cart?.optJSONArray("items")?.objects().orEmpty()
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Text("Tu carrito", style = MaterialTheme.typography.headlineMedium)
            Text("Detalles que pronto serán recuerdos.")
            TextButton(vm::loadCart, enabled = !vm.busy) { Text("Actualizar carrito") }
        }
        if (cartItems.isEmpty()) item { Text(if (vm.busy) "Cargando…" else "Aún no has agregado productos.") }
        items(cartItems, key = { it.getInt("id") }) { item ->
            Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(item.getString("nombre"), fontWeight = FontWeight.SemiBold)
                    Text("Precio: ${money(item.opt("precio_unitario"))}")
                    item.optJSONObject("configuracion")?.let { config -> Text(config.optString("nombre"), style = MaterialTheme.typography.bodySmall) }
                    item.optJSONArray("avisos")?.let { notices ->
                        for (i in 0 until notices.length()) Text(notices.getString(i), color = MaterialTheme.colorScheme.error)
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            TextButton({ vm.quantity(item.getInt("id"), item.getInt("cantidad") - 1) }, enabled = !vm.busy) { Text("−") }
                            Text("${item.getInt("cantidad")}")
                            TextButton({ vm.quantity(item.getInt("id"), item.getInt("cantidad") + 1) }, enabled = !vm.busy) { Text("+") }
                        }
                        Text(money(item.opt("subtotal")), fontWeight = FontWeight.Bold)
                    }
                    TextButton({ vm.quantity(item.getInt("id"), 0) }, enabled = !vm.busy) { Text("Eliminar") }
                }
            }
        }
        if (cartItems.isNotEmpty()) item {
            HorizontalDivider()
            Spacer(Modifier.height(16.dp))
            Text("Resumen de compra", style = MaterialTheme.typography.titleLarge)
            Text("Total: ${money(vm.cart?.opt("total"))}", Modifier.padding(vertical = 12.dp), style = MaterialTheme.typography.headlineSmall, color = Rose)
            Button(onClick = { vm.clearConfirmation(); checkout() }, enabled = !vm.busy && cartItems.all { it.optBoolean("disponible", false) }, modifier = Modifier.fillMaxWidth()) {
                Text("Continuar con mi pedido")
            }
        }
    }
}

@Composable
internal fun CheckoutScreen(vm: ShopViewModel, orders: () -> Unit, back: () -> Unit) {
    var date by rememberSaveable { mutableStateOf("") }
    var delivery by rememberSaveable { mutableStateOf("RETIRO") }
    var address by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    val validDate = runCatching { !LocalDate.parse(date).isBefore(LocalDate.now()) }.getOrDefault(false)
    val created = vm.createdOrder
    LazyColumn(contentPadding = PaddingValues(24.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        if (created != null) {
            item {
                Text("¡Gracias por tu pedido!", style = MaterialTheme.typography.headlineMedium)
                Text("Pedido #${created.optInt("id")}", color = Rose, style = MaterialTheme.typography.titleLarge)
                Text("Tu pedido fue registrado. Está pendiente de pago y confirmación por la tienda.")
                Text("Entrega: ${created.optString("fecha_entrega")}")
                Text("Total: ${money(created.opt("total"))}")
            }
            item { Button(orders, modifier = Modifier.fillMaxWidth()) { Text("Ver mis pedidos") } }
        } else {
            item {
                TextButton(back, enabled = !vm.busy) { Text("← Volver al carrito") }
                Text("Finalizar pedido", style = MaterialTheme.typography.headlineMedium)
                Text("Coordina la entrega de tu próximo detalle.")
            }
            item { Text("Información de entrega", style = MaterialTheme.typography.titleLarge) }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(delivery == "RETIRO", { delivery = "RETIRO" }, { Text("Retiro en tienda") })
                    FilterChip(delivery == "DOMICILIO", { delivery = "DOMICILIO" }, { Text("A domicilio") })
                }
            }
            if (delivery == "DOMICILIO") item { Input(address, { address = it }, "Dirección de entrega") }
            item { Input(phone, { phone = it }, "Teléfono de contacto", KeyboardType.Phone) }
            item {
                Input(date, { date = it }, "Fecha de entrega (AAAA-MM-DD)")
                if (date.isNotBlank() && !validDate) Text("Ingresa una fecha válida desde hoy.", color = MaterialTheme.colorScheme.error)
            }
            item {
                HorizontalDivider()
                Text("Resumen", Modifier.padding(top = 16.dp), style = MaterialTheme.typography.titleLarge)
                vm.cart?.optJSONArray("items")?.objects()?.forEach { item ->
                    Text("${item.optString("nombre")} × ${item.optInt("cantidad")} · ${money(item.opt("subtotal"))}", Modifier.padding(vertical = 4.dp))
                }
                Text("Total: ${money(vm.cart?.opt("total"))}", Modifier.padding(vertical = 16.dp), style = MaterialTheme.typography.headlineSmall, color = Rose)
                Text("El pedido se crea pendiente de pago. La tienda debe verificar el pago antes de confirmarlo.", style = MaterialTheme.typography.bodySmall)
            }
            item {
                Button({ vm.checkout(date, delivery, address, phone) }, modifier = Modifier.fillMaxWidth(),
                    enabled = !vm.busy && validDate && (delivery != "DOMICILIO" || address.isNotBlank()) &&
                        (vm.cart?.optJSONArray("items")?.length() ?: 0) > 0) { Text("Confirmar pedido") }
            }
        }
    }
}

@Composable
internal fun OrdersScreen(vm: ShopViewModel, account: () -> Unit) {
    if (vm.user == null) { SignInPrompt(account); return }
    LazyColumn(contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Text("Mis pedidos", style = MaterialTheme.typography.headlineMedium)
            Text("Sigue cada paso de tu celebración.")
            TextButton(vm::loadOrders, enabled = !vm.busy) { Text("Actualizar") }
        }
        if (vm.orders.isEmpty()) item { Text(if (vm.busy) "Cargando…" else "Aún no hay pedidos para mostrar.") }
        items(vm.orders, key = { it.getInt("id") }) { order ->
            Card(onClick = { vm.showOrder(order.getInt("id")) }, enabled = !vm.busy, modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Pedido #${order.getInt("id")}", style = MaterialTheme.typography.titleMedium)
                    Text(order.optString("estado"), color = Rose, style = MaterialTheme.typography.labelLarge)
                    Text("Entrega: ${order.optString("fecha_entrega")}")
                    Text(money(order.opt("total")), fontWeight = FontWeight.Bold)
                    Text("Ver detalle →", color = Rose)
                }
            }
        }
    }
}
