import type { GeneralInfo, Vehicle, InvoiceItem, Service, Totals, SavedInvoice } from "@/types/invoice"

let cachedInvoices: SavedInvoice[] = []

export async function loadInvoicesFromDB(): Promise<SavedInvoice[]> {
  try {
    const res = await fetch('/api/invoices')
    const data = await res.json()
    cachedInvoices = data.map((row: any) => JSON.parse(row.data))
    return cachedInvoices
  } catch {
    return []
  }
}

export function generateInvoiceNumber(): string {
  return `FAC-${Date.now()}`
}

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
    template,
    fechaGuardado: new Date().toISOString(),
  }

  cachedInvoices = [invoice, ...cachedInvoices]

  fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: invoice.id, data: invoice })
  })

  return invoice
}

export function updateInvoice(invoice: SavedInvoice): void {
  cachedInvoices = cachedInvoices.map(i => i.id === invoice.id ? invoice : i)
  fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: invoice.id, data: invoice })
  })
}

export function getStoredInvoices(): SavedInvoice[] {
  return cachedInvoices
}

export async function deleteInvoice(id: string): Promise<void> {
  cachedInvoices = cachedInvoices.filter(i => i.id !== id)
  await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' })
}

export function getInvoiceStats() {
  return { total: cachedInvoices.length, thisMonth: 0, totalRevenue: 0 }
}