"use client"
import { AlertTriangle, X, AlertCircle } from "lucide-react"
import type { ValidationError } from "../utils/validation"

interface ValidationAlertProps {
  errors: ValidationError[]
  onClose: () => void
}

export function ValidationAlert({ errors, onClose }: ValidationAlertProps) {
  const errorCount = errors.filter((e) => e.type === "error").length
  const warningCount = errors.filter((e) => e.type === "warning").length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Errores de Validación</h3>
              <p className="text-sm text-gray-600">
                {errorCount} error(es) y {warningCount} advertencia(s) encontradas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          <div className="space-y-3">
            {errors.map((error, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  error.type === "error" ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    error.type === "error" ? "text-red-500" : "text-yellow-500"
                  }`}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${error.type === "error" ? "text-red-800" : "text-yellow-800"}`}>
                    {error.message}
                  </p>
                  <p className={`text-xs mt-1 ${error.type === "error" ? "text-red-600" : "text-yellow-600"}`}>
                    Campo: {error.field}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
