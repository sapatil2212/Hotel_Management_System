'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Invoice, InvoiceData, InvoiceItem } from './invoice';
import { InvoicePDF } from './invoice-pdf';
import { calculateInvoiceTotals, generateInvoiceNumber, validateInvoiceData } from '@/lib/invoice-utils';
import { Plus, Trash2, Save, Eye } from 'lucide-react';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceData>;
  onSave?: (data: InvoiceData) => void;
  showPreview?: boolean;
}

export function InvoiceForm({ initialData, onSave, showPreview = true }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceData>({
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    invoiceDate: initialData?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terms: initialData?.terms || 'Due on Receipt',
    company: {
      name: initialData?.company?.name || '',
      address: initialData?.company?.address || ['', '', '', ''],
    },
    billTo: {
      name: initialData?.billTo?.name || '',
      address: initialData?.billTo?.address || ['', '', '', ''],
    },
    shipTo: {
      address: initialData?.shipTo?.address || ['', '', '', ''],
    },
    items: initialData?.items || [
      {
        id: 1,
        name: '',
        description: '',
        quantity: 1,
        unit: 'pcs',
        rate: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    taxRate: initialData?.taxRate || 0,
    total: 0,
    currency: initialData?.currency || 'USD',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [showPreviewState, setShowPreviewState] = useState(showPreview);

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount for the item
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const rate = field === 'rate' ? value : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      ...calculateInvoiceTotals(newItems, prev.taxRate),
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.max(...formData.items.map(item => item.id)) + 1,
      name: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      rate: 0,
      amount: 0,
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems,
        ...calculateInvoiceTotals(newItems, prev.taxRate),
      }));
    }
  };

  const handleTaxRateChange = (value: string) => {
    const taxRate = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      taxRate,
      ...calculateInvoiceTotals(prev.items, taxRate),
    }));
  };

  const handleSave = () => {
    const validationErrors = validateInvoiceData(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0 && onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Terms</Label>
                  <Input
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.company.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    company: { ...prev.company, name: e.target.value }
                  }))}
                />
              </div>
              {formData.company.address.map((line, index) => (
                <div key={index}>
                  <Label htmlFor={`companyAddress${index}`}>Address Line {index + 1}</Label>
                  <Input
                    id={`companyAddress${index}`}
                    value={line}
                    onChange={(e) => {
                      const newAddress = [...formData.company.address];
                      newAddress[index] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        company: { ...prev.company, address: newAddress }
                      }));
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bill To */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="billToName">Name</Label>
                <Input
                  id="billToName"
                  value={formData.billTo.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    billTo: { ...prev.billTo, name: e.target.value }
                  }))}
                />
              </div>
              {formData.billTo.address.map((line, index) => (
                <div key={index}>
                  <Label htmlFor={`billToAddress${index}`}>Address Line {index + 1}</Label>
                  <Input
                    id={`billToAddress${index}`}
                    value={line}
                    onChange={(e) => {
                      const newAddress = [...formData.billTo.address];
                      newAddress[index] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        billTo: { ...prev.billTo, address: newAddress }
                      }));
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ship To */}
          <Card>
            <CardHeader>
              <CardTitle>Ship To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.shipTo.address.map((line, index) => (
                <div key={index}>
                  <Label htmlFor={`shipToAddress${index}`}>Address Line {index + 1}</Label>
                  <Input
                    id={`shipToAddress${index}`}
                    value={line}
                    onChange={(e) => {
                      const newAddress = [...formData.shipTo.address];
                      newAddress[index] = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        shipTo: { ...prev.shipTo, address: newAddress }
                      }));
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Items and Preview */}
        <div className="space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {formData.items.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`itemName${index}`}>Name</Label>
                      <Input
                        id={`itemName${index}`}
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`itemUnit${index}`}>Unit</Label>
                      <Input
                        id={`itemUnit${index}`}
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`itemDescription${index}`}>Description</Label>
                    <Textarea
                      id={`itemDescription${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`itemQuantity${index}`}>Quantity</Label>
                      <Input
                        id={`itemQuantity${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`itemRate${index}`}>Rate</Label>
                      <Input
                        id={`itemRate${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input
                        value={formData.currency === 'USD' ? `$${item.amount.toFixed(2)}` : `${item.amount.toFixed(2)}`}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button onClick={addItem} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Tax and Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Tax & Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => handleTaxRateChange(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formData.currency === 'USD' ? `$${formData.subtotal.toFixed(2)}` : `${formData.subtotal.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formData.currency === 'USD' ? `$${(formData.subtotal * formData.taxRate / 100).toFixed(2)}` : `${(formData.subtotal * formData.taxRate / 100).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formData.currency === 'USD' ? `$${formData.total.toFixed(2)}` : `${formData.total.toFixed(2)}`}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Invoice
            </Button>
            {showPreview && (
              <Button
                variant="outline"
                onClick={() => setShowPreviewState(!showPreviewState)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreviewState ? 'Hide Preview' : 'Show Preview'}
              </Button>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {showPreviewState && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoicePDF invoiceData={formData}>
                <Invoice data={formData} />
              </InvoicePDF>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
