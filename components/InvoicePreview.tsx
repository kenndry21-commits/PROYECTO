import { Separator } from "@/components/ui/separator"
import type { Invoice } from "@/types/invoice"
import { formatCurrency, formatDate } from "@/utils/formatters"

interface InvoicePreviewProps {
  invoice: Invoice
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FACTURA</h1>
          <p className="text-gray-600">Sistema de Facturación Profesional</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">#{invoice.number || "INV-001"}</p>
          <p className="text-gray-600">Fecha: {formatDate(invoice.date)}</p>
        </div>
      </div>

      {/* Company and Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">De:</h3>
          <div className="text-gray-700">
            <p className="font-medium">Tu Empresa</p>
            <p>Dirección de la empresa</p>
            <p>Ciudad, País</p>
            <p>Teléfono: +57 300 123 4567</p>
            <p>Email: empresa@email.com</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Para:</h3>
          <div className="text-gray-700">
            <p className="font-medium">{invoice.clientName || "Cliente"}</p>
            <p>{invoice.clientAddress}</p>
            <p>Teléfono: {invoice.clientPhone}</p>
            <p>Email: {invoice.clientEmail}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      {invoice.items.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Repuestos y Partes</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Cantidad</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Precio Unit.</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Table */}
      {invoice.services.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Servicios</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Horas</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Tarifa/Hora</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.services.map((service) => (
                  <tr key={service.id}>
                    <td className="border border-gray-300 px-4 py-2">{service.description}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{service.hours}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(service.rate)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {formatCurrency(service.hours * service.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-sm">
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-700">IVA (19%):</span>
              <span className="font-medium">{formatCurrency(invoice.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Notas:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-12 pt-8 border-t">
        <p>Gracias por su confianza</p>
        <p>Esta factura fue generada automáticamente por el Sistema de Facturación</p>
      </div>
    </div>
  )
}
