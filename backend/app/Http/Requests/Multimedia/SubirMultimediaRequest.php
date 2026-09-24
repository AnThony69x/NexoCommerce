<?php

declare(strict_types=1);

namespace App\Http\Requests\Multimedia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * RN-MED-01: tipos permitidos: jpeg, jpg, png, webp, pdf.
 * RN-MED-02: tamano maximo 5 MB (5120 KB).
 * RN-MED-03: destino debe ser uno de los valores permitidos.
 */
class SubirMultimediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Sanctum verifica identidad; roles si aplica
    }

    public function rules(): array
    {
        return [
            'archivo' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,webp,pdf',
                'max:5120', // 5 MB en KB
            ],
            'destino' => [
                'required',
                'string',
                'in:productos,comprobantes,personalizaciones,tienda,categorias,publicaciones,disenos',
            ],
        ];
    }

    /**
     * RN-MED-01: los PDF solo pueden registrarse como comprobantes.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $archivo = $this->file('archivo');

                if ($archivo === null || $validator->errors()->has('archivo')) {
                    return;
                }

                if ($archivo->getMimeType() === 'application/pdf'
                    && $this->input('destino') !== 'comprobantes') {
                    $validator->errors()->add(
                        'destino',
                        'Los archivos PDF solo pueden registrarse como comprobantes.',
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'El archivo es obligatorio.',
            'archivo.file' => 'El campo debe ser un archivo valido.',
            'archivo.mimes' => 'El archivo debe ser de tipo: jpeg, jpg, png, webp o pdf.',
            'archivo.max' => 'El archivo no puede superar los 5 MB.',
            'destino.required' => 'El campo destino es obligatorio.',
            'destino.in' => 'Destino no valido. Use: productos, comprobantes, personalizaciones, tienda, categorias, publicaciones o disenos.',
        ];
    }
}
