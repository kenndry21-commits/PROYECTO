import type { GeneralInfo, Vehicle, InvoiceItem, Service, Totals, SavedInvoice, InvoiceStats } from "../types/invoice"

const STORAGE_KEY = "invoices_data"

export function saveInvoice(
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  template = "modern",
): SavedInvoice {
  const invoice: SavedInvoice = {
    id: Date.now().toString(),
    infoGeneral,
    vehicles,
    items,
    servicios,
    totales,
    fechaCreacion: new Date().toISOString(),
    template,
  }

  const existingInvoices = getStoredInvoices()
  const updatedInvoices = [...existingInvoices, invoice]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices))
  return invoice
}

export function updateInvoice(
  id: string,
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  template = "modern",
): SavedInvoice | null {
  const existingInvoices = getStoredInvoices()
  const invoiceIndex = existingInvoices.findIndex((inv) => inv.id === id)

  if (invoiceIndex === -1) return null

  const updatedInvoice: SavedInvoice = {
    ...existingInvoices[invoiceIndex],
    infoGeneral,
    vehicles,
    items,
    servicios,
    totales,
    template,
  }

  existingInvoices[invoiceIndex] = updatedInvoice
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingInvoices))

  return updatedInvoice
}

export function getStoredInvoices(): SavedInvoice[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading invoices:", error)
    return []
  }
}

export function deleteInvoice(id: string): boolean {
  try {
    const existingInvoices = getStoredInvoices()
    const filteredInvoices = existingInvoices.filter((inv) => inv.id !== id)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredInvoices))
    return true
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return false
  }
}

export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const time = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0")

  return `F${year}${month}${day}-${time}`
}

// Alias for backwards compatibility
export const getInvoices = getStoredInvoices

export function getInvoiceStats(): InvoiceStats {
  const invoices = getStoredInvoices()

  const facturas = invoices.filter((inv) => inv.infoGeneral.tipoDocumento === "factura")
  const cotizaciones = invoices.filter((inv) => inv.infoGeneral.tipoDocumento === "cotizacion")

  const montoTotal = invoices.reduce((sum, inv) => sum + inv.totales.total, 0)
  const promedioFactura = invoices.length > 0 ? montoTotal / invoices.length : 0

  return {
    totalFacturas: facturas.length,
    totalCotizaciones: cotizaciones.length,
    montoTotal,
    promedioFactura,
  }
}
