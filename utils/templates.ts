export interface Template {
  id: string
  name: string
  description: string
  styles: {
    headerBg: string
    headerText: string
    accentColor: string
    borderColor: string
    backgroundColor: string
  }
}

export const templates: Record<string, Template> = {
  modern: {
    id: "modern",
    name: "Moderno",
    description: "Diseño limpio y profesional",
    styles: {
      headerBg: "bg-gradient-to-r from-blue-600 to-indigo-700",
      headerText: "text-white",
      accentColor: "text-blue-600",
      borderColor: "border-blue-200",
      backgroundColor: "bg-blue-50",
    },
  },
  classic: {
    id: "classic",
    name: "Clásico",
    description: "Estilo tradicional y formal",
    styles: {
      headerBg: "bg-gray-800",
      headerText: "text-white",
      accentColor: "text-gray-700",
      borderColor: "border-gray-300",
      backgroundColor: "bg-gray-50",
    },
  },
  minimal: {
    id: "minimal",
    name: "Minimalista",
    description: "Diseño simple y elegante",
    styles: {
      headerBg: "bg-white border-b-2 border-gray-200",
      headerText: "text-gray-800",
      accentColor: "text-gray-600",
      borderColor: "border-gray-200",
      backgroundColor: "bg-white",
    },
  },
  colorful: {
    id: "colorful",
    name: "Colorido",
    description: "Vibrante y llamativo",
    styles: {
      headerBg: "bg-gradient-to-r from-purple-600 to-pink-600",
      headerText: "text-white",
      accentColor: "text-purple-600",
      borderColor: "border-purple-200",
      backgroundColor: "bg-purple-50",
    },
  },
}

export function getTemplate(id: string): Template {
  return templates[id] || templates.modern
}
