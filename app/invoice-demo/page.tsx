'use client';

import { Invoice, InvoiceData } from '@/components/ui/invoice';
import { InvoicePDF } from '@/components/ui/invoice-pdf';
import { createSampleInvoice } from '@/lib/invoice-utils';

const sampleInvoiceData: InvoiceData = createSampleInvoice();

export default function InvoiceDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Demo</h1>
          <p className="text-gray-600">Professional invoice format matching the design specification</p>
        </div>
        
        <InvoicePDF invoiceData={sampleInvoiceData}>
          <Invoice data={sampleInvoiceData} />
        </InvoicePDF>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This invoice component is fully responsive and can be customized with different data.
            Use the buttons above to download or preview the PDF version.
          </p>
        </div>
      </div>
    </div>
  );
}
