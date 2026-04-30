'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  T, UNIT_LABELS, fmtRD,
  stockColor, stockContainer, stockLabel, stockLevel,
  getCategory, getCategoryIcon,
} from '@/app-movil/theme'
import { Icon } from '@/app-movil/icons'
import {
  StatusBar, NavBar, TopAppBar, IconButton,
  FilledButton, ExtendedFAB, Chip, TextField,
  BottomNav, SectionLabel, DeleteConfirmSheet,
} from '@/app-movil/components'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  unit: string
}

type Screen = 'home' | 'search' | 'detail' | 'new' | 'edit'
type StockFilter = 'todos' | 'disponible' | 'bajo' | 'agotado'

interface FormState {
  name: string
  description: string
  price: string
  stock: string
  unit: string
}

const EMPTY_FORM: FormState = { name: '', description: '', price: '', stock: '', unit: 'unidad' }

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiLoad(): Promise<Product[]> {
  const r = await fetch('/api/products')
  if (!r.ok) throw new Error('Error al cargar productos')
  return r.json()
}

async function apiSave(p: Product): Promise<void> {
  await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  })
}

async function apiDelete(id: string): Promise<void> {
  await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

function SummaryCard({ products }: { products: Product[] }) {
  const low = products.filter(p => p.stock > 0 && p.stock <= 5).length
  const out = products.filter(p => p.stock <= 0).length
  const value = products.reduce((s, p) => s + p.price * p.stock, 0)
  return (
    <div style={{ padding: '12px 16px 4px' }}>
      <div style={{
        background: T.primary, borderRadius: 16, padding: 16,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: 70, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, letterSpacing: 0.5 }}>VALOR DE INVENTARIO</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{fmtRD(value)}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14, position: 'relative' }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>PRODUCTOS</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{products.length}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>STOCK BAJO</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FCD34D' }}>{low}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>SIN STOCK</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FCA5A5' }}>{out}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductRow({ p, onClick }: { p: Product; onClick: () => void }) {
  const c = stockColor(p.stock)
  const bg = stockContainer(p.stock)
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      background: T.surface, cursor: 'pointer', position: 'relative',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, background: c, borderRadius: '0 2px 2px 0' }} />
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: T.surfaceContainer,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={getCategoryIcon(p.name)} size={22} color={T.primary} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 600, color: T.onSurface, lineHeight: '20px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{p.name}</div>
        <div style={{
          fontSize: 13, color: T.onSurfaceMuted, lineHeight: '18px', marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{p.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{fmtRD(p.price)}</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 6, background: bg }}>
            <div style={{ width: 5, height: 5, borderRadius: 3, background: c }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: c }}>
              {p.stock} {(UNIT_LABELS[p.unit] ?? p.unit).toLowerCase()}{p.stock !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      <Icon name="arrowRight" size={20} color={T.onSurfaceMuted} />
    </div>
  )
}

