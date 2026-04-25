import { Car, Calendar, User, Phone, MapPin, FileText } from "lucide-react"
import type { GeneralInfo, Vehicle, InvoiceItem, Service, Totals } from "../types/invoice"
import { formatCurrency, formatDate } from "../utils/formatters"

interface ProfessionalInvoicePreviewProps {
  infoGeneral: GeneralInfo
  vehicles: Vehicle[]
  items: InvoiceItem[]
  servicios: Service[]
  totales: Totals
  itbisEnabled: boolean
}

export function ProfessionalInvoicePreview({
  infoGeneral,
  vehicles,
  items,
  servicios,
  totales,
  itbisEnabled,
}: ProfessionalInvoicePreviewProps) {
  return (
    <div className="bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">TALLER AUTOMOTRIZ MECATRÓNICA</h1>
          <p className="text-blue-100 mb-4">Sistema de Facturación Profesional</p>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 inline-block">
            <h2 className="text-xl font-semibold">
              {infoGeneral.tipoDocumento.toUpperCase()}: {infoGeneral.numeroFactura || "Sin número"}
            </h2>
            {infoGeneral.ncf && <p className="text-sm text-blue-100 mt-1">NCF: {infoGeneral.ncf}</p>}
          </div>
        </div>
      </div>

      {/* Client and Date Info */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Cliente
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Nombre:</strong> {infoGeneral.nombreCliente || "Sin especificar"}
              </p>
              <p>
                <strong>RNC/Cédula:</strong> {infoGeneral.rnc || "Sin especificar"}
              </p>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{infoGeneral.direccion || "Sin especificar"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{infoGeneral.telefono || "Sin especificar"}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Información del Documento
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Fecha:</strong> {infoGeneral.fecha ? formatDate(infoGeneral.fecha) : "Sin fecha"}
              </p>
              <p>
                <strong>Tipo:</strong> {infoGeneral.tipoDocumento === "factura" ? "📄 Factura" : "✅ Cotización"}
              </p>
              <p>
                <strong>Vehículos:</strong> {vehicles.length}
              </p>
              <p>
                <strong>ITBIS:</strong> {itbisEnabled ? "Habilitado (18%)" : "Deshabilitado (0%)"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles and Services */}
      <div className="p-6">
        {vehicles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay vehículos agregados</p>
            <p className="text-sm">Agregue vehículos para ver la vista previa</p>
          </div>
        ) : (
          <div className="space-y-6">
            {vehicles.map((vehicle) => {
              const vehicleItems = items.filter((item) => item.vehicleId === vehicle.id)
              const vehicleServices = servicios.filter((service) => service.vehicleId === vehicle.id)
              const vehicleTotal = totales.vehicleTotals.find((vt) => vt.vehicleId === vehicle.id)

              return (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Vehicle Header */}
                  <div className="bg-blue-50 p-4 border-b border-blue-200">
                    <div className="flex items-center gap-3">
                      <Car className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Placa: {vehicle.placa} | Color: {vehicle.color}
                          {vehicle.vin && ` | VIN: ${vehicle.vin}`}
                        </p>
                      </div>
                    </div>
                    {vehicle.observaciones && (
                      <p className="text-sm text-gray-600 mt-2 italic">{vehicle.observaciones}</p>
                    )}
                  </div>

                  {/* Vehicle Content */}
                  <div className="p-4">
                    {/* Items */}
                    {vehicleItems.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-500" />
                          Repuestos y Partes
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left p-2 font-medium text-gray-700">Nombre</th>
                                <th className="text-left p-2 font-medium text-gray-700">Descripción</th>
                                <th className="text-center p-2 font-medium text-gray-700">Cant.</th>
                                <th className="text-right p-2 font-medium text-gray-700">Precio</th>
                                <th className="text-right p-2 font-medium text-gray-700">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vehicleItems.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                  <td className="p-2 font-medium text-gray-800">{item.nombre}</td>
                                  <td className="p-2 text-gray-600">{item.descripcion}</td>
                                  <td className="p-2 text-center font-semibold">{item.unidad}</td>
                                  <td className="p-2 text-right">{formatCurrency(item.precio)}</td>
                                  <td className="p-2 text-right font-semibold text-green-600">
                                    {formatCurrency(item.precio * item.unidad)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    {vehicleServices.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Car className="h-4 w-4 text-green-500" />
                          Servicios de Mano de Obra
                        </h5>
                        <div className="space-y-2">
                          {vehicleServices.map((service) => (
                            <div
                              key={service.id}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="text-gray-800">{service.descripcion}</span>
                              <span className="font-semibold text-green-600">{formatCurrency(service.precio)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vehicle Total */}
                    {vehicleTotal && (
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Subtotal:</span>
                            <p className="font-semibold">{formatCurrency(vehicleTotal.subtotal)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">ITBIS ({itbisEnabled ? "18%" : "0%"}):</span>
                            <p className="font-semibold">{formatCurrency(vehicleTotal.itbis)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Total:</span>
                            <p className="font-bold text-lg text-blue-600">{formatCurrency(vehicleTotal.total)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* General Totals */}
      {vehicles.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">RESUMEN GENERAL</h3>
          <div className="max-w-md mx-auto">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Subtotal:</span>
                <span className="text-lg font-semibold">{formatCurrency(totales.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">ITBIS ({itbisEnabled ? "18%" : "0%"}):</span>
                <span className="text-lg font-semibold">{formatCurrency(totales.itbis)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">TOTAL:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(totales.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Observations */}
      {infoGeneral.observaciones && (
        <div className="p-6 bg-yellow-50 border-t border-yellow-200">
          <h4 className="font-semibold text-gray-800 mb-2">Observaciones:</h4>
          <p className="text-gray-700 text-sm italic">{infoGeneral.observaciones}</p>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 text-white p-4 text-center">
        <p className="text-sm">Gracias por su preferencia</p>
        <p className="text-xs text-gray-400 mt-1">Taller Automotriz Mecatrónica - Sistema de Facturación</p>
      </div>
    </div>
  )
}
