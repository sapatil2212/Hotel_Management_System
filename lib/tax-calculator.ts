interface TaxConfig {
  gstPercentage?: number
  serviceTaxPercentage?: number
  otherTaxes?: Array<{ name: string; percentage: number; description?: string }>
  taxEnabled?: boolean
}

interface TaxBreakdown {
  baseAmount: number
  gstAmount: number
  serviceTaxAmount: number
  otherTaxAmount: number
  totalTaxAmount: number
  totalAmount: number
  taxes: Array<{
    name: string
    percentage: number
    amount: number
  }>
}

export function calculateTaxes(baseAmount: number, taxConfig: TaxConfig): TaxBreakdown {
  if (!taxConfig.taxEnabled) {
    return {
      baseAmount,
      gstAmount: 0,
      serviceTaxAmount: 0,
      otherTaxAmount: 0,
      totalTaxAmount: 0,
      totalAmount: baseAmount,
      taxes: []
    }
  }

  const gstPercentage = taxConfig.gstPercentage || 0
  const serviceTaxPercentage = taxConfig.serviceTaxPercentage || 0
  const otherTaxes = taxConfig.otherTaxes || []

  const gstAmount = (baseAmount * gstPercentage) / 100
  const serviceTaxAmount = (baseAmount * serviceTaxPercentage) / 100
  
  let otherTaxAmount = 0
  const taxes: Array<{ name: string; percentage: number; amount: number }> = []

  // Add GST if applicable
  if (gstPercentage > 0) {
    taxes.push({
      name: 'GST',
      percentage: gstPercentage,
      amount: gstAmount
    })
  }

  // Add Service Tax if applicable
  if (serviceTaxPercentage > 0) {
    taxes.push({
      name: 'Service Tax',
      percentage: serviceTaxPercentage,
      amount: serviceTaxAmount
    })
  }

  // Calculate other taxes
  otherTaxes.forEach(tax => {
    if (tax.percentage > 0) {
      const amount = (baseAmount * tax.percentage) / 100
      otherTaxAmount += amount
      taxes.push({
        name: tax.name,
        percentage: tax.percentage,
        amount
      })
    }
  })

  const totalTaxAmount = gstAmount + serviceTaxAmount + otherTaxAmount
  const totalAmount = baseAmount + totalTaxAmount

  return {
    baseAmount,
    gstAmount,
    serviceTaxAmount,
    otherTaxAmount,
    totalTaxAmount,
    totalAmount,
    taxes
  }
}

export function formatTaxBreakdown(breakdown: TaxBreakdown): string {
  const lines = [
    `Base Amount: ₹${breakdown.baseAmount.toFixed(2)}`
  ]

  breakdown.taxes.forEach(tax => {
    lines.push(`${tax.name} (${tax.percentage}%): ₹${tax.amount.toFixed(2)}`)
  })

  lines.push(`Total Amount: ₹${breakdown.totalAmount.toFixed(2)}`)

  return lines.join('\n')
}
