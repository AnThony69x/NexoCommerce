<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu correo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
            color: #18181b;
        }
        .container {
            max-width: 560px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .header {
            background-color: #18181b;
            padding: 32px 40px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 22px;
            margin: 0;
            font-weight: 600;
            letter-spacing: -0.3px;
        }
        .body {
            padding: 40px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 16px;
            color: #3f3f46;
        }
        .description {
            font-size: 15px;
            color: #52525b;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .code-box {
            background: #f4f4f5;
            border: 2px dashed #d4d4d8;
            border-radius: 8px;
            text-align: center;
            padding: 24px;
            margin-bottom: 32px;
        }
        .code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 40px;
            font-weight: 700;
            letter-spacing: 12px;
            color: #18181b;
        }
        .code-label {
            font-size: 12px;
            color: #71717a;
            margin-top: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .expiry {
            font-size: 13px;
            color: #71717a;
            background: #fff7ed;
            border-left: 3px solid #f97316;
            padding: 10px 16px;
            border-radius: 0 4px 4px 0;
            margin-bottom: 32px;
        }
        .footer {
            padding: 24px 40px;
            background: #fafafa;
            border-top: 1px solid #f0f0f0;
            font-size: 12px;
            color: #a1a1aa;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NexoCommerce</h1>
        </div>
        <div class="body">
            <p class="greeting">Hola, {{ $nombre }}.</p>
            <p class="description">
                Ingresa el siguiente codigo en la aplicacion para verificar tu direccion de correo electronico.
            </p>

            <div class="code-box">
                <div class="code">{{ $codigo }}</div>
                <div class="code-label">Codigo de verificacion</div>
            </div>

            <div class="expiry">
                Este codigo expira en <strong>{{ $expiraEn }}</strong>.
                Si no creaste una cuenta en NexoCommerce, ignora este mensaje.
            </div>
        </div>
        <div class="footer">
            Este correo fue enviado automaticamente. No respondas a este mensaje.<br>
            &copy; {{ date('Y') }} NexoCommerce. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
