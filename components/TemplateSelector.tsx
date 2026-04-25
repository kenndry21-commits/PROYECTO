"use client"
import { X, Check } from "lucide-react"

interface TemplateSelectorProps {
  selectedTemplate: string
  onSelect: (template: string) => void
  onClose: () => void
}

const templates = [
  {
    id: "modern",
    name: "Moderno",
    description: "Diseño limpio y profesional",
    preview: "bg-gradient-to-br from-blue-50 to-indigo-100",
  },
  {
    id: "classic",
    name: "Clásico",
    description: "Estilo tradicional y formal",
    preview: "bg-gradient-to-br from-gray-50 to-gray-100",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Diseño simple y elegante",
    preview: "bg-gradient-to-br from-white to-gray-50",
  },
  {
    id: "colorful",
    name: "Colorido",
    description: "Vibrante y llamativo",
    preview: "bg-gradient-to-br from-purple-50 to-pink-100",
  },
]

export function TemplateSelector({ selectedTemplate, onSelect, onClose }: TemplateSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-pink-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Seleccionar Plantilla</h3>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onSelect(template.id)}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2">
                <div className="bg-pink-500 text-white rounded-full p-1">
                  <Check size={12} />
                </div>
              </div>
            )}

            <div className={`h-20 rounded-lg mb-3 ${template.preview}`} />

            <h4 className="font-semibold text-gray-800 mb-1">{template.name}</h4>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
