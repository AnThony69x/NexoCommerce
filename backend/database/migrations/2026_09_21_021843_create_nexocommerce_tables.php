<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 50)->unique();
        });

        Schema::create('usuarios', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('rol_id');
            $table->string('nombre_completo', 150);
            $table->string('correo', 150)->unique();
            $table->string('telefono', 20)->nullable();
            $table->string('password_hash', 255)->nullable();
            $table->boolean('correo_verificado')->default(false);
            $table->integer('intentos_fallidos')->default(0);
            $table->timestamp('bloqueado_hasta')->nullable();
            $table->boolean('terminos_aceptados')->default(false);
            $table->string('version_terminos', 20)->nullable();
            $table->timestamp('terminos_aceptados_en')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('rol_id')->references('id')->on('roles');
            $table->index('rol_id', 'idx_usuarios_rol');
        });

        Schema::create('cuentas_oauth', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('usuario_id');
            $table->string('proveedor', 50);
            $table->string('id_proveedor', 255);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('usuarios')->cascadeOnDelete();
            $table->unique(['proveedor', 'id_proveedor'], 'uq_cuenta_oauth_proveedor');
        });

        Schema::create('verificaciones_correo', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('usuario_id');
            $table->string('codigo', 100);
            $table->timestamp('expira_en');
            $table->timestamp('usado_en')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('usuarios')->cascadeOnDelete();
        });

        Schema::create('multimedia', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre_archivo', 255);
            $table->string('ruta_archivo', 500);
            $table->string('tipo_mime', 100);
            $table->bigInteger('tamano_bytes');
            $table->integer('ancho')->nullable();
            $table->integer('alto')->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedInteger('subido_por_id')->nullable();
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('subido_por_id')->references('id')->on('usuarios')->nullOnDelete();
            $table->index('subido_por_id', 'idx_multimedia_subido_por');
        });

        Schema::create('configuracion_tienda', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre_tienda', 150);
            $table->string('logo_url', 500)->nullable();
            $table->string('favicon_url', 500)->nullable();
            $table->string('color_primario', 20);
            $table->string('color_secundario', 20);
            $table->string('color_acento', 20)->nullable();
            $table->string('color_fondo', 20)->nullable();
            $table->string('color_texto', 20)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('correo', 150)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();
        });

        Schema::create('categorias', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('categoria_padre_id')->nullable();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('imagen_id')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('categoria_padre_id')->references('id')->on('categorias')->nullOnDelete();
            $table->foreign('imagen_id')->references('id')->on('multimedia')->nullOnDelete();
            $table->unique(['categoria_padre_id', 'nombre'], 'uq_categoria_nombre_padre');
            $table->index('categoria_padre_id', 'idx_categorias_padre');
        });

        Schema::create('productos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('categoria_id');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->decimal('precio_base', 10, 2);
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('categoria_id')->references('id')->on('categorias');
            $table->index('categoria_id', 'idx_productos_categoria');
            $table->index('activo', 'idx_productos_activo');
        });

        Schema::create('tortas', function (Blueprint $table) {
            $table->unsignedInteger('producto_id')->primary();
            $table->string('tamano', 50);
            $table->integer('porciones');
            $table->string('sabor', 100);

            $table->foreign('producto_id')->references('id')->on('productos')->cascadeOnDelete();
        });

        Schema::create('detalles', function (Blueprint $table) {
            $table->unsignedInteger('producto_id')->primary();
            $table->integer('stock')->default(0);

            $table->foreign('producto_id')->references('id')->on('productos')->cascadeOnDelete();
        });

        Schema::create('sublimaciones', function (Blueprint $table) {
            $table->unsignedInteger('producto_id')->primary();
            $table->string('tipo_material', 100);

            $table->foreign('producto_id')->references('id')->on('productos')->cascadeOnDelete();
        });

        Schema::create('disenos_torta', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('torta_id');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->decimal('costo_adicional', 10, 2)->default(0);
            $table->unsignedInteger('multimedia_id')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('torta_id')->references('producto_id')->on('tortas')->cascadeOnDelete();
            $table->foreign('multimedia_id')->references('id')->on('multimedia')->nullOnDelete();
        });

        Schema::create('plantillas_diseno', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('sublimacion_id');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->decimal('costo_adicional', 10, 2)->default(0);
            $table->unsignedInteger('multimedia_id')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('sublimacion_id')->references('producto_id')->on('sublimaciones')->cascadeOnDelete();
            $table->foreign('multimedia_id')->references('id')->on('multimedia')->nullOnDelete();
        });

        Schema::create('disenos_personalizados', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('sublimacion_id');
            $table->unsignedInteger('multimedia_id');
            $table->text('indicaciones')->nullable();
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('usuarios')->restrictOnDelete();
            $table->foreign('sublimacion_id')->references('producto_id')->on('sublimaciones')->restrictOnDelete();
            $table->foreign('multimedia_id')->references('id')->on('multimedia')->restrictOnDelete();
        });

        Schema::create('producto_multimedia', function (Blueprint $table) {
            $table->unsignedInteger('producto_id');
            $table->unsignedInteger('multimedia_id');
            $table->integer('orden')->default(0);
            $table->boolean('es_principal')->default(false);

            $table->primary(['producto_id', 'multimedia_id']);
            $table->foreign('producto_id')->references('id')->on('productos')->cascadeOnDelete();
            $table->foreign('multimedia_id')->references('id')->on('multimedia')->cascadeOnDelete();
        });

        Schema::create('publicaciones', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('categoria_id')->nullable();
            $table->unsignedInteger('producto_id')->nullable();
            $table->string('titulo', 150);
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('usuarios')->restrictOnDelete();
            $table->foreign('categoria_id')->references('id')->on('categorias')->nullOnDelete();
            $table->foreign('producto_id')->references('id')->on('productos')->nullOnDelete();
        });

        Schema::create('publicacion_multimedia', function (Blueprint $table) {
            $table->unsignedInteger('publicacion_id');
            $table->unsignedInteger('multimedia_id');
            $table->integer('orden')->default(0);

            $table->primary(['publicacion_id', 'multimedia_id']);
            $table->foreign('publicacion_id')->references('id')->on('publicaciones')->cascadeOnDelete();
            $table->foreign('multimedia_id')->references('id')->on('multimedia')->cascadeOnDelete();
        });

        Schema::create('carritos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('usuario_id');
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('usuarios')->restrictOnDelete();
        });

        Schema::create('detalles_carrito', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('carrito_id');
            $table->unsignedInteger('producto_id');
            $table->integer('cantidad')->default(1);
            $table->decimal('precio_unitario', 10, 2);
            $table->text('comentario')->nullable();
            $table->unsignedInteger('diseno_torta_id')->nullable();
            $table->unsignedInteger('plantilla_diseno_id')->nullable();
            $table->unsignedInteger('diseno_personalizado_id')->nullable();
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('carrito_id')->references('id')->on('carritos')->cascadeOnDelete();
            $table->foreign('producto_id')->references('id')->on('productos')->restrictOnDelete();
            $table->foreign('diseno_torta_id')->references('id')->on('disenos_torta')->restrictOnDelete();
            $table->foreign('plantilla_diseno_id')->references('id')->on('plantillas_diseno')->restrictOnDelete();
            $table->foreign('diseno_personalizado_id')->references('id')->on('disenos_personalizados')->restrictOnDelete();
        });

        Schema::create('pedidos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('usuario_id');
            $table->date('fecha_entrega');
            $table->string('estado', 50)->default('PENDIENTE');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('total', 10, 2);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('usuarios')->restrictOnDelete();
            $table->index('usuario_id', 'idx_pedidos_usuario');
            $table->index('fecha_entrega', 'idx_pedidos_fecha_entrega');
            $table->index('estado', 'idx_pedidos_estado');
        });

        Schema::create('detalles_pedido', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('pedido_id');
            $table->unsignedInteger('producto_id');
            $table->string('nombre_producto', 150);
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->string('tipo_configuracion', 50)->nullable();
            $table->string('nombre_diseno', 100)->nullable();
            $table->decimal('costo_diseno', 10, 2)->default(0);
            $table->text('indicaciones')->nullable();
            $table->unsignedInteger('diseno_torta_id')->nullable();
            $table->unsignedInteger('plantilla_diseno_id')->nullable();
            $table->unsignedInteger('diseno_personalizado_id')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('pedido_id')->references('id')->on('pedidos')->cascadeOnDelete();
            $table->foreign('producto_id')->references('id')->on('productos')->restrictOnDelete();
            $table->foreign('diseno_torta_id')->references('id')->on('disenos_torta')->nullOnDelete();
            $table->foreign('plantilla_diseno_id')->references('id')->on('plantillas_diseno')->nullOnDelete();
            $table->foreign('diseno_personalizado_id')->references('id')->on('disenos_personalizados')->nullOnDelete();
        });

        Schema::create('configuracion_produccion', function (Blueprint $table) {
            $table->increments('id');
            $table->date('fecha');
            $table->unsignedInteger('categoria_id')->nullable();
            $table->integer('capacidad_maxima');
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('categoria_id')->references('id')->on('categorias')->restrictOnDelete();
        });

        Schema::create('pagos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('pedido_id');
            $table->string('metodo', 50);
            $table->string('estado', 50)->default('PENDIENTE');
            $table->decimal('monto', 10, 2);
            $table->string('referencia_pasarela', 255)->nullable();
            $table->timestamp('fecha_pago')->nullable();
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent();

            $table->foreign('pedido_id')->references('id')->on('pedidos')->cascadeOnDelete();
            $table->index('pedido_id', 'idx_pagos_pedido');
        });

        Schema::create('comprobantes_pago', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('pago_id');
            $table->unsignedInteger('multimedia_id');
            $table->unsignedInteger('revisado_por_id')->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->text('comentario_revision')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('pago_id')->references('id')->on('pagos')->cascadeOnDelete();
            $table->foreign('multimedia_id')->references('id')->on('multimedia')->restrictOnDelete();
            $table->foreign('revisado_por_id')->references('id')->on('usuarios')->nullOnDelete();
        });

        Schema::create('notificaciones', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('pedido_id')->nullable();
            $table->unsignedInteger('pago_id')->nullable();
            $table->string('tipo', 50);
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->boolean('leida')->default(false);
            $table->timestamp('fecha_lectura')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('usuarios')->cascadeOnDelete();
            $table->foreign('pedido_id')->references('id')->on('pedidos')->nullOnDelete();
            $table->foreign('pago_id')->references('id')->on('pagos')->nullOnDelete();
            $table->index('usuario_id', 'idx_notificaciones_usuario');
        });

        DB::statement('CREATE UNIQUE INDEX uq_categoria_raiz_nombre ON categorias (nombre) WHERE categoria_padre_id IS NULL');
        DB::statement('CREATE UNIQUE INDEX uq_producto_multimedia_principal ON producto_multimedia (producto_id) WHERE es_principal = TRUE');
        DB::statement('CREATE UNIQUE INDEX uq_carrito_activo_usuario ON carritos (usuario_id) WHERE activo = TRUE');

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            $this->agregarChequeosPostgres();
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('comprobantes_pago');
        Schema::dropIfExists('pagos');
        Schema::dropIfExists('configuracion_produccion');
        Schema::dropIfExists('detalles_pedido');
        Schema::dropIfExists('pedidos');
        Schema::dropIfExists('detalles_carrito');
        Schema::dropIfExists('carritos');
        Schema::dropIfExists('publicacion_multimedia');
        Schema::dropIfExists('publicaciones');
        Schema::dropIfExists('producto_multimedia');
        Schema::dropIfExists('disenos_personalizados');
        Schema::dropIfExists('plantillas_diseno');
        Schema::dropIfExists('disenos_torta');
        Schema::dropIfExists('sublimaciones');
        Schema::dropIfExists('detalles');
        Schema::dropIfExists('tortas');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('categorias');
        Schema::dropIfExists('configuracion_tienda');
        Schema::dropIfExists('multimedia');
        Schema::dropIfExists('verificaciones_correo');
        Schema::dropIfExists('cuentas_oauth');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('roles');
    }

    private function agregarChequeosPostgres(): void
    {
        DB::statement('ALTER TABLE usuarios ADD CONSTRAINT chk_usuarios_intentos_fallidos CHECK (intentos_fallidos >= 0)');
        DB::statement("ALTER TABLE cuentas_oauth ADD CONSTRAINT chk_oauth_proveedor CHECK (proveedor IN ('GOOGLE'))");
        DB::statement('ALTER TABLE multimedia ADD CONSTRAINT chk_multimedia_tamano CHECK (tamano_bytes >= 0)');
        DB::statement('ALTER TABLE multimedia ADD CONSTRAINT chk_multimedia_ancho CHECK (ancho IS NULL OR ancho > 0)');
        DB::statement('ALTER TABLE multimedia ADD CONSTRAINT chk_multimedia_alto CHECK (alto IS NULL OR alto > 0)');
        DB::statement('ALTER TABLE productos ADD CONSTRAINT chk_producto_precio CHECK (precio_base >= 0)');
        DB::statement('ALTER TABLE tortas ADD CONSTRAINT chk_torta_porciones CHECK (porciones > 0)');
        DB::statement('ALTER TABLE detalles ADD CONSTRAINT chk_detalle_stock CHECK (stock >= 0)');
        DB::statement('ALTER TABLE disenos_torta ADD CONSTRAINT chk_diseno_torta_costo CHECK (costo_adicional >= 0)');
        DB::statement('ALTER TABLE plantillas_diseno ADD CONSTRAINT chk_plantilla_costo CHECK (costo_adicional >= 0)');
        DB::statement('ALTER TABLE producto_multimedia ADD CONSTRAINT chk_producto_multimedia_orden CHECK (orden >= 0)');
        DB::statement('ALTER TABLE publicacion_multimedia ADD CONSTRAINT chk_publicacion_multimedia_orden CHECK (orden >= 0)');
        DB::statement('ALTER TABLE detalles_carrito ADD CONSTRAINT chk_carrito_cantidad CHECK (cantidad > 0)');
        DB::statement('ALTER TABLE detalles_carrito ADD CONSTRAINT chk_carrito_precio CHECK (precio_unitario >= 0)');
        DB::statement('ALTER TABLE detalles_carrito ADD CONSTRAINT chk_carrito_configuracion CHECK ((CASE WHEN diseno_torta_id IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN plantilla_diseno_id IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN diseno_personalizado_id IS NOT NULL THEN 1 ELSE 0 END) <= 1)');
        DB::statement("ALTER TABLE pedidos ADD CONSTRAINT chk_pedido_estado CHECK (estado IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'))");
        DB::statement('ALTER TABLE pedidos ADD CONSTRAINT chk_pedido_subtotal CHECK (subtotal >= 0)');
        DB::statement('ALTER TABLE pedidos ADD CONSTRAINT chk_pedido_total CHECK (total >= 0)');
        DB::statement('ALTER TABLE detalles_pedido ADD CONSTRAINT chk_pedido_detalle_cantidad CHECK (cantidad > 0)');
        DB::statement('ALTER TABLE detalles_pedido ADD CONSTRAINT chk_pedido_detalle_precio CHECK (precio_unitario >= 0)');
        DB::statement('ALTER TABLE detalles_pedido ADD CONSTRAINT chk_pedido_detalle_subtotal CHECK (subtotal >= 0)');
        DB::statement('ALTER TABLE detalles_pedido ADD CONSTRAINT chk_pedido_detalle_costo_diseno CHECK (costo_diseno >= 0)');
        DB::statement('ALTER TABLE detalles_pedido ADD CONSTRAINT chk_pedido_detalle_configuracion CHECK ((CASE WHEN diseno_torta_id IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN plantilla_diseno_id IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN diseno_personalizado_id IS NOT NULL THEN 1 ELSE 0 END) <= 1)');
        DB::statement('ALTER TABLE configuracion_produccion ADD CONSTRAINT chk_capacidad_maxima CHECK (capacidad_maxima > 0)');
        DB::statement("ALTER TABLE pagos ADD CONSTRAINT chk_pago_metodo CHECK (metodo IN ('PASARELA', 'TRANSFERENCIA'))");
        DB::statement("ALTER TABLE pagos ADD CONSTRAINT chk_pago_estado CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO'))");
        DB::statement('ALTER TABLE pagos ADD CONSTRAINT chk_pago_monto CHECK (monto >= 0)');
    }
};
