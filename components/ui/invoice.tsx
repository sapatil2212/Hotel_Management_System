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
    contact?: string;
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
  paymentInfo?: {
    method: string;
    referenceId?: string;
    collectedBy: string;
    status: string;
  };
  // Add breakdown information
  breakdown?: {
    roomDetails?: {
      roomType: string;
      roomNumber: string;
      nights: number;
      ratePerNight: number;
      baseAmount: number;
      gstAmount: number;
      gstPercentage: number;
      checkIn?: string; // Added for display
      checkOut?: string; // Added for display
    };
    extraCharges?: {
      items: {
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        taxAmount: number;
        finalAmount: number;
      }[];
      totalExtraCharges: number;
    };
  };
}

interface InvoiceProps {
  data: InvoiceData;
  className?: string;
}

export function Invoice({ data, className = '' }: InvoiceProps) {
  const formatCurrency = (amount: number) => {
    const currency = data.currency || 'INR';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateTaxAmount = () => {
    if (data.breakdown) {
      // Calculate total GST from room and extra charges
      const roomGST = data.breakdown.roomDetails?.gstAmount || 0;
      const extraChargesGST = data.breakdown.extraCharges?.items?.reduce((sum, item) => sum + (item.taxAmount || 0), 0) || 0;
      return roomGST + extraChargesGST;
    }
    return data.total - data.subtotal;
  };

  const calculateSubTotal = () => {
    if (data.breakdown) {
      // Calculate base amounts (without GST)
      const roomBaseAmount = data.breakdown.roomDetails?.baseAmount || 0;
      const extraChargesBaseAmount = data.breakdown.extraCharges?.items?.reduce((sum, item) => {
        const baseAmount = (item.finalAmount || 0) - (item.taxAmount || 0);
        return sum + baseAmount;
      }, 0) || 0;
      return roomBaseAmount + extraChargesBaseAmount;
    }
    return data.subtotal;
  };

  return (
    <div className={`max-w-5xl mx-auto bg-white ${className}`} style={{ pageBreakAfter: 'auto' }}>
      {/* Header Section - Keep together */}
      <div className="p-8" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
        {/* Professional Header with Faint Gray Background */}
        <div className="bg-gray-100 border border-gray-200 text-gray-800 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-start space-y-3">
              {data.company.logo ? (
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                  <img 
                    src={data.company.logo} 
                    alt={data.company.name} 
                    className="h-12 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                  <span className="text-gray-600 font-bold text-xl">
                    {data.company.name ? data.company.name.substring(0, 1).toUpperCase() : "H"}
                  </span>
                </div>
              )}
                             <div>
                 <div className="space-y-1">
                   {data.company.address.map((line, index) => (
                     <p key={index} className="text-gray-600 text-xs">{line}</p>
                   ))}
                   {data.company.contact && (
                     <p className="text-gray-600 text-xs font-medium">Contact: {data.company.contact}</p>
                   )}
                 </div>
               </div>
            </div>
            
            <div className="text-right">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Tax Invoice
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-xs">Invoice Number</span>
                    <p className="font-bold text-xs text-gray-800">{data.invoiceNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-xs">Date</span>
                    <p className="font-semibold text-xs text-gray-800">{formatDate(data.invoiceDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Bill To
            </h3>
            <div className="space-y-1">
              <p className="font-bold text-sm text-gray-900">{data.billTo.name}</p>
              {data.billTo.address.map((line, index) => (
                <p key={index} className="text-gray-600 text-xs">{line}</p>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="text-center">
                <span className="text-xs font-medium text-gray-600 block">Check In</span>
                <span className="text-sm font-bold text-gray-900">{data.breakdown?.roomDetails?.checkIn ? formatDate(data.breakdown.roomDetails.checkIn) : formatDate(data.invoiceDate)}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-gray-600 block">Check Out</span>
                <span className="text-sm font-bold text-gray-900">{data.breakdown?.roomDetails?.checkOut ? formatDate(data.breakdown.roomDetails.checkOut) : formatDate(data.invoiceDate)}</span>
              </div>
            </div>
            
            {/* Invoice Details under Stay Period */}
            <div className="border-t border-gray-200 pt-3">
              <div className="text-center">
                <span className="text-xs font-medium text-gray-600 block">Invoice Date</span>
                <span className="text-sm font-bold text-gray-900">{formatDate(data.invoiceDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Breakdown Tables */}
        {data.breakdown && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Room Stay Details Table */}
            {data.breakdown.roomDetails && (
              <div style={{ pageBreakInside: 'avoid' }}>
                <div className="bg-gray-400 text-white p-2 rounded-t-lg">
                  <div className="grid grid-cols-14 gap-2 font-semibold text-xs">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Room Stay Details</div>
                    <div className="col-span-2 text-center">Nights</div>
                    <div className="col-span-2 text-right">Rate/Night</div>
                    <div className="col-span-2 text-right">Base Amount</div>
                    <div className="col-span-2 text-right">GST ({data.breakdown.roomDetails.gstPercentage}%)</div>
                    <div className="col-span-2 text-right">Total Amount</div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                  <div className="grid grid-cols-14 gap-2 p-2 bg-white border-b border-gray-200">
                    <div className="col-span-1 font-medium text-gray-900 text-xs">1</div>
                    <div className="col-span-3">
                      <p className="font-semibold text-gray-900 text-xs">Room Stay - {data.breakdown.roomDetails.roomType}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {data.breakdown.roomDetails.checkIn ? formatDate(data.breakdown.roomDetails.checkIn) : ''} to {data.breakdown.roomDetails.checkOut ? formatDate(data.breakdown.roomDetails.checkOut) : ''} ({data.breakdown.roomDetails.nights} nights)
                      </p>
                    </div>
                    <div className="col-span-2 text-center text-gray-900 text-xs">
                      {data.breakdown.roomDetails.nights} nights
                    </div>
                    <div className="col-span-2 text-right text-gray-900 font-medium text-xs">
                      {formatCurrency(data.breakdown.roomDetails.ratePerNight)}
                    </div>
                    <div className="col-span-2 text-right text-gray-900 font-medium text-xs">
                      {formatCurrency(data.breakdown.roomDetails.baseAmount)}
                    </div>
                    <div className="col-span-2 text-right text-gray-900 font-medium text-xs">
                      {formatCurrency(data.breakdown.roomDetails.gstAmount)}
                    </div>
                    <div className="col-span-2 text-right text-gray-900 font-bold text-xs">
                      {formatCurrency(data.breakdown.roomDetails.baseAmount + data.breakdown.roomDetails.gstAmount)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extra Services & Charges Table */}
            <div style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-gray-400 text-white p-2 rounded-t-lg">
                <div className="grid grid-cols-14 gap-2 font-semibold text-xs">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Extra Services & Charges</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Base Amount</div>
                  <div className="col-span-2 text-right">GST Amount</div>
                  <div className="col-span-2 text-right">Total Amount</div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                {data.breakdown.extraCharges?.items && data.breakdown.extraCharges.items.length > 0 ? (
                  data.breakdown.extraCharges.items.map((item, index) => {
                    const baseAmount = (item.finalAmount || 0) - (item.taxAmount || 0);
                    return (
                      <div key={index} className={`grid grid-cols-14 gap-2 p-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 last:border-b-0`}>
                        <div className="col-span-1 font-medium text-gray-900 text-xs">{index + 2}</div>
                        <div className="col-span-3">
                          <p className="font-semibold text-gray-900 text-xs">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="col-span-2 text-center text-gray-900 text-xs">
                          {item.quantity || 1} pcs
                        </div>
                        <div className="col-span-2 text-right text-gray-900 font-medium text-xs">
                          {formatCurrency(item.unitPrice)}
                        </div>
                        <div className="col-span-2 text-right text-gray-900 font-medium text-xs">
                          {formatCurrency(baseAmount)}
                        </div>
                        <div className="col-span-2 text-right text-gray-900 font-medium text-xs">
                          {formatCurrency(item.taxAmount || 0)}
                        </div>
                        <div className="col-span-2 text-right text-gray-900 font-bold text-xs">
                          {formatCurrency(item.finalAmount)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-14 gap-2 p-4 bg-white">
                    <div className="col-span-14 text-center text-gray-500 text-xs">
                      No extra services or charges
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Totals and Payment Section - Keep together */}
      <div className="px-8 mb-6" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
        <div className="flex justify-end">
          <div className="flex space-x-4">
            <div className="w-72 space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span className="text-xs">Sub Total</span>
                    <span className="font-medium text-xs">{formatCurrency(calculateSubTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-xs">Tax Amount</span>
                    <span className="font-medium text-xs">{formatCurrency(calculateTaxAmount())}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-sm font-bold text-gray-900">
                      <span>Total Amount</span>
                      <span>{formatCurrency(data.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">
                    {data.paymentInfo ? 'Total Amount Paid' : 'Balance Due'}
                  </span>
                  <span className="text-sm font-bold">{formatCurrency(data.total)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Information (for bills) */}
            {data.paymentInfo && (
              <div className="w-72 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-green-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 font-medium">Payment Method:</span>
                    <p className="font-semibold text-gray-900">{data.paymentInfo.method.toUpperCase()}</p>
                  </div>
                  {data.paymentInfo.referenceId && (
                    <div>
                      <span className="text-gray-600 font-medium">Reference ID:</span>
                      <p className="font-semibold text-gray-900">{data.paymentInfo.referenceId}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 font-medium">Collected By:</span>
                    <p className="font-semibold text-gray-900">{data.paymentInfo.collectedBy}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Status:</span>
                    <p className="font-semibold text-green-600">{data.paymentInfo.status.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section - Keep together */}
      <div className="px-8" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Thank You</h4>
            <p className="text-gray-600 leading-relaxed text-xs">
              Thank you for choosing our services. We appreciate your business and look forward to serving you again.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Generated on:</span>
              <span className="font-medium">{new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              This is a computerised generated bill and does not require signature.
            </p>
          </div>
        </div>

        {/* Professional Footer Bar */}
        <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-lg text-center">
          <p className="text-xs">
            For any queries, please contact us at our support desk
          </p>
        </div>
      </div>
    </div>
  );
}
