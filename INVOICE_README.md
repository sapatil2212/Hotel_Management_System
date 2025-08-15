# Invoice Component System

A comprehensive invoice system built with React, TypeScript, and Tailwind CSS that matches the professional design shown in the reference image.

## Features

- **Professional Design**: Clean, modern invoice layout with green accent colors
- **PDF Export**: Generate downloadable PDF invoices using html2canvas and jsPDF
- **Real-time Preview**: Live preview of invoice changes as you type
- **Form Validation**: Built-in validation for required fields
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Customizable**: Easy to customize colors, layout, and data structure

## Components

### 1. Invoice Component (`components/ui/invoice.tsx`)

The main invoice display component that renders the invoice in the format shown in the reference image.

```tsx
import { Invoice, InvoiceData } from '@/components/ui/invoice';

const invoiceData: InvoiceData = {
  invoiceNumber: 'INV-000002',
  invoiceDate: '2023-05-18',
  dueDate: '2023-05-18',
  terms: 'Due on Receipt',
  company: {
    name: 'Zylker Thread & Weave',
    address: ['148, Northern Street', 'Greater South Avenue', 'New York New York 10001', 'U.S.A']
  },
  billTo: {
    name: 'Scott, Melba R.',
    address: ['2476 Blackwell Street', 'Fairbanks', '99701 Colorado', 'U.S.A']
  },
  shipTo: {
    address: ['2476 Blackwell Street', 'Fairbanks', '99701 Colorado', 'U.S.A']
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
    }
  ],
  subtotal: 61.97,
  taxRate: 5.00,
  total: 65.06,
  currency: 'USD'
};

<Invoice data={invoiceData} />
```

### 2. InvoicePDF Component (`components/ui/invoice-pdf.tsx`)

Wrapper component that adds PDF export functionality to any invoice.

```tsx
import { InvoicePDF } from '@/components/ui/invoice-pdf';

<InvoicePDF invoiceData={invoiceData}>
  <Invoice data={invoiceData} />
</InvoicePDF>
```

### 3. InvoiceForm Component (`components/ui/invoice-form.tsx`)

Complete form interface for creating and editing invoices with real-time preview.

```tsx
import { InvoiceForm } from '@/components/ui/invoice-form';

<InvoiceForm
  initialData={existingInvoice}
  onSave={(data) => console.log('Invoice saved:', data)}
  showPreview={true}
/>
```

## Data Structure

### InvoiceData Interface

```typescript
interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  company: {
    name: string;
    address: string[];
    logo?: string;
  };
  billTo: {
    name: string;
    address: string[];
  };
  shipTo: {
    address: string[];
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  total: number;
  currency?: string;
}
```

### InvoiceItem Interface

```typescript
interface InvoiceItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}
```

## Utility Functions

### Invoice Utils (`lib/invoice-utils.ts`)

```typescript
import { 
  calculateInvoiceTotals, 
  generateInvoiceNumber, 
  formatCurrency, 
  formatDate, 
  createSampleInvoice, 
  validateInvoiceData 
} from '@/lib/invoice-utils';

// Calculate totals from items and tax rate
const totals = calculateInvoiceTotals(items, 5.0);

// Generate invoice number
const invoiceNumber = generateInvoiceNumber('INV', 1); // Returns "INV-000001"

// Format currency
const formattedAmount = formatCurrency(65.06, 'USD'); // Returns "$65.06"

// Format date
const formattedDate = formatDate('2023-05-18'); // Returns "May 18, 2023"

// Create sample invoice data
const sampleInvoice = createSampleInvoice();

// Validate invoice data
const errors = validateInvoiceData(invoiceData);
```

## Demo Pages

### 1. Invoice Demo (`/invoice-demo`)

Simple demo showing the invoice component with sample data and PDF export.

### 2. Invoice Form Demo (`/invoice-form-demo`)

Full-featured demo with:
- Interactive form for creating invoices
- Real-time preview
- Save and edit functionality
- PDF export
- Sample data loading

## Installation

The invoice system uses the following dependencies (already included in your project):

```json
{
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.1",
  "lucide-react": "^0.446.0"
}
```

## Customization

### Colors

The invoice uses Tailwind CSS classes for styling. To change the green accent color:

1. Update the `bg-green-600` classes in `invoice.tsx` to your preferred color
2. Update the `bg-green-100` class for the balance due section
3. Update the `text-green-600` classes if used

### Layout

The invoice layout is responsive and uses CSS Grid. You can modify the grid columns and spacing in the component.

### Fonts

The invoice uses the default Tailwind font stack. You can customize fonts by updating the Tailwind configuration.

## Usage Examples

### Basic Invoice Display

```tsx
import { Invoice } from '@/components/ui/invoice';

function MyComponent() {
  const invoiceData = {
    // ... your invoice data
  };

  return <Invoice data={invoiceData} />;
}
```

### Invoice with PDF Export

```tsx
import { Invoice } from '@/components/ui/invoice';
import { InvoicePDF } from '@/components/ui/invoice-pdf';

function MyComponent() {
  const invoiceData = {
    // ... your invoice data
  };

  return (
    <InvoicePDF invoiceData={invoiceData}>
      <Invoice data={invoiceData} />
    </InvoicePDF>
  );
}
```

### Complete Invoice Form

```tsx
import { InvoiceForm } from '@/components/ui/invoice-form';

function MyComponent() {
  const handleSave = (invoiceData) => {
    // Save to database, API, etc.
    console.log('Saving invoice:', invoiceData);
  };

  return (
    <InvoiceForm
      onSave={handleSave}
      showPreview={true}
    />
  );
}
```

## Browser Compatibility

- Modern browsers with ES6+ support
- PDF generation works in Chrome, Firefox, Safari, and Edge
- Mobile responsive design

## Performance

- Components are optimized for React 18
- PDF generation is handled asynchronously
- Real-time calculations are debounced for better performance
- Images and assets are optimized for web delivery

## Contributing

To extend the invoice system:

1. Add new fields to the `InvoiceData` interface
2. Update the form components to handle new fields
3. Modify the display component to show new data
4. Update validation functions as needed
5. Test PDF generation with new fields

## License

This invoice system is part of your HMS project and follows the same licensing terms.
