"use client"
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex h-screen">
          {/* Panel lateral */}
          <div className="w-56 bg-gray-900 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h1 className="text-sm font-bold text-blue-400">🔧 Mecatrónica</h1>
              <p className="text-xs text-gray-400">Sistema de Gestión</p>
            </div>
            <nav className="flex-1 p-3">
              <button
                onClick={() => router.push('/')}
                className={`w-full text-left px-3 py-2 rounded mb-1 text-sm flex items-center gap-2 ${
                  pathname === '/' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                🧾 Facturación
              </button>
              <button
                onClick={() => router.push('/inventario')}
                className={`w-full text-left px-3 py-2 rounded mb-1 text-sm flex items-center gap-2 ${
                  pathname === '/inventario' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                📦 Inventario
              </button>
            </nav>
            <div className="p-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}