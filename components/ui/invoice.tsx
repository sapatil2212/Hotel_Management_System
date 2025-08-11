import React from 'react';
import { Card } from './card';

export interface InvoiceItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface InvoiceData {
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

interface InvoiceProps {
  data: InvoiceData;
  className?: string;
}

export function Invoice({ data, className = '' }: InvoiceProps) {
  const formatCurrency = (amount: number) => {
    const currency = data.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className={`max-w-4xl mx-auto bg-white shadow-lg ${className}`}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
              Invoice
            </h1>
          </div>
          
          <div className="text-right">
            <h2 className="font-bold text-gray-900 text-lg">{data.company.name}</h2>
            {data.company.address.map((line, index) => (
              <p key={index} className="text-sm text-gray-600">{line}</p>
            ))}
            <div className="mt-2">
              <span className="text-sm text-gray-600">Invoice# </span>
              <span className="font-bold text-gray-900">{data.invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* Bill To and Ship To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Bill To</h3>
            <p className="font-bold text-gray-900">{data.billTo.name}</p>
            {data.billTo.address.map((line, index) => (
              <p key={index} className="text-sm text-gray-600">{line}</p>
            ))}
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Ship To</h3>
            {data.shipTo.address.map((line, index) => (
              <p key={index} className="text-sm text-gray-600">{line}</p>
            ))}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-green-600 text-white p-3 mb-2">
          <div className="grid grid-cols-3 text-center">
            <span className="font-medium">Invoice Date</span>
            <span className="font-medium">Terms</span>
            <span className="font-medium">Due Date</span>
          </div>
        </div>
        <div className="grid grid-cols-3 text-center mb-8">
          <span className="text-gray-900">{formatDate(data.invoiceDate)}</span>
          <span className="text-gray-900">{data.terms}</span>
          <span className="text-gray-900">{formatDate(data.dueDate)}</span>
        </div>

        {/* Items Table */}
        <div className="bg-green-600 text-white p-3 mb-2">
          <div className="grid grid-cols-5 gap-4">
            <span className="font-medium">#</span>
            <span className="font-medium col-span-2">Item & Description</span>
            <span className="font-medium text-right">Qty</span>
            <span className="font-medium text-right">Rate</span>
            <span className="font-medium text-right">Amount</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-8">
          {data.items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-5 gap-4 py-2 border-b border-gray-200">
              <span className="text-gray-900">{item.id}</span>
              <div className="col-span-2">
                <p className="font-bold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <span className="text-right text-gray-900">{item.quantity} {item.unit}</span>
              <span className="text-right text-gray-900">{formatCurrency(item.rate)}</span>
              <span className="text-right text-gray-900">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sub Total</span>
              <span className="text-gray-900">{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Rate</span>
              <span className="text-gray-900">{data.taxRate}%</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatCurrency(data.total)}</span>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <div className="flex justify-between font-bold">
                <span className="text-gray-900">Balance Due</span>
                <span className="text-gray-900">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600">Thanks for your business.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Terms & Conditions</h4>
            <p className="text-sm text-gray-600">
              Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