function HomeScreen({ products, onSelect, onSearch, onNew }: {
  products: Product[]
  onSelect: (p: Product) => void
  onSearch: () => void
  onNew: () => void
}) {
  const [filter, setFilter] = useState<StockFilter>('todos')

  const counts = {
    todos: products.length,
    disponible: products.filter(p => stockLevel(p.stock) === 'ok').length,
    bajo: products.filter(p => stockLevel(p.stock) === 'low').length,
    agotado: products.filter(p => stockLevel(p.stock) === 'out').length,
  }

  const visible = filter === 'todos' ? products
    : filter === 'disponible' ? products.filter(p => stockLevel(p.stock) === 'ok')
    : filter === 'bajo' ? products.filter(p => stockLevel(p.stock) === 'low')
    : products.filter(p => stockLevel(p.stock) === 'out')

  const chips: { id: StockFilter; label: string; color?: string; fg?: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'disponible', label: 'Disponible', color: T.stockOkContainer, fg: T.stockOk },
    { id: 'bajo', label: 'Stock bajo', color: T.stockLowContainer, fg: T.stockLow },
    { id: 'agotado', label: 'Sin stock', color: T.stockOutContainer, fg: T.stockOut },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.surfaceDim }}>
      <StatusBar />
      <TopAppBar
        title="Inventario"
        subtitle="Mecatrónica · Taller Automotriz"
        leading={
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: T.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="truck" size={22} color="#fff" />
          </div>
        }
        trailing={
          <div style={{ display: 'flex' }}>
            <IconButton icon="search" color={T.onSurface} onClick={onSearch} />
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <SummaryCard products={products} />

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '8px 16px 12px', overflowX: 'auto' }}>
          {chips.map(c => (
            <div key={c.id} onClick={() => setFilter(c.id)} style={{
              height: 34, padding: '0 14px', borderRadius: 10,
              border: filter === c.id ? 'none' : `1px solid ${T.outline}`,
              background: filter === c.id ? (c.color || T.primaryContainer) : 'transparent',
              color: filter === c.id ? (c.fg || T.primary) : T.onSurfaceVariant,
              fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0,
              cursor: 'pointer',
            }}>
              {filter === c.id && <Icon name="check" size={14} color={c.fg || T.primary} />}
              {c.label}
              <span style={{ opacity: 0.7, fontWeight: 500 }}>· {counts[c.id]}</span>
            </div>
          ))}
        </div>

        {/* List header */}
        <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.onSurfaceMuted, letterSpacing: 0.5 }}>
            {visible.length} PRODUCTO{visible.length !== 1 ? 'S' : ''}
          </div>
        </div>

        {/* Product list */}
        <div style={{ background: T.surface, marginBottom: 100 }}>
          {visible.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: T.onSurfaceMuted, fontSize: 15 }}>
              No hay productos en este filtro
            </div>
          ) : (
            visible.map((p, i) => (
              <React.Fragment key={p.id}>
                <ProductRow p={p} onClick={() => onSelect(p)} />
                {i < visible.length - 1 && (
                  <div style={{ height: 1, background: T.outlineVariant, marginLeft: 78 }} />
                )}
              </React.Fragment>
            ))
          )}
        </div>

        {/* FAB */}
        <div style={{ position: 'absolute', right: 16, bottom: 16 }}>
          <ExtendedFAB icon="add" onClick={onNew}>Nuevo producto</ExtendedFAB>
        </div>
      </div>

      <BottomNav active="home" />
      <NavBar />
    </div>
  )
}

// ─── SearchScreen ─────────────────────────────────────────────────────────────

