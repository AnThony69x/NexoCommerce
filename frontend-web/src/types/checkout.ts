export type PaymentMethod = 'PASARELA' | 'TRANSFERENCIA'

export type DeliveryFormData = {
  nombreCompleto: string
  telefono: string
  direccion: string
  referencia: string
  fechaEntrega: string
}

export const deliveryFormDefaultValues: DeliveryFormData = {
  nombreCompleto: '',
  telefono: '',
  direccion: '',
  referencia: '',
  fechaEntrega: '',
}
