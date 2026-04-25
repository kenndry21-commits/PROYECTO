"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Car,
  Settings,
  Plus,
  Calculator,
  Save,
  Archive,
  Copy,
  Eye,
  Trash2,
  Download,
  FileSpreadsheet,
  Wrench,
  Edit,
  X,
  Search,
  Filter,
  FileText,
  Palette,
  Package,
  User,
  ChevronDown,
  ChevronUp,
  Printer,
  FileIcon as FilePdf,
  AlertCircle,
  Check,
} from "lucide-react"

import { ProfessionalInvoicePreview } from "../components/ProfessionalInvoicePreview"
import type { GeneralInfo, InvoiceItem, Service, Totals, SavedInvoice, Vehicle, VehicleTotals } from "../types/invoice"
import {
  generateTXTContent,
  generateCSVData,
  generatePDF,
  downloadFile,
  openPrintWindow,
  generatePDFFromHTML,
  generatePDFWithJsPDF,
} from "../utils/invoiceGenerator"
import { formatCurrency } from "../utils/formatters"
import { validateInvoice, type ValidationError } from "../utils/validation"
import {
  saveInvoice,
  updateInvoice,
  getStoredInvoices,
  deleteInvoice,
  generateInvoiceNumber,
  getInvoiceStats,
} from "../utils/storage"
import { ValidationAlert } from "../components/ValidationAlert"
import { TemplateSelector } from "../components/TemplateSelector"

