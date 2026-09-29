<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

        // --- Fase 2: Multimedia ---
        // Disco local. Para migrar a Laptop 5 (SFTP/Emilio):
        //   1. Instalar league/flysystem-sftp-v3
        //   2. Descomentar multimedia_sftp y cambiar el binding en AppServiceProvider.
        'multimedia' => [
            'driver' => 'local',
            'root' => storage_path('app/multimedia'),
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        // Stub SFTP — descomentar cuando Laptop 5 este disponible:
        // 'multimedia_sftp' => [
        //     'driver' => 'sftp',
        //     'host' => env('MULTIMEDIA_SFTP_HOST'),
        //     'port' => env('MULTIMEDIA_SFTP_PORT', 22),
        //     'username' => env('MULTIMEDIA_SFTP_USER'),
        //     'privateKey' => env('MULTIMEDIA_SFTP_KEY'),
        //     'root' => env('MULTIMEDIA_SFTP_ROOT', '/srv/nexocommerce'),
        // ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
