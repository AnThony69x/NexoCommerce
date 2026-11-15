package com.nexocommerce.movil

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import coil.request.ImageRequest
import java.math.BigDecimal
import java.text.NumberFormat
import java.util.Locale

internal val Rose = Color(0xFFBE123C)
internal val Stone = Color(0xFF292524)
internal val Cream = Color(0xFFFAFAF9)
internal val Sage = Color(0xFFDFE8DC)
internal fun money(value: Any?): String = NumberFormat.getCurrencyInstance(Locale.US)
    .format(value?.toString()?.toBigDecimalOrNull() ?: BigDecimal.ZERO)
internal val categories = listOf(
    Triple("TORTA", "Repostería", "category-bakery-placeholder.svg"),
    Triple("DETALLE", "Detalles personalizados", "category-details-placeholder.svg"),
    Triple("SUBLIMACION", "Sublimación", "category-sublimation-placeholder.svg"))

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = lightColorScheme(primary = Rose, secondary = Stone,
                background = Cream, surface = Color.White, onSurface = Stone,
                primaryContainer = Color(0xFFFFE4E6), secondaryContainer = Sage),
                shapes = Shapes(medium = RoundedCornerShape(16.dp), large = RoundedCornerShape(24.dp))) { StoreApp() }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StoreApp(vm: ShopViewModel = viewModel()) {
    var route by rememberSaveable { mutableStateOf("Inicio") }
    val navigate: (String) -> Unit = { next ->
        route = next
        when {
            next == "Carrito" && vm.user != null -> vm.loadCart()
            next == "Pedidos" && vm.user != null -> vm.loadOrders()
            next == "Catálogo" -> vm.catalog()
        }
    }
    val browse: (String) -> Unit = { type -> route = "Catálogo"; vm.catalog(query = "", productType = type) }
    BackHandler(enabled = vm.selected != null || vm.orderDetail != null || route != "Inicio") {
        when {
            vm.selected != null -> vm.closeDetail()
            vm.orderDetail != null -> vm.closeOrder()
            route == "Checkout" -> navigate("Carrito")
            else -> route = "Inicio"
        }
    }
    Scaffold(containerColor = Cream, topBar = {
        TopAppBar(title = {
            Column {
                Text("Dulces Aesca", fontWeight = FontWeight.SemiBold)
                Text("HECHO ESPECIALMENTE PARA TI", style = MaterialTheme.typography.labelSmall, color = Rose)
            }
        }, actions = {
            IconButton(onClick = { navigate("Cuenta") }, enabled = !vm.busy) { Icon(Icons.Default.Person, "Mi cuenta") }
            IconButton(onClick = { navigate("Carrito") }, enabled = !vm.busy) { Icon(Icons.Default.ShoppingCart, "Mi carrito") }
        }, colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White))
    }, bottomBar = {
        NavigationBar(containerColor = Color.White) {
            listOf("Inicio", "Catálogo", "Carrito", "Pedidos", "Cuenta").forEach { title ->
                val icon = when (title) {
                    "Inicio" -> Icons.Default.Home
                    "Catálogo" -> Icons.Default.Search
                    "Carrito" -> Icons.Default.ShoppingCart
                    "Pedidos" -> Icons.Default.List
                    else -> Icons.Default.Person
                }
                NavigationBarItem(selected = route == title || (route == "Checkout" && title == "Carrito"),
                    enabled = !vm.busy, onClick = { navigate(title) },
                    icon = { Icon(icon, title) }, label = { Text(title, maxLines = 1) })
            }
        }
    }) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            if (vm.busy) LinearProgressIndicator(Modifier.fillMaxWidth())
            vm.message?.let { message ->
                Surface(color = MaterialTheme.colorScheme.primaryContainer) {
                    Row(Modifier.fillMaxWidth().padding(start = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(message, Modifier.weight(1f).padding(vertical = 10.dp), style = MaterialTheme.typography.bodySmall)
                        IconButton(onClick = vm::dismissMessage) { Icon(Icons.Default.Close, "Cerrar aviso") }
                    }
                }
            }
            when (route) {
                "Inicio" -> HomeScreen(vm, browse)
                "Catálogo" -> CatalogScreen(vm, browse)
                "Carrito" -> CartScreen(vm, { navigate("Cuenta") }, { route = "Checkout" })
                "Checkout" -> CheckoutScreen(vm, { navigate("Pedidos") }, { navigate("Carrito") })
                "Cuenta" -> AccountScreen(vm)
                "Pedidos" -> OrdersScreen(vm, { navigate("Cuenta") })
            }
        }
    }
    vm.selected?.let { product -> ProductDialog(vm, product, { navigate("Cuenta") }) }
    vm.orderDetail?.let { order ->
        AlertDialog(onDismissRequest = vm::closeOrder, title = { Text("Pedido #${order.optInt("id")}") },
            text = {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    item {
                        Text(order.optString("estado"), color = Rose)
                        Text("Entrega: ${order.optString("fecha_entrega")}")
                        Text("Total: ${money(order.opt("total"))}")
                    }
                    items(order.optJSONArray("items")?.objects().orEmpty()) { item ->
                        Text("${item.optString("nombre_producto")} × ${item.optInt("cantidad")}")
                    }
                }
            }, confirmButton = { TextButton(onClick = vm::closeOrder) { Text("Cerrar") } })
    }
}

