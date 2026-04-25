"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, FileText, History, Eye, Edit2, Save, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Invoice, InvoiceItem, Service } from "@/types/invoice"
import { validateInvoice } from "@/utils/validation"
import { saveInvoice, getInvoices, deleteInvoice } from "@/utils/storage"
import { formatCurrency, formatDate } from "@/utils/formatters"
import InvoicePreview from "@/components/InvoicePreview"

export default function InvoiceApp() {
  const [invoice, setInvoice] = useState<Invoice>({
    id: "",
    number: "",
    date: new Date().toISOString().split("T")[0],
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    items: [],
    services: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: "",
    createdAt: new Date(),
  })

  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

  // Load saved invoices on component mount
  useEffect(() => {
    const invoices = getInvoices()
    setSavedInvoices(invoices)
  }, [])

  // Calculate totals whenever items or services change
  useEffect(() => {
    const itemsSubtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const servicesSubtotal = invoice.services.reduce((sum, service) => sum + service.hours * service.rate, 0)
    const subtotal = itemsSubtotal + servicesSubtotal
    const tax = subtotal * 0.19 // 19% IVA
    const total = subtotal + tax

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      tax,
      total,
    }))
  }, [invoice.items, invoice.services])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
    }
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: field === "quantity" || field === "price" ? Number(value) : value } : item,
      ),
    }))
  }

  const removeItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      description: "",
      hours: 1,
      rate: 0,
    }
    setInvoice((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }))
  }

  const updateService = (id: string, field: keyof Service, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.id === id
          ? { ...service, [field]: field === "hours" || field === "rate" ? Number(value) : value }
          : service,
      ),
    }))
  }

  const removeService = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service.id !== id),
    }))
  }

  const handleSave = () => {
    const validation = validateInvoice(invoice)
    if (!validation.isValid) {
      toast({
        title: "Error de validación",
        description: validation.errors.join(", "),
        variant: "destructive",
      })
      return
    }

    const invoiceToSave = {
      ...invoice,
      id: invoice.id || Date.now().toString(),
      number: invoice.number || `INV-${Date.now()}`,
      createdAt: invoice.createdAt || new Date(),
    }

    saveInvoice(invoiceToSave)
    setSavedInvoices(getInvoices())
    toast({
      title: "Factura guardada",
      description: `Factura ${invoiceToSave.number} guardada exitosamente`,
    })
  }

  const handleLoadInvoice = (savedInvoice: Invoice) => {
    setInvoice(savedInvoice)
    toast({
      title: "Factura cargada",
      description: `Factura ${savedInvoice.number} cargada exitosamente`,
    })
  }

  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id)
    setSavedInvoices(getInvoices())
    toast({
      title: "Factura eliminada",
      description: "La factura ha sido eliminada exitosamente",
    })
  }

  const handleNewInvoice = () => {
    setInvoice({
      id: "",
      number: "",
      date: new Date().toISOString().split("T")[0],
      clientName: "",
      clientAddress: "",
      clientPhone: "",
      clientEmail: "",
      items: [],
      services: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: "",
      createdAt: new Date(),
    })
    toast({
      title: "Nueva factura",
      description: "Se ha creado una nueva factura",
    })
  }

  const startEditingItem = (id: string) => {
    setEditingItemId(id)
  }

  const stopEditingItem = () => {
    setEditingItemId(null)
  }

  const startEditingService = (id: string) => {
    setEditingServiceId(id)
  }

  const stopEditingService = () => {
    setEditingServiceId(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Facturación</h1>
          <p className="text-gray-600">Gestiona tus facturas de manera profesional</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewInvoice} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
          <Button onClick={() => setShowPreview(true)} className="bg-blue-600 hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
        </div>
      </div>

      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoice">Crear Factura</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice" className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
              <CardDescription>Datos del cliente para la factura</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Número de Factura</Label>
                <Input
                  id="invoiceNumber"
                  value={invoice.number}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, number: e.target.value }))}
                  placeholder="INV-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente</Label>
                <Input
                  id="clientName"
                  value={invoice.clientName}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Teléfono</Label>
                <Input
                  id="clientPhone"
                  value={invoice.clientPhone}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="+57 300 123 4567"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientAddress">Dirección</Label>
                <Input
                  id="clientAddress"
                  value={invoice.clientAddress}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, clientAddress: e.target.value }))}
                  placeholder="Calle 123 #45-67, Bogotá"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={invoice.clientEmail}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="cliente@email.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Parts and Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Repuestos y Partes</CardTitle>
                  <CardDescription>Agrega los repuestos utilizados en el servicio</CardDescription>
                </div>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Repuesto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {editingItemId === item.id ? (
                      <>
                        <div className="flex-1">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Descripción del repuesto"
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                            placeholder="Cant."
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, "price", e.target.value)}
                            placeholder="Precio"
                          />
                        </div>
                        <div className="w-32 text-right font-medium">{formatCurrency(item.quantity * item.price)}</div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={stopEditingItem}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={stopEditingItem}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium">{item.description || "Sin descripción"}</p>
                        </div>
                        <div className="w-24 text-center">
                          <Badge variant="secondary">{item.quantity}</Badge>
                        </div>
                        <div className="w-32 text-right">{formatCurrency(item.price)}</div>
                        <div className="w-32 text-right font-medium">{formatCurrency(item.quantity * item.price)}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditingItem(item.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {invoice.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay repuestos agregados</p>
                    <p className="text-sm">Haz clic en "Agregar Repuesto" para comenzar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Servicios</CardTitle>
                  <CardDescription>Agrega los servicios realizados</CardDescription>
                </div>
                <Button onClick={addService} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Servicio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.services.map((service) => (
                  <div key={service.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {editingServiceId === service.id ? (
                      <>
                        <div className="flex-1">
                          <Input
                            value={service.description}
                            onChange={(e) => updateService(service.id, "description", e.target.value)}
                            placeholder="Descripción del servicio"
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            step="0.5"
                            value={service.hours}
                            onChange={(e) => updateService(service.id, "hours", e.target.value)}
                            placeholder="Horas"
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={service.rate}
                            onChange={(e) => updateService(service.id, "rate", e.target.value)}
                            placeholder="Tarifa/hora"
                          />
                        </div>
                        <div className="w-32 text-right font-medium">
                          {formatCurrency(service.hours * service.rate)}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={stopEditingService}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={stopEditingService}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium">{service.description || "Sin descripción"}</p>
                        </div>
                        <div className="w-24 text-center">
                          <Badge variant="secondary">{service.hours}h</Badge>
                        </div>
                        <div className="w-32 text-right">{formatCurrency(service.rate)}/h</div>
                        <div className="w-32 text-right font-medium">
                          {formatCurrency(service.hours * service.rate)}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEditingService(service.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeService(service.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {invoice.services.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay servicios agregados</p>
                    <p className="text-sm">Haz clic en "Agregar Servicio" para comenzar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={invoice.notes}
                onChange={(e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales, términos y condiciones..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Factura
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial de Facturas
              </CardTitle>
              <CardDescription>Gestiona tus facturas guardadas</CardDescription>
            </CardHeader>
            <CardContent>
              {savedInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay facturas guardadas</p>
                  <p className="text-sm">Las facturas que guardes aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedInvoices.map((savedInvoice) => (
                    <div key={savedInvoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{savedInvoice.number}</h3>
                        <p className="text-sm text-gray-600">{savedInvoice.clientName}</p>
                        <p className="text-sm text-gray-500">{formatDate(savedInvoice.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(savedInvoice.total)}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleLoadInvoice(savedInvoice)}>
                            Cargar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteInvoice(savedInvoice.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Vista Previa de Factura</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