function SearchResultRow({ p, query, onClick }: { p: Product; query: string; onClick: () => void }) {
  const c = stockColor(p.stock)
  const bg = stockContainer(p.stock)
  const idx = p.name.toLowerCase().indexOf(query.toLowerCase())
  const before = idx >= 0 ? p.name.slice(0, idx) : p.name
  const match = idx >= 0 ? p.name.slice(idx, idx + query.length) : ''
  const after = idx >= 0 ? p.name.slice(idx + query.length) : ''
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: T.surface, cursor: 'pointer' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: T.surfaceContainer,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={getCategoryIcon(p.name)} size={20} color={T.primary} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.onSurface, lineHeight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {before}
          <span style={{ background: '#FEF08A', color: T.onSurface, padding: '0 2px', borderRadius: 3 }}>{match}</span>
          {after}
        </div>
        <div style={{ fontSize: 13, color: T.onSurfaceMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>
      </div>
      <div style={{ padding: '4px 10px', borderRadius: 8, background: bg, color: c, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{p.stock}</div>
    </div>
  )
}

function SearchScreen({ products, onBack, onSelect }: {
  products: Product[]
  onBack: () => void
  onSelect: (p: Product) => void
}) {
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('Todos')

  const categories = ['Todos', ...Array.from(new Set(products.map(p => getCategory(p.name))))]

  const results = products.filter(p => {
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())
    const matchCat = catFilter === 'Todos' || getCategory(p.name) === catFilter
    return matchQuery && matchCat
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.surfaceDim }}>
      <StatusBar />

      {/* Search bar */}
      <div style={{
        height: 64, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4,
        background: T.surface, borderBottom: `1px solid ${T.outlineVariant}`, flexShrink: 0,
      }}>
        <IconButton icon="back" color={T.onSurface} onClick={onBack} />
        <div style={{
          flex: 1, height: 48, borderRadius: 24, background: T.surfaceContainer,
          display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px',
        }}>
          <Icon name="search" size={20} color={T.onSurfaceMuted} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            style={{
              flex: 1, fontSize: 16, color: T.onSurface, border: 'none', outline: 'none',
              background: 'transparent', fontFamily: 'Roboto, system-ui, sans-serif',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
              <Icon name="close" size={20} color={T.onSurfaceMuted} />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div style={{
        background: T.surface, padding: '4px 16px 12px', display: 'flex', gap: 8,
        overflowX: 'auto', borderBottom: `1px solid ${T.outlineVariant}`, flexShrink: 0,
      }}>
        {categories.map(cat => (
          <Chip
            key={cat}
            selected={catFilter === cat}
            leading={catFilter === cat ? <Icon name="check" size={14} color={T.primary} /> : undefined}
            onClick={() => setCatFilter(cat)}
          >
            {cat}
          </Chip>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.onSurfaceMuted, letterSpacing: 0.5 }}>
            {results.length} RESULTADO{results.length !== 1 ? 'S' : ''}
          </div>
          {query && (
            <button onClick={() => setQuery('')} style={{
              fontSize: 13, color: T.primary, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
            }}>Limpiar</button>
          )}
        </div>

        <div style={{ background: T.surface }}>
          {results.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: T.onSurfaceMuted, fontSize: 15 }}>
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((p, i) => (
              <React.Fragment key={p.id}>
                <SearchResultRow p={p} query={query} onClick={() => onSelect(p)} />
                {i < results.length - 1 && <div style={{ height: 1, background: T.outlineVariant, marginLeft: 70 }} />}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      <NavBar />
    </div>
  )
}

// ─── DetailScreen ─────────────────────────────────────────────────────────────

function DetailScreen({ product, onBack, onEdit, onDelete, onStockUpdate }: {
  product: Product
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onStockUpdate: (newStock: number) => void
}) {
  const [tempStock, setTempStock] = useState(product.stock)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const c = stockColor(product.stock)
  const bg = stockContainer(product.stock)
  const level = stockLevel(product.stock)

  async function handleStockSave() {
    if (tempStock === product.stock) return
    setSaving(true)
    await apiSave({ ...product, stock: tempStock })
    onStockUpdate(tempStock)
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.surfaceDim, position: 'relative' }}>
      <StatusBar dark bg={T.primary} />
      <TopAppBar
        dark
        title="Detalle del producto"
        leading={<IconButton icon="back" color="#fff" onClick={onBack} />}
        trailing={
          <div style={{ display: 'flex' }}>
            <IconButton icon="barcode" color="#fff" />
            <IconButton icon="edit" color="#fff" onClick={onEdit} />
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero */}
        <div style={{ background: T.primary, padding: '8px 20px 24px', color: '#fff' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={getCategoryIcon(product.name)} size={36} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, letterSpacing: 1 }}>
                {getCategory(product.name).toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: '26px', marginTop: 2 }}>{product.name}</div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{product.description}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <div style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 600 }}>
              {getCategory(product.name)}
            </div>
            <div style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 600 }}>
              {UNIT_LABELS[product.unit] ?? product.unit}
            </div>
          </div>
        </div>

        {/* Stock alert */}
        {level !== 'ok' && (
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{
              background: bg, borderRadius: 16, padding: 16,
              display: 'flex', gap: 14, alignItems: 'center',
              border: `1px solid ${c}33`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={level === 'out' ? 'error' : 'warning'} size={24} color={c} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c }}>
                  {level === 'out' ? 'Sin stock' : 'Stock bajo'}
                </div>
                <div style={{ fontSize: 13, color: T.onSurface, marginTop: 2 }}>
                  {level === 'out'
                    ? 'Este producto está agotado.'
                    : `Solo quedan ${product.stock} unidad${product.stock !== 1 ? 'es' : ''}. Considera reordenar.`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info grid */}
        <div style={{ padding: '16px' }}>
          <div style={{ background: T.surface, borderRadius: 16, padding: 8, border: `1px solid ${T.outlineVariant}` }}>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ fontSize: 11, color: T.onSurfaceMuted, fontWeight: 600, letterSpacing: 0.5 }}>STOCK ACTUAL</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: c, lineHeight: 1 }}>{product.stock}</span>
                  <span style={{ fontSize: 14, color: T.onSurfaceMuted, fontWeight: 500 }}>
                    {(UNIT_LABELS[product.unit] ?? product.unit).toLowerCase()}s
                  </span>
                </div>
              </div>
              <div style={{ width: 1, background: T.outlineVariant, margin: '12px 0' }} />
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ fontSize: 11, color: T.onSurfaceMuted, fontWeight: 600, letterSpacing: 0.5 }}>PRECIO UNITARIO</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.onSurface, marginTop: 6 }}>{fmtRD(product.price)}</div>
              </div>
            </div>
            <div style={{ height: 1, background: T.outlineVariant, margin: '0 8px' }} />
            <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: T.onSurfaceMuted, fontWeight: 600, letterSpacing: 0.5 }}>VALOR TOTAL EN BODEGA</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.primary, marginTop: 4 }}>{fmtRD(product.price * product.stock)}</div>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: 10, background: T.primaryContainer, color: T.primary, fontSize: 13, fontWeight: 600 }}>
                {product.stock} × {fmtRD(product.price)}
              </div>
            </div>
          </div>
        </div>

        {/* Stock adjustment */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.onSurface, marginBottom: 10 }}>Ajuste rápido de stock</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => setTempStock(Math.max(0, tempStock - 1))}
              style={{
                width: 56, height: 56, borderRadius: 28, border: `1px solid ${T.outline}`,
                background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Icon name="minus" size={24} color={T.primary} />
            </button>
            <div style={{
              flex: 1, height: 56, borderRadius: 16, background: T.surface,
              border: `1px solid ${T.outlineVariant}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: T.onSurface,
            }}>{tempStock}</div>
            <button
              onClick={() => setTempStock(tempStock + 1)}
              style={{
                width: 56, height: 56, borderRadius: 28, border: 'none',
                background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Icon name="add" size={24} color="#fff" />
            </button>
          </div>
          {tempStock !== product.stock && (
            <button
              onClick={handleStockSave}
              disabled={saving}
              style={{
                marginTop: 12, width: '100%', height: 44, borderRadius: 22, border: 'none',
                background: T.primary, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Guardando…' : `Guardar stock: ${tempStock}`}
            </button>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '0 16px 24px', display: 'flex', gap: 10 }}>
          <FilledButton icon="edit" full onClick={onEdit}>Editar</FilledButton>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              height: 48, width: 48, borderRadius: 24, border: `1px solid ${T.outline}`,
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Icon name="delete" size={20} color={T.error} />
          </button>
        </div>
      </div>

      <NavBar />

      {showConfirm && (
        <DeleteConfirmSheet
          productName={product.name}
          onConfirm={onDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}

// ─── NewScreen ────────────────────────────────────────────────────────────────

function NewScreen({ onBack, onSaved }: {
  onBack: () => void
  onSaved: (p: Product) => void
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [saving, setSaving] = useState(false)

  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e: Partial<FormState> = {}
    if (!form.name.trim()) e.name = 'Requerido'
    if (!form.price || isNaN(Number(form.price))) e.price = 'Precio inválido'
    if (form.stock !== '' && isNaN(Number(form.stock))) e.stock = 'Stock inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    const p: Product = {
      id: Date.now().toString(),
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
    }
    await apiSave(p)
    onSaved(p)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.surface }}>
      <StatusBar />
      <TopAppBar
        title="Nuevo producto"
        leading={<IconButton icon="close" color={T.onSurface} onClick={onBack} />}
        trailing={
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 36, padding: '0 16px', borderRadius: 18, border: 'none',
              background: T.primary, color: '#fff', fontSize: 13, fontWeight: 600,
              marginRight: 8, cursor: 'pointer', fontFamily: 'inherit',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 100px' }}>
        {/* Hero icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0 24px' }}>
          <div style={{
            width: 88, height: 88, borderRadius: 24, background: T.primaryContainer,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <Icon name="image" size={36} color={T.primary} />
          </div>
          <div style={{ fontSize: 13, color: T.onSurfaceMuted, marginTop: 10, fontWeight: 500 }}>Nuevo producto</div>
        </div>

        <SectionLabel>INFORMACIÓN DEL PRODUCTO</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <TextField
            label="Nombre del producto"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            placeholder="Ej: Aceite Mobil 5W-30"
          />
          <TextField
            label="Descripción"
            value={form.description}
            onChange={set('description')}
            multiline
            placeholder="Descripción del producto…"
          />
          <TextField
            label="Precio"
            value={form.price}
            onChange={set('price')}
            type="number"
            error={errors.price}
            leading={<span style={{ fontSize: 16, fontWeight: 600, color: T.onSurfaceMuted }}>RD$</span>}
          />
        </div>

        <SectionLabel>STOCK Y UNIDAD DE MEDIDA</SectionLabel>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Stock inicial"
              value={form.stock}
              onChange={set('stock')}
              type="number"
              error={errors.stock}
            />
          </div>
          <div style={{ flex: 1.2 }}>
            <TextField
              label="Unidad"
              value={UNIT_LABELS[form.unit] ?? form.unit}
              trailing={<Icon name="arrowDown" size={18} color={T.onSurfaceMuted} />}
            />
          </div>
        </div>

        {/* Unit chips */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: T.onSurfaceMuted, fontWeight: 600, marginBottom: 8 }}>SELECCIÓN RÁPIDA</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(UNIT_LABELS).map(([k, v]) => (
              <Chip key={k} selected={form.unit === k} onClick={() => set('unit')(k)}>{v}</Chip>
            ))}
          </div>
        </div>

        {/* Threshold info */}
        <div style={{ marginTop: 24 }}>
          <SectionLabel>ALERTA DE STOCK BAJO</SectionLabel>
          <div style={{
            background: T.surfaceContainer, borderRadius: 16, padding: 16,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.onSurface }}>Aviso cuando stock ≤ 5</div>
              <div style={{ fontSize: 12, color: T.onSurfaceMuted, marginTop: 2 }}>Se marcará como stock bajo automáticamente</div>
            </div>
            <div style={{
              minWidth: 64, height: 36, padding: '0 12px', borderRadius: 18,
              background: T.surface, border: `1px solid ${T.outline}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: T.onSurface,
            }}>5</div>
          </div>
        </div>
      </div>

      <NavBar />
    </div>
  )
}