@Composable
internal fun WebArt(asset: String, label: String, modifier: Modifier = Modifier) {
    AsyncImage(ImageRequest.Builder(LocalContext.current).data("file:///android_asset/web/$asset")
        .decoderFactory(SvgDecoder.Factory()).build(), label, modifier, contentScale = ContentScale.Crop)
}

@Composable
private fun HomeScreen(vm: ShopViewModel, browse: (String) -> Unit) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(24.dp), contentPadding = PaddingValues(bottom = 24.dp)) {
        item {
            Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                Text("CELEBRAMOS TUS MOMENTOS", color = Rose, style = MaterialTheme.typography.labelMedium)
                Text("Momentos dulces,\nhechos especialmente\npara ti.", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.SemiBold)
                Text("Repostería artesanal, regalos personalizados y detalles pensados para celebrar con intención.", color = Color(0xFF57534E))
                Button(onClick = { browse("") }) { Text("Explorar catálogo"); Icon(Icons.Default.ArrowForward, null, Modifier.padding(start = 8.dp)) }
                WebArt("hero-placeholder.svg", "Ilustración de repostería de Dulces Aesca", Modifier.fillMaxWidth().height(220.dp).clip(RoundedCornerShape(20.dp)))
            }
        }
        item { SectionTitle("Elige cómo quieres celebrar") }
        items(categories) { (type, name, asset) ->
            Card(onClick = { browse(type) }, enabled = !vm.busy, modifier = Modifier.padding(horizontal = 20.dp).fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    WebArt(asset, name, Modifier.size(108.dp))
                    Column(Modifier.padding(16.dp).weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(name, fontWeight = FontWeight.SemiBold)
                        Text(when(type) { "TORTA" -> "Creaciones para compartir."; "DETALLE" -> "Regalos pensados para ti."; else -> "Objetos únicos con tus ideas." }, style = MaterialTheme.typography.bodySmall)
                        Text("Explorar →", color = Rose, style = MaterialTheme.typography.labelLarge)
                    }
                }
            }
        }
        item { SectionTitle("Creaciones para celebrar") }
        if (vm.products.isEmpty()) item {
            Column(Modifier.padding(horizontal = 20.dp)) {
                Text(if (vm.busy) "Cargando productos…" else "El catálogo no está disponible. Puedes volver a intentarlo.")
                TextButton(onClick = { vm.catalog(query = "", productType = "") }, enabled = !vm.busy) { Text("Actualizar catálogo") }
            }
        }
        items(vm.products.take(4), key = { "home-${it.id}" }) { ProductCard(it, vm.busy, vm::detail) }
        item {
            Column(Modifier.fillMaxWidth().background(Color(0xFFF4EADC)).padding(24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("HECHO PARA TI", color = Rose, style = MaterialTheme.typography.labelMedium)
                Text("Personaliza cada pieza para contar tu historia.", style = MaterialTheme.typography.headlineSmall)
                Text("Elige un diseño para tus tortas y sublimaciones y encuentra el regalo para tu próxima celebración.")
                Button(onClick = { browse("SUBLIMACION") }) { Text("Ver opciones de personalización") }
            }
        }
        item {
            Column(Modifier.fillMaxWidth().background(Sage).padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                listOf("Productos personalizados" to "Diseños para hacer especial cada ocasión.",
                    "Atención cercana" to "Te acompañamos para elegir el detalle ideal.",
                    "Calidad en cada detalle" to "Cuidado y dedicación en cada creación.",
                    "Entregas planificadas" to "Coordina la fecha de tu celebración.").forEach { (title, text) ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Icon(Icons.Default.CheckCircle, null, tint = Stone)
                        Column { Text(title, fontWeight = FontWeight.SemiBold); Text(text, style = MaterialTheme.typography.bodySmall) }
                    }
                }
            }
        }
        item {
            Column(Modifier.fillMaxWidth().background(Stone).padding(24.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Dulces Aesca", color = Color.White, style = MaterialTheme.typography.titleLarge)
                Text("Detalles dulces y personalizados para celebrar los momentos que importan.", color = Color(0xFFD6D3D1))
                Text("© 2026 Dulces Aesca", color = Color(0xFFA8A29E), style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
internal fun SectionTitle(title: String) { Text(title, Modifier.padding(horizontal = 20.dp), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.SemiBold) }

@Composable
private fun CatalogScreen(vm: ShopViewModel, browse: (String) -> Unit) {
    var search by rememberSaveable { mutableStateOf("") }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Spacer(Modifier.height(4.dp))
        SectionTitle(categories.find { it.first == vm.type }?.second ?: "Nuestro catálogo")
        Row(Modifier.padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(search, { search = it }, Modifier.weight(1f), label = { Text("Buscar productos") }, singleLine = true, shape = RoundedCornerShape(28.dp))
            IconButton(onClick = { vm.catalog(search) }, enabled = !vm.busy) { Icon(Icons.Default.Search, "Buscar") }
        }
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(vm.type == "", { browse("") }, { Text("Todos") }, enabled = !vm.busy)
            categories.forEach { (type, name, _) -> FilterChip(vm.type == type, { browse(type) }, { Text(name) }, enabled = !vm.busy) }
        }
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("recientes" to "Recientes", "precio_asc" to "Menor precio", "precio_desc" to "Mayor precio").forEach { (sort, name) ->
                FilterChip(vm.sort == sort, { vm.catalog(order = sort) }, { Text(name) }, enabled = !vm.busy)
            }
        }
        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp), contentPadding = PaddingValues(bottom = 20.dp)) {
            if (vm.products.isEmpty()) item { Text(if (vm.busy) "Cargando…" else "No encontramos productos.", Modifier.padding(20.dp)) }
            items(vm.products, key = { it.id }) { ProductCard(it, vm.busy, vm::detail) }
            item {
                Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    TextButton({ vm.catalog(requestedPage = vm.page - 1) }, enabled = !vm.busy && vm.page > 1) { Text("Anterior") }
                    Text("${vm.page} / ${vm.pages.coerceAtLeast(1)}")
                    TextButton({ vm.catalog(requestedPage = vm.page + 1) }, enabled = !vm.busy && vm.page < vm.pages) { Text("Siguiente") }
                }
            }
        }
    }
}

