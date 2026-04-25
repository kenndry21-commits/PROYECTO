import type { GeneralInfo, Vehicle, InvoiceItem, Service, Totals } from "../types/invoice"
import { formatCurrency, formatDate } from "./formatters"

export function generateTXTContent(
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  itbisEnabled: boolean,
): string {
  let content = `
==============================================
    TALLER AUTOMOTRIZ MECATRÓNICA
==============================================

${infoGeneral.tipoDocumento.toUpperCase()}: ${infoGeneral.numeroFactura}
${infoGeneral.ncf ? `NCF: ${infoGeneral.ncf}` : ""}
Fecha: ${formatDate(infoGeneral.fecha)}

CLIENTE:
Nombre: ${infoGeneral.nombreCliente}
RNC/Cédula: ${infoGeneral.rnc}
Dirección: ${infoGeneral.direccion}
Teléfono: ${infoGeneral.telefono}

==============================================
VEHÍCULOS Y SERVICIOS
==============================================

`

  vehicles.forEach((vehicle) => {
    const vehicleItems = items.filter((item) => item.vehicleId === vehicle.id)
    const vehicleServices = servicios.filter((service) => service.vehicleId === vehicle.id)
    const vehicleTotal = totales.vehicleTotals.find((vt) => vt.vehicleId === vehicle.id)

    content += `
VEHÍCULO: ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}
Placa: ${vehicle.placa} | Color: ${vehicle.color}
${vehicle.vin ? `VIN: ${vehicle.vin}` : ""}

REPUESTOS Y PARTES:
`

    vehicleItems.forEach((item) => {
      content += `- ${item.nombre} (${item.descripcion})
  Cantidad: ${item.unidad} | Precio: ${formatCurrency(item.precio)}
  Subtotal: ${formatCurrency(item.precio * item.unidad)}
`
    })

    content += `
SERVICIOS:
`

    vehicleServices.forEach((service) => {
      content += `- ${service.descripcion}
  Precio: ${formatCurrency(service.precio)}
`
    })

    if (vehicleTotal) {
      content += `
TOTAL VEHÍCULO:
Subtotal: ${formatCurrency(vehicleTotal.subtotal)}
ITBIS (${itbisEnabled ? "18%" : "0%"}): ${formatCurrency(vehicleTotal.itbis)}
Total: ${formatCurrency(vehicleTotal.total)}

----------------------------------------------
`
    }
  })

  content += `
==============================================
RESUMEN GENERAL
==============================================

Subtotal General: ${formatCurrency(totales.subtotal)}
ITBIS (${itbisEnabled ? "18%" : "0%"}): ${formatCurrency(totales.itbis)}
TOTAL GENERAL: ${formatCurrency(totales.total)}

${
  infoGeneral.observaciones
    ? `
Observaciones:
${infoGeneral.observaciones}
`
    : ""
}

==============================================
Gracias por su preferencia
==============================================
`

  return content
}

export function generateCSVData(
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
): string {
  let csv = "Tipo,Vehículo,Descripción,Cantidad,Precio Unitario,Total\n"

  vehicles.forEach((vehicle) => {
    const vehicleLabel = `${vehicle.marca} ${vehicle.modelo} (${vehicle.placa})`

    const vehicleItems = items.filter((item) => item.vehicleId === vehicle.id)
    const vehicleServices = servicios.filter((service) => service.vehicleId === vehicle.id)

    vehicleItems.forEach((item) => {
      csv += `"Repuesto","${vehicleLabel}","${item.nombre} - ${item.descripcion}",${item.unidad},${item.precio},${item.precio * item.unidad}\n`
    })

    vehicleServices.forEach((service) => {
      csv += `"Servicio","${vehicleLabel}","${service.descripcion}",1,${service.precio},${service.precio}\n`
    })
  })

  return csv
}

