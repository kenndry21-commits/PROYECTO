export const T = {
  primary: '#1E3A8A',
  primaryDark: '#172554',
  primaryContainer: '#DBEAFE',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1E3A8A',
  surface: '#FFFFFF',
  surfaceDim: '#F8FAFC',
  surfaceContainer: '#F1F5F9',
  surfaceContainerHigh: '#E2E8F0',
  outline: '#CBD5E1',
  outlineVariant: '#E2E8F0',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  onSurfaceMuted: '#64748B',
  stockOk: '#16A34A',
  stockOkContainer: '#DCFCE7',
  stockLow: '#CA8A04',
  stockLowContainer: '#FEF9C3',
  stockOut: '#DC2626',
  stockOutContainer: '#FEE2E2',
  error: '#DC2626',
  errorContainer: '#FEE2E2',
} as const

export const UNIT_LABELS: Record<string, string> = {
  unidad: 'Unidad',
  galon: 'Galón',
  litro: 'Litro',
  kg: 'Kilogramo',
  caja: 'Caja',
}

export const fmtRD = (n: number) =>
  `RD$${Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const stockLevel = (s: number): 'out' | 'low' | 'ok' =>
  s <= 0 ? 'out' : s <= 5 ? 'low' : 'ok'

export const stockColor = (s: number) => {
  const l = stockLevel(s)
  return l === 'out' ? T.stockOut : l === 'low' ? T.stockLow : T.stockOk
}

export const stockContainer = (s: number) => {
  const l = stockLevel(s)
  return l === 'out' ? T.stockOutContainer : l === 'low' ? T.stockLowContainer : T.stockOkContainer
}

export const stockLabel = (s: number) => {
  const l = stockLevel(s)
  return l === 'out' ? 'Sin stock' : l === 'low' ? 'Stock bajo' : 'Disponible'
}

export const getCategory = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('aceite') || n.includes('lubri') || n.includes('grasa') || n.includes('atf')) return 'Lubricantes'
  if (n.includes('filtro')) return 'Filtros'
  if (n.includes('freno') || n.includes('pastilla') || n.includes('dot')) return 'Frenos'
  if (n.includes('bujía') || n.includes('bujia')) return 'Encendido'
  if (n.includes('correa') || n.includes('distribución')) return 'Motor'
  if (n.includes('refrigerante') || n.includes('prestone')) return 'Fluidos'
  return 'General'
}

export const getCategoryIcon = (name: string) => {
  const cat = getCategory(name)
  if (cat === 'Lubricantes') return 'pricetag'
  if (cat === 'Filtros') return 'inventory'
  if (cat === 'Frenos') return 'warning'
  if (cat === 'Motor' || cat === 'Encendido') return 'settings'
  return 'category'
}