@Composable
private fun ProductCard(product: Product, busy: Boolean, detail: (Product) -> Unit) {
    Card(onClick = { detail(product) }, enabled = !busy, modifier = Modifier.padding(horizontal = 20.dp).fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White)) {
        if (product.image != null) AsyncImage(product.image, product.name, Modifier.fillMaxWidth().height(180.dp), contentScale = ContentScale.Crop)
        else WebArt(categories.find { it.first == product.type }?.third ?: "hero-placeholder.svg", "Ilustración de categoría", Modifier.fillMaxWidth().height(150.dp))
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(categories.find { it.first == product.type }?.second.orEmpty(), color = Rose, style = MaterialTheme.typography.labelMedium)
            Text(product.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            if (product.description.isNotBlank()) Text(product.description, maxLines = 2, style = MaterialTheme.typography.bodySmall)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(money(product.price), fontWeight = FontWeight.Bold)
                Text("Ver producto →", color = Rose, style = MaterialTheme.typography.labelLarge)
            }
        }
    }
}

@Composable
private fun ProductDialog(vm: ShopViewModel, product: Product, account: () -> Unit) {
    var designId by remember(product.id) { mutableStateOf<Int?>(null) }
    var quantity by remember(product.id) { mutableStateOf(1) }
    var comment by remember(product.id) { mutableStateOf("") }
    val design = product.options.find { it.id == designId }
    AlertDialog(onDismissRequest = vm::closeDetail, title = { Text(product.name) }, text = {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                product.image?.let { AsyncImage(it, product.name, Modifier.fillMaxWidth().height(180.dp)) }
                Text(product.description)
                if (product.characteristics.isNotBlank()) Text(product.characteristics)
                Text("Desde ${money(product.price)}", color = Rose, fontWeight = FontWeight.Bold)
            }
            if (product.type != "DETALLE") item { Text("Elige tu diseño", fontWeight = FontWeight.SemiBold) }
            items(product.options) { option ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(designId == option.id, { designId = option.id })
                    Text("${option.name} (+ ${money(option.extra)})")
                }
            }
            if (product.type != "DETALLE" && product.options.isEmpty()) item { Text("Aún no hay diseños disponibles.") }
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Cantidad")
                    TextButton({ quantity-- }, enabled = quantity > 1 && !vm.busy) { Text("−") }
                    Text("$quantity")
                    TextButton({ quantity++ }, enabled = quantity < 999 && !vm.busy) { Text("+") }
                }
                OutlinedTextField(comment, { comment = it }, label = { Text("Instrucciones adicionales") }, modifier = Modifier.fillMaxWidth())
            }
            item { Text("El total definitivo se confirma en el carrito.", style = MaterialTheme.typography.bodySmall) }
        }
    }, confirmButton = {
        Button(onClick = { if (vm.user == null) { vm.closeDetail(); account() } else vm.add(product, design, quantity, comment) },
            enabled = !vm.busy && (product.type == "DETALLE" || design != null)) { Text(if (vm.user == null) "Iniciar sesión" else "Agregar al carrito") }
    }, dismissButton = { TextButton(onClick = vm::closeDetail) { Text("Volver") } })
}
