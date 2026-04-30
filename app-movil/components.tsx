'use client'
import React, { useState } from 'react'
import { T, stockColor, stockContainer, stockLabel } from './theme'
import { Icon } from './icons'

export function StatusBar({ dark = false, bg }: { dark?: boolean; bg?: string }) {
  const c = dark ? '#fff' : T.onSurface
  return (
    <div style={{
      height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', background: bg || 'transparent',
      fontFamily: 'Roboto, system-ui, sans-serif', fontSize: 14, fontWeight: 600, color: c,
      flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={c}>
          <path d="M8 0a8 8 0 0 1 5.66 2.34l-1.41 1.42A6 6 0 0 0 8 2a6 6 0 0 0-4.24 1.76L2.34 2.34A8 8 0 0 1 8 0zm0 4a4 4 0 0 1 2.83 1.17l-1.42 1.42A2 2 0 0 0 8 6a2 2 0 0 0-1.41.59L5.17 5.17A4 4 0 0 1 8 4zm0 4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={c}>
          <path d="M2 11h2V7H2zm4 0h2V4H6zm4 0h2V1h-2zm4 0h2V0h-2z"/>
        </svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke={c} strokeWidth="1">
          <rect x="0.5" y="0.5" width="19" height="10" rx="2"/>
          <rect x="2" y="2" width="14" height="7" rx="1" fill={c}/>
          <rect x="20" y="3.5" width="1.5" height="4" rx="0.5" fill={c}/>
        </svg>
      </div>
    </div>
  )
}

export function NavBar({ dark = false, bg }: { dark?: boolean; bg?: string }) {
  return (
    <div style={{
      height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg || 'transparent', flexShrink: 0,
    }}>
      <div style={{ width: 120, height: 4, borderRadius: 2, background: dark ? '#fff' : '#0F172A', opacity: 0.45 }} />
    </div>
  )
}

export function TopAppBar({ title, leading, trailing, dark, subtitle }: {
  title: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  dark?: boolean
  subtitle?: string
}) {
  return (
    <div style={{
      height: subtitle ? 72 : 64, display: 'flex', alignItems: 'center', gap: 4,
      padding: '0 4px', background: dark ? T.primary : T.surface,
      color: dark ? '#fff' : T.onSurface,
      fontFamily: 'Roboto, system-ui, sans-serif', flexShrink: 0,
      borderBottom: dark ? 'none' : `1px solid ${T.outlineVariant}`,
    }}>
      <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}>
        {leading}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 500, lineHeight: '28px' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, opacity: 0.85, lineHeight: '16px', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4 }}>
        {trailing}
      </div>
    </div>
  )
}

export function IconButton({ icon, color, onClick, size = 24, bg }: {
  icon: string; color?: string; onClick?: () => void; size?: number; bg?: string
}) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: 22, border: 'none', background: bg || 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
    }}>
      <Icon name={icon} color={color || 'currentColor'} size={size} />
    </button>
  )
}

export function FilledButton({ children, icon, onClick, full, color }: {
  children: React.ReactNode; icon?: string; onClick?: () => void; full?: boolean; color?: string
}) {
  return (
    <button onClick={onClick} style={{
      height: 48, padding: '0 24px', borderRadius: 24, border: 'none',
      background: color || T.primary, color: '#fff',
      fontSize: 15, fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: 'Roboto, system-ui, sans-serif',
      width: full ? '100%' : 'auto', flexShrink: 0,
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    }}>
      {icon && <Icon name={icon} size={18} color="#fff" />}
      {children}
    </button>
  )
}

export function ExtendedFAB({ children, icon, onClick }: {
  children: React.ReactNode; icon: string; onClick?: () => void
}) {
  return (
    <button onClick={onClick} style={{
      height: 56, padding: '0 20px 0 16px', borderRadius: 16, border: 'none',
      background: T.primary, color: '#fff',
      fontSize: 15, fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'Roboto, system-ui, sans-serif',
      boxShadow: '0 4px 12px rgba(30,58,138,0.35)',
    }}>
      <Icon name={icon} size={22} color="#fff" />
      {children}
    </button>
  )
}

