<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Laravel\Sanctum\PersonalAccessToken;

class TokenAccesoModelo extends PersonalAccessToken
{
    protected $table = 'auth.personal_access_tokens';
}
