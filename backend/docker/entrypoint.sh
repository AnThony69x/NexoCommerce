#!/bin/sh
set -e

mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

php artisan package:discover --ansi >/dev/null

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
