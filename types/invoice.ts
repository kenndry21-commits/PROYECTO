export interface GeneralInfo {
  tipoDocumento: "factura" | "cotizacion"
  numeroFactura: string
  ncf?: string
  fecha: string
  nombreCliente: string
  rnc: string
  direccion: string
  telefono: string
  observaciones?: string
}

export interface Vehicle {
  id: string
  marca: string
  modelo: string
  ano: string
  color: string
  placa: string
  vin?: string
  observaciones?: string
}

export interface InvoiceItem {
  id: string
  vehicleId: string
  nombre: string
  descripcion: string
  unidad: number
  precio: number
}

export interface Service {
  id: string
  vehicleId: string
  descripcion: string
  precio: number
}

export interface VehicleTotals {
  vehicleId: string
  subtotal: number
  itbis: number
  total: number
}

export interface Totals {
  subtotal: number
  itbis: number
  total: number
  vehicleTotals: VehicleTotals[]
}

export interface SavedInvoice {
  id: string
  infoGeneral: GeneralInfo
  vehicles: Vehicle[]
  items: InvoiceItem[]
  servicios: Service[]
  totales: Totals
  fechaCreacion: string
  template?: string
}

export interface InvoiceStats {
  totalFacturas: number
  totalCotizaciones: number
  montoTotal: number
  promedioFactura: number
}
