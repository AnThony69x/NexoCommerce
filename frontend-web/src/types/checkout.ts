export type PaymentMethod = 'PASARELA' | 'TRANSFERENCIA'

export type DeliveryFormData = {
  tipoEntrega: 'RETIRO' | 'DOMICILIO'
  telefono: string
  direccion: string
  fechaEntrega: string
}

export const deliveryFormDefaultValues: DeliveryFormData = {
  tipoEntrega: 'RETIRO',
  telefono: '',
  direccion: '',
  fechaEntrega: '',
}
