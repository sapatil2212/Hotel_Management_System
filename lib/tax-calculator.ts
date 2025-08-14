import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TaxConfig {
  gstPercentage?: number
  serviceTaxPercentage?: number
  otherTaxes?: Array<{ name: string; percentage: number; description?: string }>
  taxEnabled?: boolean
}

interface TaxBreakdown {
  baseAmount: number
  gst: number
  serviceTax: number
  otherTax: number
  totalTax: number
  totalAmount: number
  taxes: Array<{
    name: string
    percentage: number
    amount: number
  }>
}

// Legacy interface for backward compatibility
interface LegacyTaxBreakdown {
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

export class TaxCalculator {
  /**
   * Calculate taxes using hotel configuration
   */
  static async calculateTaxes(baseAmount: number): Promise<TaxBreakdown> {
    try {
      const hotelInfo = await prisma.hotelinfo.findFirst();
      
      if (!hotelInfo || !hotelInfo.taxEnabled) {
        return {
          baseAmount,
          gst: 0,
          serviceTax: 0,
          otherTax: 0,
          totalTax: 0,
          totalAmount: baseAmount,
          taxes: []
        };
      }

      const gstPercentage = hotelInfo.gstPercentage || 18;
      const serviceTaxPercentage = hotelInfo.serviceTaxPercentage || 0;
      const otherTaxes = (hotelInfo.otherTaxes as any[]) || [];

      const gst = (baseAmount * gstPercentage) / 100;
      const serviceTax = (baseAmount * serviceTaxPercentage) / 100;
      
      let otherTax = 0;
      const taxes: Array<{ name: string; percentage: number; amount: number }> = [];

      // Add GST if applicable
      if (gstPercentage > 0) {
        taxes.push({
          name: 'GST',
          percentage: gstPercentage,
          amount: gst
        });
      }

      // Add Service Tax if applicable
      if (serviceTaxPercentage > 0) {
        taxes.push({
          name: 'Service Tax',
          percentage: serviceTaxPercentage,
          amount: serviceTax
        });
      }

      // Calculate other taxes
      otherTaxes.forEach((tax: any) => {
        if (tax.percentage > 0) {
          const amount = (baseAmount * tax.percentage) / 100;
          otherTax += amount;
          taxes.push({
            name: tax.name,
            percentage: tax.percentage,
            amount
          });
        }
      });

      const totalTax = gst + serviceTax + otherTax;
      const totalAmount = baseAmount + totalTax;

      return {
        baseAmount: baseAmount || 0,
        gst: gst || 0,
        serviceTax: serviceTax || 0,
        otherTax: otherTax || 0,
        totalTax: totalTax || 0,
        totalAmount: totalAmount || baseAmount || 0,
        taxes: taxes || []
      };
    } catch (error) {
      console.error('Error calculating taxes:', error);
      // Return zero taxes on error
      return {
        baseAmount: baseAmount || 0,
        gst: 0,
        serviceTax: 0,
        otherTax: 0,
        totalTax: 0,
        totalAmount: baseAmount || 0,
        taxes: []
      };
    }
  }

  /**
   * Calculate taxes for a specific item
   */
  static async calculateItemTaxes(
    itemAmount: number,
    taxable: boolean = true
  ): Promise<TaxBreakdown> {
    if (!taxable) {
      return {
        baseAmount: itemAmount,
        gst: 0,
        serviceTax: 0,
        otherTax: 0,
        totalTax: 0,
        totalAmount: itemAmount,
        taxes: []
      };
    }

    return this.calculateTaxes(itemAmount);
  }

  /**
   * Format tax breakdown for display
   */
  static formatTaxBreakdown(breakdown: TaxBreakdown): string {
    const lines = [
      `Base Amount: ₹${breakdown.baseAmount.toFixed(2)}`
    ];

    breakdown.taxes.forEach(tax => {
      lines.push(`${tax.name} (${tax.percentage}%): ₹${tax.amount.toFixed(2)}`);
    });

    lines.push(`Total Amount: ₹${breakdown.totalAmount.toFixed(2)}`);

    return lines.join('\n');
  }

  /**
   * Get tax configuration from hotel settings
   */
  static async getTaxConfig(): Promise<TaxConfig> {
    try {
      const hotelInfo = await prisma.hotelinfo.findFirst();
      
      return {
        gstPercentage: hotelInfo?.gstPercentage || 18,
        serviceTaxPercentage: hotelInfo?.serviceTaxPercentage || 0,
        otherTaxes: (hotelInfo?.otherTaxes as any[]) || [],
        taxEnabled: hotelInfo?.taxEnabled || true
      };
    } catch (error) {
      console.error('Error getting tax config:', error);
      return {
        gstPercentage: 18,
        serviceTaxPercentage: 0,
        otherTaxes: [],
        taxEnabled: true
      };
    }
  }
}

// Legacy function for backward compatibility
export function calculateTaxes(baseAmount: number, taxConfig: TaxConfig): LegacyTaxBreakdown {
  if (!taxConfig.taxEnabled) {
    return {
      baseAmount,
      gstAmount: 0,
      serviceTaxAmount: 0,
      otherTaxAmount: 0,
      totalTaxAmount: 0,
      totalAmount: baseAmount,
      taxes: []
    };
  }

  const gstPercentage = taxConfig.gstPercentage || 0;
  const serviceTaxPercentage = taxConfig.serviceTaxPercentage || 0;
  const otherTaxes = taxConfig.otherTaxes || [];

  const gstAmount = (baseAmount * gstPercentage) / 100;
  const serviceTaxAmount = (baseAmount * serviceTaxPercentage) / 100;
  
  let otherTaxAmount = 0;
  const taxes: Array<{ name: string; percentage: number; amount: number }> = [];

  // Add GST if applicable
  if (gstPercentage > 0) {
    taxes.push({
      name: 'GST',
      percentage: gstPercentage,
      amount: gstAmount
    });
  }

  // Add Service Tax if applicable
  if (serviceTaxPercentage > 0) {
    taxes.push({
      name: 'Service Tax',
      percentage: serviceTaxPercentage,
      amount: serviceTaxAmount
    });
  }

  // Calculate other taxes
  otherTaxes.forEach(tax => {
    if (tax.percentage > 0) {
      const amount = (baseAmount * tax.percentage) / 100;
      otherTaxAmount += amount;
      taxes.push({
        name: tax.name,
        percentage: tax.percentage,
        amount
      });
    }
  });

  const totalTaxAmount = gstAmount + serviceTaxAmount + otherTaxAmount;
  const totalAmount = baseAmount + totalTaxAmount;

  return {
    baseAmount,
    gstAmount,
    serviceTaxAmount,
    otherTaxAmount,
    totalTaxAmount,
    totalAmount,
    taxes
  };
}