export function Chip({ children, selected, color, fg, leading, onClick }: {
  children: React.ReactNode; selected?: boolean; color?: string; fg?: string
  leading?: React.ReactNode; onClick?: () => void
}) {
  return (
    <div onClick={onClick} style={{
      height: 32, padding: leading ? '0 12px 0 8px' : '0 12px',
      borderRadius: 8,
      border: selected ? 'none' : `1px solid ${T.outline}`,
      background: selected ? (color || T.primaryContainer) : 'transparent',
      color: selected ? (fg || T.onPrimaryContainer) : T.onSurfaceVariant,
      fontSize: 13, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'Roboto, system-ui, sans-serif', whiteSpace: 'nowrap', flexShrink: 0,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {leading}
      {children}
    </div>
  )
}

export function TextField({ label, value, onChange, placeholder, supporting, error, leading, trailing, multiline, type = 'text' }: {
  label: string; value?: string; onChange?: (v: string) => void; placeholder?: string
  supporting?: string; error?: string; leading?: React.ReactNode; trailing?: React.ReactNode
  multiline?: boolean; type?: string
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = (value ?? '').length > 0
  const floating = focused || hasValue
  const borderColor = error ? T.error : focused ? T.primary : T.outline
  const labelColor = error ? T.error : focused ? T.primary : T.onSurfaceMuted

  return (
    <div>
      <div style={{
        position: 'relative',
        minHeight: multiline ? 96 : 56,
        border: `${focused ? 2 : 1}px solid ${borderColor}`,
        borderRadius: 8,
        padding: multiline ? '20px 16px 8px' : '0 16px',
        display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 12,
        background: T.surface,
      }}>
        <span style={{
          position: 'absolute',
          left: leading ? 52 : 16,
          top: floating ? (multiline ? 6 : -10) : (multiline ? 14 : '50%'),
          transform: floating ? 'none' : (multiline ? 'none' : 'translateY(-50%)'),
          fontSize: floating ? 12 : 16,
          color: labelColor,
          background: T.surface,
          padding: floating ? '0 4px' : '0',
          transition: 'all .15s',
          fontFamily: 'Roboto, system-ui, sans-serif',
          pointerEvents: 'none',
          zIndex: 1,
          lineHeight: '16px',
        }}>{label}</span>

        {leading && <div style={{ color: T.onSurfaceMuted, flexShrink: 0 }}>{leading}</div>}

        <div style={{ flex: 1, paddingTop: multiline ? 4 : floating ? 10 : 0 }}>
          {multiline ? (
            <textarea
              value={value ?? ''}
              onChange={e => onChange?.(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={floating ? placeholder : undefined}
              rows={3}
              style={{
                width: '100%', fontSize: 16, color: T.onSurface,
                fontFamily: 'Roboto, system-ui, sans-serif',
                border: 'none', outline: 'none', resize: 'none', background: 'transparent',
              }}
            />
          ) : (
            <input
              type={type}
              value={value ?? ''}
              onChange={e => onChange?.(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={floating ? placeholder : undefined}
              style={{
                width: '100%', fontSize: 16, color: T.onSurface,
                fontFamily: 'Roboto, system-ui, sans-serif',
                border: 'none', outline: 'none', background: 'transparent',
              }}
            />
          )}
        </div>

        {trailing && <div style={{ color: T.onSurfaceMuted, flexShrink: 0 }}>{trailing}</div>}
      </div>
      {(error || supporting) && (
        <div style={{
          fontSize: 12, color: error ? T.error : T.onSurfaceMuted,
          padding: '4px 16px 0', fontFamily: 'Roboto, system-ui, sans-serif',
        }}>{error || supporting}</div>
      )}
    </div>
  )
}

export function BottomNav({ active = 'home', onNavigate }: {
  active?: string; onNavigate?: (id: string) => void
}) {
  const items = [
    { id: 'home', icon: 'inventory', label: 'Inventario' },
    { id: 'history', icon: 'history', label: 'Movimientos' },
    { id: 'chart', icon: 'chart', label: 'Reportes' },
    { id: 'settings', icon: 'settings', label: 'Ajustes' },
  ]
  return (
    <div style={{
      height: 80, background: T.surfaceContainer, display: 'flex',
      borderTop: `1px solid ${T.outlineVariant}`, flexShrink: 0,
      paddingTop: 12, paddingBottom: 16,
    }}>
      {items.map(it => (
        <div key={it.id} onClick={() => onNavigate?.(it.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          cursor: 'pointer',
        }}>
          <div style={{
            height: 32, width: 64, borderRadius: 16,
            background: active === it.id ? T.primaryContainer : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={it.icon} size={22} color={active === it.id ? T.primary : T.onSurfaceVariant} />
          </div>
          <div style={{
            fontSize: 12, fontWeight: active === it.id ? 600 : 500,
            color: active === it.id ? T.primary : T.onSurfaceVariant,
            fontFamily: 'Roboto, system-ui, sans-serif',
          }}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: T.primary, letterSpacing: 0.8,
      margin: '0 0 12px', fontFamily: 'Roboto, system-ui, sans-serif',
    }}>{children}</div>
  )
}

export function StockBadge({ stock }: { stock: number }) {
  const c = stockColor(stock)
  const bg = stockContainer(stock)
  const lbl = stockLabel(stock)
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 10, background: bg, color: c,
      fontSize: 13, fontWeight: 600,
    }}>
      <Icon name={stock <= 0 ? 'error' : stock <= 5 ? 'warning' : 'check'} size={14} color={c} />
      {lbl}
    </div>
  )
}

export function DeleteConfirmSheet({ productName, onConfirm, onCancel }: {
  productName: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', zIndex: 50,
    }}>
      <div style={{
        width: '100%', background: T.surface, borderRadius: '24px 24px 0 0',
        padding: '24px 24px 32px',
      }}>
        <div style={{ width: 32, height: 4, borderRadius: 2, background: T.outline, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 24, background: T.errorContainer,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="delete" size={22} color={T.error} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.onSurface }}>Eliminar producto</div>
            <div style={{ fontSize: 14, color: T.onSurfaceMuted, marginTop: 4 }}>
              ¿Eliminar <b style={{ color: T.onSurface }}>{productName}</b>? Esta acción no se puede deshacer.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, height: 48, borderRadius: 24, border: `1px solid ${T.outline}`,
            background: 'transparent', color: T.onSurface, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancelar</button>
          <button onClick={onConfirm} style={{
            flex: 1, height: 48, borderRadius: 24, border: 'none',
            background: T.error, color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}