// ─── EditScreen ───────────────────────────────────────────────────────────────

function EditScreen({ product, onBack, onSaved, onDeleted }: {
  product: Product
  onBack: () => void
  onSaved: (p: Product) => void
  onDeleted: () => void
}) {
  const [form, setForm] = useState<FormState>({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    stock: product.stock.toString(),
    unit: product.unit,
  })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e: Partial<FormState> = {}
    if (!form.name.trim()) e.name = 'Requerido'
    if (!form.price || isNaN(Number(form.price))) e.price = 'Precio inválido'
    if (form.stock !== '' && isNaN(Number(form.stock))) e.stock = 'Stock inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    const updated: Product = {
      ...product,
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
    }
    await apiSave(updated)
    onSaved(updated)
  }

  async function handleDelete() {
    await apiDelete(product.id)
    onDeleted()
  }

  const level = stockLevel(product.stock)
  const priceChanged = parseFloat(form.price) !== product.price

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.surface, position: 'relative' }}>
      <StatusBar />
      <TopAppBar
        title="Editar producto"
        leading={<IconButton icon="back" color={T.onSurface} onClick={onBack} />}
        trailing={
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconButton icon="delete" color={T.error} onClick={() => setShowConfirm(true)} />
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                height: 36, padding: '0 16px', borderRadius: 18, border: 'none',
                background: T.primary, color: '#fff', fontSize: 13, fontWeight: 600,
                marginRight: 8, cursor: 'pointer', fontFamily: 'inherit',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Guardando…' : 'Actualizar'}
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>
        {/* Status banner */}
        {level !== 'ok' && (
          <div style={{
            background: level === 'out' ? T.stockOutContainer : T.stockLowContainer,
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20,
          }}>
            <Icon name={level === 'out' ? 'error' : 'warning'} size={20} color={level === 'out' ? T.stockOut : T.stockLow} />
            <div style={{ flex: 1, fontSize: 13, color: T.onSurface }}>
              <b>{level === 'out' ? 'Sin stock' : 'Stock bajo'}:</b>{' '}
              {product.stock} unidades
            </div>
          </div>
        )}

        <SectionLabel>INFORMACIÓN DEL PRODUCTO</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <TextField
            label="Nombre del producto"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
          />
          <TextField
            label="Descripción"
            value={form.description}
            onChange={set('description')}
            multiline
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <TextField
                label="Precio"
                value={form.price}
                onChange={set('price')}
                type="number"
                error={errors.price}
                leading={<span style={{ fontSize: 16, fontWeight: 600, color: T.onSurfaceMuted }}>RD$</span>}
              />
            </div>
          </div>
        </div>

        <SectionLabel>STOCK Y UNIDAD DE MEDIDA</SectionLabel>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Stock actual"
              value={form.stock}
              onChange={set('stock')}
              type="number"
              error={errors.stock}
            />
          </div>
          <div style={{ flex: 1.2 }}>
            <TextField
              label="Unidad"
              value={UNIT_LABELS[form.unit] ?? form.unit}
              trailing={<Icon name="arrowDown" size={18} color={T.onSurfaceMuted} />}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.onSurfaceMuted, fontWeight: 600, marginBottom: 8 }}>SELECCIÓN RÁPIDA</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(UNIT_LABELS).map(([k, v]) => (
              <Chip key={k} selected={form.unit === k} onClick={() => set('unit')(k)}>{v}</Chip>
            ))}
          </div>
        </div>

        {/* Price history */}
        {priceChanged && (
          <>
            <SectionLabel>HISTORIAL DE PRECIO</SectionLabel>
            <div style={{
              background: T.surfaceContainer, borderRadius: 16, padding: 16,
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.onSurfaceMuted }}>Precio anterior</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.onSurface, textDecoration: 'line-through' }}>{fmtRD(product.price)}</div>
              </div>
              <Icon name="arrowRight" size={20} color={T.onSurfaceMuted} />
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: parseFloat(form.price) > product.price ? T.stockOut : T.stockOk, fontWeight: 600 }}>
                  {parseFloat(form.price) > product.price ? '▲' : '▼'}{' '}
                  {Math.abs(((parseFloat(form.price) - product.price) / product.price) * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>{fmtRD(parseFloat(form.price) || 0)}</div>
              </div>
            </div>
          </>
        )}

        {/* Danger zone */}
        <div style={{
          marginTop: 24, border: `1px solid ${T.errorContainer}`, borderRadius: 16, padding: 16,
          background: '#FEF2F2',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.error, marginBottom: 4 }}>Zona de peligro</div>
          <div style={{ fontSize: 13, color: T.onSurfaceMuted, marginBottom: 12 }}>
            Eliminar este producto borrará sus datos y no podrá revertirse.
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              height: 40, padding: '0 16px', borderRadius: 20,
              border: `1px solid ${T.error}`, background: 'transparent', color: T.error,
              fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Icon name="delete" size={16} color={T.error} />
            Eliminar producto
          </button>
        </div>
      </div>

      <NavBar />

      {showConfirm && (
        <DeleteConfirmSheet
          productName={product.name}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}

// ─── MobilePage (root) ────────────────────────────────────────────────────────

export default function MobilePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [screen, setScreen] = useState<Screen>('home')
  const [selected, setSelected] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProducts = useCallback(async () => {
    try {
      const data = await apiLoad()
      setProducts(data)
    } catch {
      // silently fail — products stays empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  function selectProduct(p: Product) {
    setSelected(p)
    setScreen('detail')
  }

  function handleStockUpdate(newStock: number) {
    if (!selected) return
    const updated = { ...selected, stock: newStock }
    setSelected(updated)
    setProducts(ps => ps.map(p => p.id === updated.id ? updated : p))
  }

  function handleSaved(p: Product) {
    setProducts(ps => {
      const idx = ps.findIndex(x => x.id === p.id)
      return idx >= 0 ? ps.map(x => x.id === p.id ? p : x) : [...ps, p]
    })
    setSelected(p)
    setScreen(screen === 'new' ? 'home' : 'detail')
  }

  function handleDeleted() {
    if (selected) setProducts(ps => ps.filter(p => p.id !== selected.id))
    setSelected(null)
    setScreen('home')
  }

  if (loading) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: T.surfaceDim,
        gap: 16, fontFamily: 'Roboto, system-ui, sans-serif',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: T.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="truck" size={32} color="#fff" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.primary }}>Mecatrónica</div>
        <div style={{ fontSize: 14, color: T.onSurfaceMuted }}>Cargando inventario…</div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100dvh', overflow: 'hidden',
      fontFamily: 'Roboto, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 0; height: 0; }`}</style>

      {screen === 'home' && (
        <HomeScreen
          products={products}
          onSelect={selectProduct}
          onSearch={() => setScreen('search')}
          onNew={() => setScreen('new')}
        />
      )}

      {screen === 'search' && (
        <SearchScreen
          products={products}
          onBack={() => setScreen('home')}
          onSelect={selectProduct}
        />
      )}

      {screen === 'detail' && selected && (
        <DetailScreen
          product={selected}
          onBack={() => setScreen('home')}
          onEdit={() => setScreen('edit')}
          onDelete={handleDeleted}
          onStockUpdate={handleStockUpdate}
        />
      )}

      {screen === 'new' && (
        <NewScreen
          onBack={() => setScreen('home')}
          onSaved={handleSaved}
        />
      )}

      {screen === 'edit' && selected && (
        <EditScreen
          product={selected}
          onBack={() => setScreen('detail')}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
