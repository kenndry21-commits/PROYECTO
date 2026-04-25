import type { GeneralInfo, Vehicle, InvoiceItem, Service } from "../types/invoice"

export interface ValidationError {
  field: string
  message: string
  type: "error" | "warning"
}

export function validateInvoice(
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
): ValidationError[] {
  const errors: ValidationError[] = []

  // Validar información general
  if (!infoGeneral.numeroFactura.trim()) {
    errors.push({
      field: "numeroFactura",
      message: "El número de factura es obligatorio",
      type: "error",
    })
  }

  if (!infoGeneral.nombreCliente.trim()) {
    errors.push({
      field: "nombreCliente",
      message: "El nombre del cliente es obligatorio",
      type: "error",
    })
  }

  if (!infoGeneral.fecha) {
    errors.push({
      field: "fecha",
      message: "La fecha es obligatoria",
      type: "error",
    })
  }

  // Validar que hay al menos un vehículo
  if (vehicles.length === 0) {
    errors.push({
      field: "vehicles",
      message: "Debe agregar al menos un vehículo",
      type: "error",
    })
  }

  // Validar vehículos
  vehicles.forEach((vehicle, index) => {
    if (!vehicle.marca.trim()) {
      errors.push({
        field: `vehicle-${index}-marca`,
        message: `La marca del vehículo ${index + 1} es obligatoria`,
        type: "error",
      })
    }

    if (!vehicle.modelo.trim()) {
      errors.push({
        field: `vehicle-${index}-modelo`,
        message: `El modelo del vehículo ${index + 1} es obligatorio`,
        type: "error",
      })
    }

    if (!vehicle.placa.trim()) {
      errors.push({
        field: `vehicle-${index}-placa`,
        message: `La placa del vehículo ${index + 1} es obligatoria`,
        type: "error",
      })
    }
  })

  // Validar que hay al menos un item o servicio
  if (items.length === 0 && servicios.length === 0) {
    errors.push({
      field: "items-servicios",
      message: "Debe agregar al menos un repuesto o servicio",
      type: "error",
    })
  }

  // Validar items
  items.forEach((item, index) => {
    if (!item.nombre.trim()) {
      errors.push({
        field: `item-${index}-nombre`,
        message: `El nombre del repuesto ${index + 1} es obligatorio`,
        type: "error",
      })
    }

    if (item.precio <= 0) {
      errors.push({
        field: `item-${index}-precio`,
        message: `El precio del repuesto ${index + 1} debe ser mayor a 0`,
        type: "error",
      })
    }

    if (item.unidad <= 0) {
      errors.push({
        field: `item-${index}-unidad`,
        message: `La cantidad del repuesto ${index + 1} debe ser mayor a 0`,
        type: "error",
      })
    }
  })

  // Validar servicios
  servicios.forEach((servicio, index) => {
    if (!servicio.descripcion.trim()) {
      errors.push({
        field: `servicio-${index}-descripcion`,
        message: `La descripción del servicio ${index + 1} es obligatoria`,
        type: "error",
      })
    }

    if (servicio.precio <= 0) {
      errors.push({
        field: `servicio-${index}-precio`,
        message: `El precio del servicio ${index + 1} debe ser mayor a 0`,
        type: "error",
      })
    }
  })

  // Validaciones específicas para facturas
  if (infoGeneral.tipoDocumento === "factura") {
    if (!infoGeneral.rnc.trim()) {
      errors.push({
        field: "rnc",
        message: "El RNC/Cédula es obligatorio para facturas",
        type: "warning",
      })
    }

    if (!infoGeneral.ncf?.trim()) {
      errors.push({
        field: "ncf",
        message: "El NCF es recomendado para facturas oficiales",
        type: "warning",
      })
    }
  }

  return errors
}