export default function App() {
  // Estados principales
  const [infoGeneral, setInfoGeneral] = useState<GeneralInfo>({
    tipoDocumento: "factura",
    numeroFactura: "",
    ncf: "",
    fecha: new Date().toISOString().split("T")[0],
    nombreCliente: "",
    rnc: "",
    direccion: "",
    telefono: "",
    observaciones: "",
  })

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [servicios, setServicios] = useState<Service[]>([])
  const [showFacturasGuardadas, setShowFacturasGuardadas] = useState(false)
  const [facturasSaved, setFacturasSaved] = useState<SavedInvoice[]>([])
  const [editingFactura, setEditingFactura] = useState<SavedInvoice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("todos")
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set())

  // Nuevos estados para las mejoras
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showValidationAlert, setShowValidationAlert] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfError, setPdfError] = useState<string>("")
  const [itbisEnabled, setItbisEnabled] = useState(true)

  // Estados para edición inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editingItemData, setEditingItemData] = useState<Partial<InvoiceItem>>({})
  const [editingServiceData, setEditingServiceData] = useState<Partial<Service>>({})

  // Estados para formularios
  const [vehicle, setVehicle] = useState({
    marca: "",
    modelo: "",
    ano: "",
    color: "",
    placa: "",
    vin: "",
    observaciones: "",
  })

  const [item, setItem] = useState({
    nombre: "",
    descripcion: "",
    unidad: "",
    precio: "",
  })

  const [servicio, setServicio] = useState({
    descripcion: "",
    precio: "",
  })

  // Cargar facturas guardadas al iniciar
  useEffect(() => {
    setFacturasSaved(getStoredInvoices())
  }, [])

  // Calcular totales por vehículo y total general
  const calculateTotals = (): Totals => {
    const vehicleTotals: VehicleTotals[] = vehicles.map((vehicle) => {
      const vehicleItems = items.filter((item) => item.vehicleId === vehicle.id)
      const vehicleServices = servicios.filter((service) => service.vehicleId === vehicle.id)

      const subtotal =
        vehicleItems.reduce((sum, item) => sum + item.precio * item.unidad, 0) +
        vehicleServices.reduce((sum, service) => sum + service.precio, 0)

      const itbis = itbisEnabled ? subtotal * 0.18 : 0
      const total = subtotal + itbis

      return {
        vehicleId: vehicle.id,
        subtotal,
        itbis,
        total,
      }
    })

    const totalSubtotal = vehicleTotals.reduce((sum, vt) => sum + vt.subtotal, 0)
    const totalItbis = vehicleTotals.reduce((sum, vt) => sum + vt.itbis, 0)
    const totalGeneral = vehicleTotals.reduce((sum, vt) => sum + vt.total, 0)

    return {
      subtotal: totalSubtotal,
      itbis: totalItbis,
      total: totalGeneral,
      vehicleTotals,
    }
  }

  const totales = calculateTotals()

  // Funciones para manejar vehículos
  const agregarVehicle = () => {
    if (vehicle.marca && vehicle.modelo && vehicle.ano && vehicle.placa) {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        ano: vehicle.ano,
        color: vehicle.color,
        placa: vehicle.placa,
        vin: vehicle.vin,
        observaciones: vehicle.observaciones,
      }
      setVehicles([...vehicles, newVehicle])
      setVehicle({ marca: "", modelo: "", ano: "", color: "", placa: "", vin: "", observaciones: "" })
      // Seleccionar automáticamente el nuevo vehículo
      setSelectedVehicleId(newVehicle.id)
      // Expandir el nuevo vehículo
      setExpandedVehicles((prev) => new Set([...prev, newVehicle.id]))
    }
  }

  const eliminarVehicle = (id: string) => {
    // Eliminar también todos los items y servicios asociados
    setItems(items.filter((item) => item.vehicleId !== id))
    setServicios(servicios.filter((service) => service.vehicleId !== id))
    setVehicles(vehicles.filter((v) => v.id !== id))
    // Si era el vehículo seleccionado, seleccionar otro o ninguno
    if (selectedVehicleId === id) {
      const remainingVehicles = vehicles.filter((v) => v.id !== id)
      setSelectedVehicleId(remainingVehicles.length > 0 ? remainingVehicles[0].id : "")
    }
    // Remover de expandidos
    setExpandedVehicles((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const actualizarVehicle = (id: string, field: string, value: string) => {
    setVehicles(vehicles.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  // Funciones para manejar items
  const agregarItem = () => {
    if (item.nombre && item.descripcion && item.unidad && item.precio) {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        vehicleId: selectedVehicleId || "default", // Usar "default" si no hay vehículo
        nombre: item.nombre,
        descripcion: item.descripcion,
        unidad: Number.parseFloat(item.unidad),
        precio: Number.parseFloat(item.precio),
      }
      setItems([...items, newItem])
      setItem({ nombre: "", descripcion: "", unidad: "", precio: "" })
    }
  }

  const eliminarItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id))
    // Cancelar edición si se está editando este item
    if (editingItemId === id) {
      setEditingItemId(null)
      setEditingItemData({})
    }
  }

  const actualizarItem = (id: string, field: string, value: any) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }

  // Funciones para edición inline de items
  const iniciarEdicionItem = (item: InvoiceItem) => {
    setEditingItemId(item.id)
    setEditingItemData({
      nombre: item.nombre,
      descripcion: item.descripcion,
      unidad: item.unidad,
      precio: item.precio,
    })
  }

  const guardarEdicionItem = () => {
    if (editingItemId && editingItemData) {
      setItems(
        items.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                nombre: editingItemData.nombre || item.nombre,
                descripcion: editingItemData.descripcion || item.descripcion,
                unidad: editingItemData.unidad || item.unidad,
                precio: editingItemData.precio || item.precio,
              }
            : item,
        ),
      )
      cancelarEdicionItem()
    }
  }

  const cancelarEdicionItem = () => {
    setEditingItemId(null)
    setEditingItemData({})
  }

  // Funciones para manejar servicios
  const agregarServicio = () => {
    if (servicio.descripcion && servicio.precio) {
      const newService: Service = {
        id: Date.now().toString(),
        vehicleId: selectedVehicleId || "default", // Usar "default" si no hay vehículo
        descripcion: servicio.descripcion,
        precio: Number.parseFloat(servicio.precio),
      }
      setServicios([...servicios, newService])
      setServicio({ descripcion: "", precio: "" })
    }
  }

  const eliminarServicio = (id: string) => {
    setServicios(servicios.filter((s) => s.id !== id))
    // Cancelar edición si se está editando este servicio
    if (editingServiceId === id) {
      setEditingServiceId(null)
      setEditingServiceData({})
    }
  }

  const actualizarServicio = (id: string, field: string, value: any) => {
    setServicios(servicios.map((s) => (s.id === id ? { ...s, ...value } : s)))
  }

  // Funciones para edición inline de servicios
  const iniciarEdicionServicio = (servicio: Service) => {
    setEditingServiceId(servicio.id)
    setEditingServiceData({
      descripcion: servicio.descripcion,
      precio: servicio.precio,
    })
  }

  const guardarEdicionServicio = () => {
    if (editingServiceId && editingServiceData) {
      setServicios(
        servicios.map((servicio) =>
          servicio.id === editingServiceId
            ? {
                ...servicio,
                descripcion: editingServiceData.descripcion || servicio.descripcion,
                precio: editingServiceData.precio || servicio.precio,
              }
            : servicio,
        ),
      )
      cancelarEdicionServicio()
    }
  }

  const cancelarEdicionServicio = () => {
    setEditingServiceId(null)
    setEditingServiceData({})
  }

  // Funciones para facturas guardadas
  const guardarFactura = () => {
    // Validar antes de guardar
    const errors = validateInvoice(infoGeneral, vehicles, items, servicios)
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      return
    }

    if (editingFactura) {
      const updated = updateInvoice(
        editingFactura.id,
        infoGeneral,
        vehicles,
        items,
        servicios,
        totales,
        selectedTemplate,
      )
      if (updated) {
        setFacturasSaved(getStoredInvoices())
        alert("Factura actualizada exitosamente")
      }
    } else {
      const saved = saveInvoice(infoGeneral, vehicles, items, servicios, totales, selectedTemplate)
      setFacturasSaved(getStoredInvoices())
      alert("Factura guardada exitosamente")
    }
  }

  const cargarFactura = (factura: SavedInvoice) => {
    setInfoGeneral(factura.infoGeneral)
    setVehicles(factura.vehicles || [])
    setItems(factura.items)
    setServicios(factura.servicios)
    setEditingFactura(factura)
    setShowFacturasGuardadas(false)
    // Seleccionar el primer vehículo si existe
    if (factura.vehicles && factura.vehicles.length > 0) {
      setSelectedVehicleId(factura.vehicles[0].id)
      setExpandedVehicles(new Set(factura.vehicles.map((v) => v.id)))
    }
  }

  const eliminarFacturaGuardada = (id: string) => {
    if (deleteInvoice(id)) {
      setFacturasSaved(getStoredInvoices())
    }
  }

  // Filtrar facturas
  const facturasFiltradas = facturasSaved.filter((factura) => {
    const matchesSearch =
      factura.infoGeneral.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.infoGeneral.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "todos" || factura.infoGeneral.tipoDocumento === filterType
    return matchesSearch && matchesType
  })

  // Funciones de utilidad
  const limpiarFormulario = () => {
    setInfoGeneral({
      tipoDocumento: "factura",
      numeroFactura: "",
      ncf: "",
      fecha: new Date().toISOString().split("T")[0],
      nombreCliente: "",
      rnc: "",
      direccion: "",
      telefono: "",
      observaciones: "",
    })
    setVehicles([])
    setItems([])
    setServicios([])
    setSelectedVehicleId("")
    setExpandedVehicles(new Set())
    setEditingFactura(null)
    setPdfError("")
    // Cancelar cualquier edición en curso
    cancelarEdicionItem()
    cancelarEdicionServicio()
  }

  const generarNumeroFactura = () => {
    const numero = generateInvoiceNumber()
    setInfoGeneral({ ...infoGeneral, numeroFactura: numero })
  }

  const copiarFactura = () => {
    let resumen = `FACTURA: ${infoGeneral.numeroFactura}
CLIENTE: ${infoGeneral.nombreCliente}
FECHA: ${infoGeneral.fecha}
TOTAL GENERAL: ${formatCurrency(totales.total)}

`

    vehicles.forEach((vehicle) => {
      const vehicleItems = items.filter((item) => item.vehicleId === vehicle.id)
      const vehicleServices = servicios.filter((service) => service.vehicleId === vehicle.id)
      const vehicleTotal = totales.vehicleTotals.find((vt) => vt.vehicleId === vehicle.id)

      resumen += `VEHÍCULO: ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano} - Placa: ${vehicle.placa}
ITEMS:
${vehicleItems.map((it) => `- ${it.nombre}: ${formatCurrency(it.precio * it.unidad)}`).join("\n")}
SERVICIOS:
${vehicleServices.map((s) => `- ${s.descripcion}: ${formatCurrency(s.precio)}`).join("\n")}
TOTAL VEHÍCULO: ${formatCurrency(vehicleTotal?.total || 0)}

`
    })

    navigator.clipboard.writeText(resumen.trim())
    alert("Resumen copiado al portapapeles")
  }

  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === "Enter") {
      callback()
    }
  }

  // Funciones de exportación mejoradas
  const descargarPDFReal = async () => {
    const errors = validateInvoice(infoGeneral, vehicles, items, servicios)
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      return
    }

    setIsGeneratingPDF(true)
    setPdfError("")

    try {
      console.log("Iniciando generación de PDF avanzado...")
      await generatePDFFromHTML(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
      console.log("PDF generado exitosamente")
    } catch (error) {
      console.error("Error con método avanzado, probando jsPDF:", error)
      setPdfError(`Error con método avanzado: ${error.message}`)
      try {
        console.log("Intentando con jsPDF...")
        await generatePDFWithJsPDF(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
        console.log("PDF con jsPDF generado exitosamente")
        setPdfError("")
      } catch (jsPDFError) {
        console.error("Error con jsPDF, usando ventana de impresión:", jsPDFError)
        setPdfError(`Error con jsPDF: ${jsPDFError.message}. Usando método de impresión...`)
        try {
          openPrintWindow(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
          setPdfError("")
        } catch (printError) {
          console.error("Error con todos los métodos:", printError)
          setPdfError(`Error: No se pudo generar el PDF. ${printError.message}`)
        }
      }
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const descargarPDF = async () => {
    const errors = validateInvoice(infoGeneral, vehicles, items, servicios)
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      return
    }

    try {
      setPdfError("")
      openPrintWindow(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setPdfError(`Error al generar PDF: ${error.message}`)
    }
  }

  const descargarHTML = async () => {
    const errors = validateInvoice(infoGeneral, vehicles, items, servicios)
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      return
    }

    try {
      const htmlBlob = await generatePDF(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
      downloadFile(htmlBlob, `${infoGeneral.tipoDocumento}_${infoGeneral.numeroFactura}.html`, "text/html")
    } catch (error) {
      console.error("Error generating HTML:", error)
      alert("Error al generar el HTML. Por favor, intente nuevamente.")
    }
  }

  const descargarTXT = () => {
    const errors = validateInvoice(infoGeneral, vehicles, items, servicios)
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      return
    }

    const content = generateTXTContent(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
    downloadFile(content, `${infoGeneral.tipoDocumento}_${infoGeneral.numeroFactura}.txt`, "text/plain")
  }

  const descargarCSV = () => {
    const errors = validateInvoice(infoGeneral, vehicles, items, servicios)
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      return
    }

    const csvContent = generateCSVData(infoGeneral, vehicles, items, servicios)
    downloadFile(csvContent, `${infoGeneral.tipoDocumento}_${infoGeneral.numeroFactura}.csv`, "text/csv")
  }

  const toggleVehicleExpansion = (vehicleId: string) => {
    setExpandedVehicles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(vehicleId)) {
        newSet.delete(vehicleId)
      } else {
        newSet.add(vehicleId)
      }
      return newSet
    })
  }

  const stats = useMemo(() => getInvoiceStats(), [facturasSaved])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Alerta de validación */}
      {showValidationAlert && (
        <ValidationAlert
          errors={validationErrors}
          onClose={() => {
            setShowValidationAlert(false)
            setValidationErrors([])
          }}
        />
      )}

      {/* Alerta de error de PDF */}
      {pdfError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error en generación de PDF</h3>
                <p className="text-sm text-red-700 mt-1">{pdfError}</p>
              </div>
              <button onClick={() => setPdfError("")} className="ml-3 text-red-400 hover:text-red-600">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header mejorado */}
        <div className="bg-white shadow-xl p-6 rounded-lg border-l-4 border-blue-500 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-2xl border-2 border-blue-300">
                    <div className="relative">
                      <Car className="h-10 w-10 text-white" />
                      <Settings className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1" />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Taller Automotriz Mecatrónica</h1>
                <p className="text-gray-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Sistema de Facturación Multi-Vehículo
                </p>
                {editingFactura && (
                  <p className="text-sm text-blue-600 font-medium">
                    ✏️ Editando: {infoGeneral.tipoDocumento} #{infoGeneral.numeroFactura}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={guardarFactura}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Save size={20} />
                {editingFactura ? "Actualizar" : "Guardar"}
              </button>
              <button
                onClick={() => setShowFacturasGuardadas(!showFacturasGuardadas)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Archive size={20} />
                Facturas ({facturasSaved.length})
              </button>
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Palette size={20} />
                Plantilla
              </button>
              <button
                onClick={limpiarFormulario}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={20} />
                Limpiar
              </button>
              <button
                onClick={() => setItbisEnabled(!itbisEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  itbisEnabled
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
                title={`${itbisEnabled ? "Desactivar" : "Activar"} ITBIS (18%)`}
              >
                <Calculator size={20} />
                ITBIS {itbisEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* Selector de plantillas */}
        {showTemplateSelector && (
          <div className="mb-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
              onClose={() => setShowTemplateSelector(false)}
            />
          </div>
        )}

        {/* Panel de Facturas Guardadas */}
        {showFacturasGuardadas && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Archive size={20} />
                Facturas Guardadas ({facturasFiltradas.length})
              </h2>
              <button
                onClick={() => setShowFacturasGuardadas(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por número de factura o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="factura">Facturas</option>
                  <option value="cotizacion">Cotizaciones</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {facturasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Archive size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No se encontraron facturas</p>
                </div>
              ) : (
                facturasFiltradas.map((factura) => (
                  <div
                    key={factura.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              factura.infoGeneral.tipoDocumento === "factura"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {factura.infoGeneral.tipoDocumento === "factura" ? "📄 FACTURA" : "✅ COTIZACIÓN"}
                          </span>
                          <span className="font-semibold text-gray-800">#{factura.infoGeneral.numeroFactura}</span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {factura.vehicles?.length || 0} vehículo(s)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <strong>Cliente:</strong> {factura.infoGeneral.nombreCliente}
                          </div>
                          <div>
                            <strong>Fecha:</strong> {factura.infoGeneral.fecha}
                          </div>
                          <div>
                            <strong>Total:</strong> {formatCurrency(factura.totales.total)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => cargarFactura(factura)}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          title="Editar factura"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("¿Está seguro de que desea eliminar esta factura?")) {
                              eliminarFacturaGuardada(factura.id)
                            }
                          }}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Eliminar factura"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="flex gap-6">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FileText size={20} />
                Información General
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoDocumento"
                      value="factura"
                      checked={infoGeneral.tipoDocumento === "factura"}
                      onChange={(e) =>
                        setInfoGeneral({
                          ...infoGeneral,
                          tipoDocumento: e.target.value as "factura" | "cotizacion",
                        })
                      }
                      className="mr-2"
                    />
                    📄 Factura
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoDocumento"
                      value="cotizacion"
                      checked={infoGeneral.tipoDocumento === "cotizacion"}
                      onChange={(e) =>
                        setInfoGeneral({
                          ...infoGeneral,
                          tipoDocumento: e.target.value as "factura" | "cotizacion",
                        })
                      }
                      className="mr-2"
                    />
                    ✅ Cotización
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de {infoGeneral.tipoDocumento}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={infoGeneral.numeroFactura}
                      onChange={(e) => setInfoGeneral({ ...infoGeneral, numeroFactura: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: F2025-0001"
                    />
                    <button
                      onClick={generarNumeroFactura}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      title="Generar número automático"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {infoGeneral.tipoDocumento === "factura" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NCF</label>
                    <input
                      type="text"
                      value={infoGeneral.ncf || ""}
                      onChange={(e) => setInfoGeneral({ ...infoGeneral, ncf: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: B0100000008"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={infoGeneral.fecha}
                    onChange={(e) => setInfoGeneral({ ...infoGeneral, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={18} />
                  Información del Cliente
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                    <input
                      type="text"
                      value={infoGeneral.nombreCliente}
                      onChange={(e) => setInfoGeneral({ ...infoGeneral, nombreCliente: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre completo del cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RNC/Cédula</label>
                    <input
                      type="text"
                      value={infoGeneral.rnc}
                      onChange={(e) => setInfoGeneral({ ...infoGeneral, rnc: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000-0000000-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      value={infoGeneral.direccion}
                      onChange={(e) => setInfoGeneral({ ...infoGeneral, direccion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dirección completa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={infoGeneral.telefono}
                      onChange={(e) => setInfoGeneral({ ...infoGeneral, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="809-000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones Generales</label>
                <textarea
                  value={infoGeneral.observaciones || ""}
                  onChange={(e) => setInfoGeneral({ ...infoGeneral, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observaciones generales de la factura..."
                />
              </div>
            </div>

            {/* Gestión de Vehículos */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-blue-500">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Car size={20} />
                Gestión de Vehículos
              </h2>

              {/* Formulario para agregar vehículo */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar Nuevo Vehículo</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <input
                      type="text"
                      value={vehicle.marca}
                      onChange={(e) => setVehicle({ ...vehicle, marca: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Toyota, Honda, etc."
                      onKeyPress={(e) => handleKeyPress(e, agregarVehicle)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                    <input
                      type="text"
                      value={vehicle.modelo}
                      onChange={(e) => setVehicle({ ...vehicle, modelo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Corolla, Civic, etc."
                      onKeyPress={(e) => handleKeyPress(e, agregarVehicle)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                    <input
                      type="text"
                      value={vehicle.ano}
                      onChange={(e) => setVehicle({ ...vehicle, ano: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2020"
                      onKeyPress={(e) => handleKeyPress(e, agregarVehicle)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={vehicle.color}
                      onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Blanco, Negro, etc."
                      onKeyPress={(e) => handleKeyPress(e, agregarVehicle)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                    <input
                      type="text"
                      value={vehicle.placa}
                      onChange={(e) => setVehicle({ ...vehicle, placa: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="A123456"
                      onKeyPress={(e) => handleKeyPress(e, agregarVehicle)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIN (Opcional)</label>
                    <input
                      type="text"
                      value={vehicle.vin}
                      onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1HGBH41JXMN109186"
                      onKeyPress={(e) => handleKeyPress(e, agregarVehicle)}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones del Vehículo</label>
                  <textarea
                    value={vehicle.observaciones}
                    onChange={(e) => setVehicle({ ...vehicle, observaciones: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Observaciones específicas del vehículo..."
                  />
                </div>
                <button
                  onClick={agregarVehicle}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Agregar Vehículo
                </button>
              </div>

              {/* Lista de vehículos */}
              <div className="space-y-4">
                {vehicles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Car size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No hay vehículos agregados</p>
                    <p className="text-sm">Agregue al menos un vehículo para continuar</p>
                  </div>
                ) : (
                  vehicles.map((vehicle) => {
                    const vehicleItems = items.filter((item) => item.vehicleId === vehicle.id)
                    const vehicleServices = servicios.filter((service) => service.vehicleId === vehicle.id)
                    const vehicleTotal = totales.vehicleTotals.find((vt) => vt.vehicleId === vehicle.id)
                    const isExpanded = expandedVehicles.has(vehicle.id)
                    const isSelected = selectedVehicleId === vehicle.id

                    return (
                      <div
                        key={vehicle.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleVehicleExpansion(vehicle.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Placa: {vehicle.placa} | Color: {vehicle.color}
                                {vehicle.vin && ` | VIN: ${vehicle.vin}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(vehicleTotal?.total || 0)}
                            </span>
                            <button
                              onClick={() => setSelectedVehicleId(vehicle.id)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {isSelected ? "Seleccionado" : "Seleccionar"}
                            </button>
                            <button
                              onClick={() => eliminarVehicle(vehicle.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Eliminar vehículo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t pt-3 mt-3">
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                <input
                                  type="text"
                                  value={vehicle.marca}
                                  onChange={(e) => actualizarVehicle(vehicle.id, "marca", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                                <input
                                  type="text"
                                  value={vehicle.modelo}
                                  onChange={(e) => actualizarVehicle(vehicle.id, "modelo", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                                <input
                                  type="text"
                                  value={vehicle.ano}
                                  onChange={(e) => actualizarVehicle(vehicle.id, "ano", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <input
                                  type="text"
                                  value={vehicle.color}
                                  onChange={(e) => actualizarVehicle(vehicle.id, "color", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                                <input
                                  type="text"
                                  value={vehicle.placa}
                                  onChange={(e) => actualizarVehicle(vehicle.id, "placa", e.target.value.toUpperCase())}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                                <input
                                  type="text"
                                  value={vehicle.vin || ""}
                                  onChange={(e) => actualizarVehicle(vehicle.id, "vin", e.target.value.toUpperCase())}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                              <textarea
                                value={vehicle.observaciones || ""}
                                onChange={(e) => actualizarVehicle(vehicle.id, "observaciones", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                              />
                            </div>
                            {/* Resumen del vehículo */}
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Items: {vehicleItems.length} | Servicios: {vehicleServices.length}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    Subtotal: {formatCurrency(vehicleTotal?.subtotal || 0)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    ITBIS {itbisEnabled ? "(18%)" : "(0%)"}: {formatCurrency(vehicleTotal?.itbis || 0)}
                                  </p>
                                  <p className="font-semibold text-green-600">
                                    Total: {formatCurrency(vehicleTotal?.total || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Items Section - SIEMPRE VISIBLE con funcionalidad de edición */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package size={18} />
                  Repuestos y Partes
                  {selectedVehicleId && (
                    <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {vehicles.find((v) => v.id === selectedVehicleId)?.marca}{" "}
                      {vehicles.find((v) => v.id === selectedVehicleId)?.placa}
                    </span>
                  )}
                </h3>
              </div>

              <div className="grid md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del repuesto"
                    value={item.nombre}
                    onChange={(e) => setItem({ ...item, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => handleKeyPress(e, agregarItem)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={(e) => setItem({ ...item, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => handleKeyPress(e, agregarItem)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={item.unidad}
                    onChange={(e) => setItem({ ...item, unidad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => handleKeyPress(e, agregarItem)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Precio"
                    value={item.precio}
                    onChange={(e) => setItem({ ...item, precio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => handleKeyPress(e, agregarItem)}
                  />
                </div>
                <div>
                  <button
                    onClick={agregarItem}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {items
                  .filter(
                    (item) =>
                      !selectedVehicleId || item.vehicleId === selectedVehicleId || item.vehicleId === "default",
                  )
                  .map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {editingItemId === item.id ? (
                        // Modo edición
                        <div className="grid md:grid-cols-6 gap-3">
                          <div>
                            <input
                              type="text"
                              value={editingItemData.nombre || ""}
                              onChange={(e) => setEditingItemData({ ...editingItemData, nombre: e.target.value })}
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="Nombre del repuesto"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={editingItemData.descripcion || ""}
                              onChange={(e) => setEditingItemData({ ...editingItemData, descripcion: e.target.value })}
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="Descripción"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={editingItemData.unidad || ""}
                              onChange={(e) =>
                                setEditingItemData({
                                  ...editingItemData,
                                  unidad: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="Cantidad"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={editingItemData.precio || ""}
                              onChange={(e) =>
                                setEditingItemData({
                                  ...editingItemData,
                                  precio: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="Precio"
                            />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-700 flex items-center h-full">
                              {formatCurrency((editingItemData.precio || 0) * (editingItemData.unidad || 0))}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={guardarEdicionItem}
                              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              title="Guardar cambios"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelarEdicionItem}
                              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              title="Cancelar edición"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="grid md:grid-cols-6 gap-3">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-800">{item.nombre}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600">{item.descripcion}</span>
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-800">{item.unidad}</span>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-gray-800">{formatCurrency(item.precio)}</span>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(item.precio * item.unidad)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => iniciarEdicionItem(item)}
                              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              title="Editar item"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => eliminarItem(item.id)}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              title="Eliminar item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Services Section - SIEMPRE VISIBLE con funcionalidad de edición */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Wrench size={18} />
                  Servicios de Mano de Obra
                  {selectedVehicleId && (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      {vehicles.find((v) => v.id === selectedVehicleId)?.marca}{" "}
                      {vehicles.find((v) => v.id === selectedVehicleId)?.placa}
                    </span>
                  )}
                </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="Descripción del servicio"
                    value={servicio.descripcion}
                    onChange={(e) => setServicio({ ...servicio, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => handleKeyPress(e, agregarServicio)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Precio"
                    value={servicio.precio}
                    onChange={(e) => setServicio({ ...servicio, precio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => handleKeyPress(e, agregarServicio)}
                  />
                </div>
                <div>
                  <button
                    onClick={agregarServicio}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {servicios
                  .filter(
                    (service) =>
                      !selectedVehicleId || service.vehicleId === selectedVehicleId || service.vehicleId === "default",
                  )
                  .map((servicio) => (
                    <div key={servicio.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      {editingServiceId === servicio.id ? (
                        // Modo edición
                        <div className="grid md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={editingServiceData.descripcion || ""}
                              onChange={(e) =>
                                setEditingServiceData({ ...editingServiceData, descripcion: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="Descripción del servicio"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={editingServiceData.precio || ""}
                              onChange={(e) =>
                                setEditingServiceData({
                                  ...editingServiceData,
                                  precio: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="Precio"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={guardarEdicionServicio}
                              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              title="Guardar cambios"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelarEdicionServicio}
                              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              title="Cancelar edición"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="grid md:grid-cols-4 gap-3">
                          <div className="md:col-span-2 flex items-center">
                            <span className="text-sm text-gray-800">{servicio.descripcion}</span>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(servicio.precio)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => iniciarEdicionServicio(servicio)}
                              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              title="Editar servicio"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => eliminarServicio(servicio.id)}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              title="Eliminar servicio"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Totales Generales */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calculator size={18} />
                Resumen de Totales
              </h3>

              <div className="space-y-4">
                {/* Totales por vehículo */}
                {totales.vehicleTotals.map((vehicleTotal) => {
                  const vehicle = vehicles.find((v) => v.id === vehicleTotal.vehicleId)
                  if (!vehicle) return null

                  return (
                    <div key={vehicleTotal.vehicleId} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {vehicle.marca} {vehicle.modelo} - {vehicle.placa}
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Subtotal:</span>
                          <p className="font-medium">{formatCurrency(vehicleTotal.subtotal)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">ITBIS (18%):</span>
                          <p className="font-medium">{formatCurrency(vehicleTotal.itbis)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <p className="font-semibold text-green-600">{formatCurrency(vehicleTotal.total)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Total general */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">TOTAL GENERAL</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 font-medium">Subtotal:</span>
                      <p className="font-semibold text-lg">{formatCurrency(totales.subtotal)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">ITBIS (18%):</span>
                      <p className="font-semibold text-lg">{formatCurrency(totales.itbis)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Total:</span>
                      <p className="font-bold text-2xl text-blue-600">{formatCurrency(totales.total)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 flex-wrap">
                <button
                  onClick={descargarPDFReal}
                  disabled={isGeneratingPDF}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isGeneratingPDF ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                  title="Generar PDF con estilos completos usando html2canvas + jsPDF"
                >
                  <FilePdf size={16} />
                  {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
                </button>
                <button
                  onClick={descargarPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  title="Abrir ventana de impresión para generar PDF"
                >
                  <Printer size={16} />
                  Imprimir PDF
                </button>
                <button
                  onClick={descargarHTML}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Descargar archivo HTML"
                >
                  <Download size={16} />
                  HTML
                </button>
                <button
                  onClick={descargarTXT}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FileText size={16} />
                  TXT
                </button>
                <button
                  onClick={descargarCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FileSpreadsheet size={16} />
                  CSV
                </button>
                <button
                  onClick={copiarFactura}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Copy size={16} />
                  Copiar
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Professional Preview */}
          <div className="w-1/2">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-purple-500">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Eye size={20} />
                  Vista Previa Profesional
                </h2>
                <div className="max-h-screen overflow-y-auto">
                  <ProfessionalInvoicePreview
                    infoGeneral={infoGeneral}
                    vehicles={vehicles}
                    items={items}
                    servicios={servicios}
                    totales={totales}
                    itbisEnabled={itbisEnabled}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
