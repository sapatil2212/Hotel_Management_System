import { InvoiceData, InvoiceItem } from '@/components/ui/invoice';

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number = 0): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function generateInvoiceNumber(prefix: string = 'INV', sequence: number = 1): string {
  return `${prefix}-${sequence.toString().padStart(6, '0')}`;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function createSampleInvoice(): InvoiceData {
  return {
    invoiceNumber: generateInvoiceNumber('INV', 2),
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    terms: 'Due on Receipt',
    company: {
      name: 'Zylker Thread & Weave',
      address: [
        '148, Northern Street',
        'Greater South Avenue',
        'New York New York 10001',
        'U.S.A'
      ]
    },
    billTo: {
      name: 'Scott, Melba R.',
      address: [
        '2476 Blackwell Street',
        'Fairbanks',
        '99701 Colorado',
        'U.S.A'
      ]
    },
    shipTo: {
      address: [
        '2476 Blackwell Street',
        'Fairbanks',
        '99701 Colorado',
        'U.S.A'
      ]
    },
    items: [
      {
        id: 1,
        name: 'Pepe Jeans',
        description: 'Tapered fit Mid rise - Blue',
        quantity: 1,
        unit: 'pcs',
        rate: 24.99,
        amount: 24.99
      },
      {
        id: 2,
        name: 'Boys Shirt',
        description: 'Size - 36, Mosaic design',
        quantity: 1,
        unit: 'pcs',
        rate: 16.99,
        amount: 16.99
      },
      {
        id: 3,
        name: 'Men Shirt',
        description: 'Size - 42, Striped Blue',
        quantity: 1,
        unit: 'pcs',
        rate: 19.99,
        amount: 19.99
      }
    ],
    subtotal: 61.97,
    taxRate: 5.00,
    total: 65.06,
    currency: 'USD'
  };
}

export function validateInvoiceData(data: Partial<InvoiceData>): string[] {
  const errors: string[] = [];
  
  if (!data.invoiceNumber) errors.push('Invoice number is required');
  if (!data.invoiceDate) errors.push('Invoice date is required');
  if (!data.dueDate) errors.push('Due date is required');
  if (!data.company?.name) errors.push('Company name is required');
  if (!data.billTo?.name) errors.push('Bill to name is required');
  if (!data.items || data.items.length === 0) errors.push('At least one item is required');
  
  return errors;
}
