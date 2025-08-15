'use client';

import { InvoiceForm } from '@/components/ui/invoice-form';
import { InvoiceData } from '@/components/ui/invoice';
import { createSampleInvoice } from '@/lib/invoice-utils';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

export default function InvoiceFormDemoPage() {
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);

  const handleSaveInvoice = (invoiceData: InvoiceData) => {
    const existingIndex = savedInvoices.findIndex(
      inv => inv.invoiceNumber === invoiceData.invoiceNumber
    );

    if (existingIndex >= 0) {
      // Update existing invoice
      const updatedInvoices = [...savedInvoices];
      updatedInvoices[existingIndex] = invoiceData;
      setSavedInvoices(updatedInvoices);
    } else {
      // Add new invoice
      setSavedInvoices(prev => [...prev, invoiceData]);
    }

    setCurrentInvoice(invoiceData);
  };

  const createNewInvoice = () => {
    setCurrentInvoice(null);
  };

  const loadSampleInvoice = () => {
    setCurrentInvoice(createSampleInvoice());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Form Demo</h1>
          <p className="text-gray-600">Create and edit professional invoices with real-time preview</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex justify-center gap-4">
          <Button onClick={createNewInvoice} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
          <Button onClick={loadSampleInvoice} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Load Sample
          </Button>
        </div>

        {/* Saved Invoices */}
        {savedInvoices.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Saved Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedInvoices.map((invoice, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600">{invoice.company.name}</p>
                      <p className="text-sm text-gray-600">Bill to: {invoice.billTo.name}</p>
                      <p className="text-sm font-medium text-gray-900">
                        Total: ${invoice.total.toFixed(2)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setCurrentInvoice(invoice)}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Form */}
        {currentInvoice && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Editing Invoice: {currentInvoice.invoiceNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceForm
                initialData={currentInvoice}
                onSave={handleSaveInvoice}
                showPreview={true}
              />
            </CardContent>
          </Card>
        )}

        {/* New Invoice Form */}
        {!currentInvoice && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceForm
                onSave={handleSaveInvoice}
                showPreview={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-gray-900 mb-2">How to use:</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left max-w-2xl mx-auto">
                <li>• Fill in the invoice details, company information, and billing addresses</li>
                <li>• Add items with quantities, rates, and descriptions</li>
                <li>• Set the tax rate to automatically calculate totals</li>
                <li>• Preview the invoice in real-time as you type</li>
                <li>• Save the invoice and download as PDF</li>
                <li>• Use the "Load Sample" button to see a pre-filled example</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
