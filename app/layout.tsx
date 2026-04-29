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
  const [collapsed, setCollapsed] = useState(false)

  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex h-screen">
          {/* Panel lateral */}
          <div
            className={`bg-gray-900 text-white flex flex-col flex-shrink-0 transition-all duration-300 ${
              collapsed ? "w-14" : "w-56"
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b border-gray-700 flex items-center ${
                collapsed ? "justify-center" : "gap-2"
              }`}
            >
              <span className="text-xl leading-none">🔧</span>
              {!collapsed && (
                <div>
                  <h1 className="text-sm font-bold text-blue-400">Mecatrónica</h1>
                  <p className="text-xs text-gray-400">Sistema de Gestión</p>
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-2">
              <button
                onClick={() => router.push("/")}
                title={collapsed ? "Facturación" : undefined}
                className={`w-full px-3 py-2 rounded mb-1 text-sm flex items-center gap-2 transition-colors ${
                  collapsed ? "justify-center" : "text-left"
                } ${
                  pathname === "/"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="text-base leading-none">🧾</span>
                {!collapsed && <span>Facturación</span>}
              </button>
              <button
                onClick={() => router.push("/inventario")}
                title={collapsed ? "Inventario" : undefined}
                className={`w-full px-3 py-2 rounded mb-1 text-sm flex items-center gap-2 transition-colors ${
                  collapsed ? "justify-center" : "text-left"
                } ${
                  pathname === "/inventario"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span className="text-base leading-none">📦</span>
                {!collapsed && <span>Inventario</span>}
              </button>
            </nav>

            {/* Footer con botón de colapsar */}
            <div
              className={`p-3 border-t border-gray-700 flex items-center ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!collapsed && <p className="text-xs text-gray-500">v1.0.0</p>}
              <button
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? "Expandir panel" : "Colapsar panel"}
                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-sm font-bold"
              >
                {collapsed ? "→" : "←"}
              </button>
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