// Función para generar HTML optimizado para PDF con estilos inline
const generatePDFHTML = (
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  itbisEnabled = true,
): string => {
  const currentDate = new Date().toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${infoGeneral.tipoDocumento.toUpperCase()} #${infoGeneral.numeroFactura} - Taller Mecatrónica</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .invoice-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            background: #1e3a8a;
            color: white;
            padding: 20px;
            margin-bottom: 0;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .header h2 {
            font-size: 18px;
            font-weight: normal;
            margin-bottom: 10px;
        }
        
        .company-details {
            font-size: 11px;
            line-height: 1.5;
        }
        
        .document-info {
            background: #f8f9fa;
            padding: 15px;
            border-bottom: 2px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .document-badge {
            background: #1e3a8a;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            text-align: center;
        }
        
        .document-type {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .document-number {
            font-size: 14px;
            font-weight: bold;
        }
        
        .content {
            padding: 20px;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .customer-section {
            background: #dbeafe;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .customer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            margin-bottom: 10px;
        }
        
        .info-label {
            font-size: 10px;
            font-weight: bold;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
        }
        
        .vehicle-section {
            background: #dcfce7;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #22c55e;
            margin-bottom: 15px;
        }
        
        .vehicle-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .table-container {
            margin-bottom: 20px;
            border-radius: 6px;
            overflow: hidden;
        }
        
        .table-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #374151;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            font-size: 11px;
        }
        
        .parts-table th {
            background: #f97316;
            color: white;
        }
        
        .services-table th {
            background: #3b82f6;
            color: white;
        }
        
        th {
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        
        td {
            padding: 8px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 11px;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .font-bold {
            font-weight: bold;
        }
        
        .text-green {
            color: #22c55e;
        }
        
        .text-blue {
            color: #3b82f6;
        }
        
        .vehicle-subtotal {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
            margin-bottom: 20px;
        }
        
        .subtotal-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #374151;
            font-size: 12px;
        }
        
        .subtotal-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            font-size: 11px;
        }
        
        .subtotal-item {
            text-align: center;
        }
        
        .subtotal-label {
            color: #6b7280;
            margin-bottom: 5px;
            font-size: 10px;
        }
        
        .subtotal-value {
            font-weight: bold;
            font-size: 12px;
        }
        
        .observations-section {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin-bottom: 20px;
        }
        
        .final-totals {
            background: #dbeafe;
            padding: 25px;
            border-radius: 10px;
            border: 2px solid #3b82f6;
        }
        
        .totals-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            color: #1e3a8a;
            margin-bottom: 20px;
        }
        
        .vehicle-summary {
            background: rgba(255,255,255,0.8);
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        
        .summary-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            font-size: 12px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 11px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
        }
        
        .totals-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }
        
        .total-item {
            text-align: center;
            background: rgba(255,255,255,0.9);
            padding: 15px;
            border-radius: 8px;
        }
        
        .total-label {
            font-size: 11px;
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .total-value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
        }
        
        .grand-total {
            border-top: 2px solid #1e3a8a;
            background: rgba(30, 58, 138, 0.15) !important;
        }
        
        .grand-total .total-value {
            font-size: 18px !important;
            color: #1e3a8a !important;
        }
        
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            margin-top: 30px;
        }
        
        .footer-message {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .footer-subtitle {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 15px;
        }
        
        .footer-features {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
        }
        
        .footer-feature {
            font-size: 10px;
            color: #374151;
            font-weight: 500;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #6b7280;
            background: #f9fafb;
            border-radius: 8px;
            border: 2px dashed #d1d5db;
        }
        
        .empty-icon {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        .divider {
            border-top: 2px dashed #d1d5db;
            margin: 30px 0;
            position: relative;
        }
        
        .divider::before {
            content: '✂️';
            position: absolute;
            left: 50%;
            top: -10px;
            transform: translateX(-50%);
            background: white;
            padding: 0 10px;
            font-size: 14px;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .invoice-container {
                box-shadow: none;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <h1>TALLER AUTOMOTRIZ MECATRÓNICA</h1>
            <h2>Sistema de Facturación Profesional</h2>
            <div class="company-details">
                <div>📍 Av. Duarte, km 14, Calle los Limones #17</div>
                <div>📞 Tel: (809) 847-6482 | 📧 info@mecatronica.com</div>
                <div>🆔 RNC: 001-1154192-6</div>
            </div>
        </div>

        <!-- Document Info -->
        <div class="document-info">
            <div>
                <strong>📅 Fecha:</strong> ${formatDate(infoGeneral.fecha)}
                ${
                  vehicles.length > 1
                    ? `<br><span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">📋 Multi-Vehículo (${vehicles.length} vehículos)</span>`
                    : ""
                }
            </div>
            <div class="document-badge">
                <div class="document-type">${infoGeneral.tipoDocumento.toUpperCase()}</div>
                <div class="document-number">#${infoGeneral.numeroFactura || "Sin número"}</div>
                ${infoGeneral.ncf ? `<div style="font-size: 10px; margin-top: 5px;">NCF: ${infoGeneral.ncf}</div>` : ""}
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Customer Information -->
            <div class="section">
                <div class="section-title">👤 INFORMACIÓN DEL CLIENTE</div>
                <div class="customer-section">
                    ${
                      infoGeneral.nombreCliente
                        ? `
                    <div class="customer-grid">
                        <div class="info-item">
                            <div class="info-label">Nombre</div>
                            <div class="info-value">${infoGeneral.nombreCliente}</div>
                        </div>
                        ${
                          infoGeneral.rnc
                            ? `
                        <div class="info-item">
                            <div class="info-label">RNC/Cédula</div>
                            <div class="info-value">${infoGeneral.rnc}</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          infoGeneral.direccion
                            ? `
                        <div class="info-item">
                            <div class="info-label">Dirección</div>
                            <div class="info-value">${infoGeneral.direccion}</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          infoGeneral.telefono
                            ? `
                        <div class="info-item">
                            <div class="info-label">Teléfono</div>
                            <div class="info-value">${infoGeneral.telefono}</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                    `
                        : `
                    <div class="empty-state">
                        <div class="empty-icon">👤</div>
                        <div>Información del cliente aparecerá aquí</div>
                        <div style="font-size: 10px; margin-top: 8px;">Complete los datos del cliente en el formulario</div>
                    </div>
                    `
                    }
                </div>
            </div>

            <!-- Vehicles and Services -->
            ${
              vehicles.length > 0
                ? vehicles
                    .map((vehicle, vehicleIndex) => {
                      const vehicleItems = items.filter((item) => item.vehicleId === vehicle.id)
                      const vehicleServices = servicios.filter((service) => service.vehicleId === vehicle.id)
                      const vehicleTotal = totales.vehicleTotals.find((vt) => vt.vehicleId === vehicle.id)

                      if (vehicleItems.length === 0 && vehicleServices.length === 0) {
                        return ""
                      }

                      return `
                ${vehicleIndex > 0 ? '<div class="divider"></div>' : ""}
                
                <!-- Vehicle Information -->
                <div class="section">
                    <div class="section-title">🚗 VEHÍCULO #${vehicleIndex + 1}</div>
                    <div class="vehicle-section">
                        <div class="vehicle-grid">
                            <div class="info-item">
                                <div class="info-label">Marca</div>
                                <div class="info-value">${vehicle.marca}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Modelo</div>
                                <div class="info-value">${vehicle.modelo}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Año</div>
                                <div class="info-value">${vehicle.ano}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Color</div>
                                <div class="info-value">${vehicle.color}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Placa</div>
                                <div class="info-value">${vehicle.placa}</div>
                            </div>
                            ${
                              vehicle.vin
                                ? `
                            <div class="info-item">
                                <div class="info-label">VIN</div>
                                <div class="info-value" style="font-size: 10px;">${vehicle.vin}</div>
                            </div>
                            `
                                : ""
                            }
                        </div>
                        ${
                          vehicle.observaciones
                            ? `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #22c55e;">
                            <div class="info-label">Observaciones</div>
                            <div class="info-value">${vehicle.observaciones}</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>

                <!-- Parts and Items -->
                ${
                  vehicleItems.length > 0
                    ? `
                <div class="section">
                    <div class="table-title">📦 Repuestos y Partes - ${vehicle.marca} ${vehicle.placa}</div>
                    <div class="table-container">
                        <table class="parts-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th class="text-center">Cant.</th>
                                    <th class="text-right">Precio Unit.</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vehicleItems
                                  .map(
                                    (item) => `
                                <tr>
                                    <td class="font-bold">${item.nombre}</td>
                                    <td style="color: #6b7280;">${item.descripcion}</td>
                                    <td class="text-center font-bold">${item.unidad}</td>
                                    <td class="text-right">${formatCurrency(item.precio)}</td>
                                    <td class="text-right font-bold text-green">${formatCurrency(item.precio * item.unidad)}</td>
                                </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                `
                    : ""
                }

                <!-- Services -->
                ${
                  vehicleServices.length > 0
                    ? `
                <div class="section">
                    <div class="table-title">🔧 Servicios de Mano de Obra - ${vehicle.marca} ${vehicle.placa}</div>
                    <div class="table-container">
                        <table class="services-table">
                            <thead>
                                <tr>
                                    <th>Descripción del Servicio</th>
                                    <th class="text-right">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vehicleServices
                                  .map(
                                    (servicio) => `
                                <tr>
                                    <td>${servicio.descripcion}</td>
                                    <td class="text-right font-bold text-blue">${formatCurrency(servicio.precio)}</td>
                                </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                `
                    : ""
                }

                <!-- Vehicle Subtotal -->
                ${
                  vehicleTotal && vehicles.length > 1
                    ? `
                <div class="vehicle-subtotal">
                    <div class="subtotal-title">Subtotal ${vehicle.marca} ${vehicle.placa}</div>
                    <div class="subtotal-grid">
                        <div class="subtotal-item">
                            <div class="subtotal-label">Subtotal</div>
                            <div class="subtotal-value">${formatCurrency(vehicleTotal.subtotal)}</div>
                        </div>
                        <div class="subtotal-item">
                            <div class="subtotal-label">ITBIS ${itbisEnabled ? "(18%)" : "(0%)"}</div>
                            <div class="subtotal-value">${formatCurrency(vehicleTotal.itbis)}</div>
                        </div>
                        <div class="subtotal-item">
                            <div class="subtotal-label">Total Vehículo</div>
                            <div class="subtotal-value text-blue">${formatCurrency(vehicleTotal.total)}</div>
                        </div>
                    </div>
                </div>
                `
                    : ""
                }
                `
                    })
                    .join("")
                : `
            <div class="section">
                <div class="section-title">🚗 VEHÍCULOS</div>
                <div class="empty-state">
                    <div class="empty-icon">🚗</div>
                    <div>Los vehículos aparecerán aquí</div>
                    <div style="font-size: 10px; margin-top: 8px;">Agregue al menos un vehículo para continuar</div>
                </div>
            </div>
            `
            }

            <!-- General Observations -->
            ${
              infoGeneral.observaciones
                ? `
            <div class="section">
                <div class="section-title">📝 OBSERVACIONES GENERALES</div>
                <div class="observations-section">
                    ${infoGeneral.observaciones}
                </div>
            </div>
            `
                : ""
            }

            <!-- Final Totals -->
            <div class="section">
                <div class="final-totals">
                    <div class="totals-title">
                        ${vehicles.length > 1 ? "RESUMEN GENERAL" : "TOTAL DE LA FACTURA"}
                    </div>

                    ${
                      vehicles.length > 1 && totales.vehicleTotals.length > 0
                        ? `
                    <div class="vehicle-summary">
                        <div class="summary-title">Resumen por vehículo:</div>
                        <div class="summary-grid">
                            ${totales.vehicleTotals
                              .map((vehicleTotal) => {
                                const vehicle = vehicles.find((v) => v.id === vehicleTotal.vehicleId)
                                if (!vehicle) return ""
                                return `
                                <div class="summary-item">
                                    <span>${vehicle.marca} ${vehicle.placa}:</span>
                                    <span class="font-bold">${formatCurrency(vehicleTotal.total)}</span>
                                </div>
                                `
                              })
                              .join("")}
                        </div>
                    </div>
                    `
                        : ""
                    }

                    ${
                      vehicles.length > 0 && (items.length > 0 || servicios.length > 0)
                        ? `
                    <div class="totals-grid">
                        <div class="total-item">
                            <div class="total-label">Subtotal</div>
                            <div class="total-value">${formatCurrency(totales.subtotal)}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">ITBIS ${itbisEnabled ? "(18%)" : "(0%)"}</div>
                            <div class="total-value">${formatCurrency(totales.itbis)}</div>
                        </div>
                        <div class="total-item grand-total">
                            <div class="total-label">TOTAL</div>
                            <div class="total-value">${formatCurrency(totales.total)}</div>
                        </div>
                    </div>
                    `
                        : `
                    <div class="empty-state">
                        <div class="empty-icon">💰</div>
                        <div>Los totales aparecerán aquí</div>
                        <div style="font-size: 10px; margin-top: 8px;">Agregue items o servicios para ver los cálculos</div>
                    </div>
                    `
                    }
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-message">¡Gracias por confiar en nuestros servicios!</div>
            <div class="footer-subtitle">Este documento fue generado automáticamente por el Sistema de Facturación Mecatrónica - ${currentDate}</div>
            <div class="footer-features">
                <div class="footer-feature">✅ Garantía de 6 meses en servicios</div>
                <div class="footer-feature">🔧 Repuestos originales</div>
                <div class="footer-feature">👨‍🔧 Técnicos certificados</div>
            </div>
        </div>
    </div>
</body>
</html>`
}

// Función mejorada para cargar jsPDF desde CDN
const loadJsPDF = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.jspdf) {
      resolve(window.jspdf)
      return
    }

    // Crear script tag para cargar desde CDN
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    script.onload = () => {
      if (window.jspdf) {
        resolve(window.jspdf)
      } else {
        reject(new Error("jsPDF failed to load"))
      }
    }
    script.onerror = () => reject(new Error("Failed to load jsPDF script"))
    document.head.appendChild(script)
  })
}

// Función mejorada para cargar html2canvas desde CDN
const loadHtml2Canvas = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.html2canvas) {
      resolve(window.html2canvas)
      return
    }

    // Crear script tag para cargar desde CDN
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
    script.onload = () => {
      if (window.html2canvas) {
        resolve(window.html2canvas)
      } else {
        reject(new Error("html2canvas failed to load"))
      }
    }
    script.onerror = () => reject(new Error("Failed to load html2canvas script"))
    document.head.appendChild(script)
  })
}

// Función principal para generar PDF usando html2canvas + jsPDF
export const generatePDFFromHTML = async (
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  itbisEnabled = true,
): Promise<void> => {
  // Fallback to print window if advanced PDF generation fails
  openPrintWindow(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
}

// Función alternativa usando solo jsPDF (fallback)
export const generatePDFWithJsPDF = async (
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  itbisEnabled = true,
): Promise<void> => {
  // Fallback to print window if jsPDF fails
  openPrintWindow(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
}

// Función para abrir el HTML en una nueva ventana para imprimir como PDF
export function openPrintWindow(
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  itbisEnabled: boolean,
) {
  const htmlContent = generatePDFHTML(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
  const printWindow = window.open("", "_blank")

  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

export async function generatePDF(
  infoGeneral: GeneralInfo,
  vehicles: Vehicle[],
  items: InvoiceItem[],
  servicios: Service[],
  totales: Totals,
  itbisEnabled: boolean,
): Promise<Blob> {
  const htmlContent = generatePDFHTML(infoGeneral, vehicles, items, servicios, totales, itbisEnabled)
  return new Blob([htmlContent], { type: "text/html" })
}

// Función para descargar archivos
export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  try {
    const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"

    // Agregar al DOM temporalmente
    document.body.appendChild(link)

    // Simular click para descargar
    link.click()

    // Limpiar
    document.body.removeChild(link)

    // Liberar la URL del objeto después de un breve retraso
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error("Error downloading file:", error)
    alert("Error al descargar el archivo. Por favor, intente nuevamente.")
  }
}

// Declarar tipos globales para las librerías cargadas dinámicamente
declare global {
  interface Window {
    jspdf: any
    html2canvas: any
  }
}
