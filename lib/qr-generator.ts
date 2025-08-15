// QR Code generation utility
// This is a placeholder implementation - in a real app, you'd use a QR code library

export function generateQRCode(data: string): string {
  // For now, return a placeholder QR code data URL
  // In production, you'd use a library like 'qrcode' to generate actual QR codes
  
  const qrData = {
    invoiceId: data,
    timestamp: new Date().toISOString(),
    type: 'invoice'
  }
  
  // Return a placeholder QR code (in real implementation, this would be a generated QR code image)
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="white"/>
      <text x="50" y="50" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8">QR</text>
      <text x="50" y="65" text-anchor="middle" dy=".3em" font-family="monospace" font-size="6">${data.substring(0, 8)}</text>
    </svg>
  `)}`
}

export function generateUniqueInvoiceNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `INV-${timestamp}${random}`
}

export function generateUniqueBillNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `BILL-${timestamp}${random}`
}
