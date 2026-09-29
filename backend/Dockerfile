# syntax=docker/dockerfile:1

FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --prefer-dist \
    --no-interaction \
    --no-progress

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev --no-interaction


FROM php:8.4-cli-bookworm AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        libicu-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install -j$(nproc) pdo_pgsql pgsql intl zip bcmath opcache \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=vendor /app /app
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/app/multimedia storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV PORT=8000
EXPOSE 8000

USER www-data

ENTRYPOINT ["entrypoint.sh"]
