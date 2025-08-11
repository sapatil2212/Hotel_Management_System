'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Invoice } from '@/components/ui/invoice';
import { InvoicePDF } from '@/components/ui/invoice-pdf';
import { InvoiceService } from '@/lib/invoice-service';
import { FileText, DollarSign, CreditCard, Download, Eye, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  room: {
    roomNumber: string;
    roomType: {
      name: string;
    };
  };
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  issuedDate: string;
  dueDate: string;
  guestName: string;
}

interface PaymentData {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  receivedBy: string;
  status: string;
}

export default function BillingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: '',
    paymentReference: '',
    receivedBy: '',
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchInvoices();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setInvoices(data);
        } else {
          console.error('Expected array of invoices, got:', typeof data);
          setInvoices([]);
        }
      } else {
        console.error('Failed to fetch invoices:', response.status);
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const generateInvoice = async (bookingId: string) => {
    setGeneratingInvoice(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      if (response.ok) {
        const invoice = await response.json();
        toast({
          title: 'Success',
          description: `Invoice ${invoice.invoiceNumber} generated successfully`,
        });
        fetchInvoices();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to generate invoice',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate invoice',
        variant: 'destructive'
      });
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const recordPayment = async () => {
    if (!selectedBooking) return;

    setRecordingPayment(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          paymentReference: paymentForm.paymentReference,
          receivedBy: paymentForm.receivedBy,
          notes: paymentForm.notes
        })
      });

      if (response.ok) {
        const payment = await response.json();
        toast({
          title: 'Success',
          description: `Payment of $${payment.amount} recorded successfully`,
        });
        setShowPaymentDialog(false);
        setPaymentForm({
          amount: '',
          paymentMethod: '',
          paymentReference: '',
          receivedBy: '',
          notes: ''
        });
        fetchBookings();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to record payment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive'
      });
    } finally {
      setRecordingPayment(false);
    }
  };

  const viewInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const invoice = await response.json();
        setSelectedInvoice(invoice);
        setShowInvoiceDialog(true);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partially_paid': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'checked_in': return 'text-blue-600 bg-blue-100';
      case 'checked_out': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing Management</h2>
      </div>

      {/* Bookings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{booking.guestName}</h3>
                    <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                    <p className="text-sm text-gray-600">
                      Room {booking.room.roomNumber} - {booking.room.roomType.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()} ({booking.nights} nights)
                    </p>
                    <p className="text-sm font-medium">Total: ${booking.totalAmount}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => generateInvoice(booking.id)}
                        disabled={generatingInvoice}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Generate Invoice
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowPaymentDialog(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Record Payment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(invoices) && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-600">{invoice.guestName}</p>
                      <p className="text-sm text-gray-600">
                        Issued: {new Date(invoice.issuedDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium">Amount: ${invoice.totalAmount}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewInvoice(invoice.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No invoices found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentReference">Payment Reference</Label>
              <Input
                id="paymentReference"
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentReference: e.target.value }))}
                placeholder="Transaction ID, receipt number, etc."
              />
            </div>
            <div>
              <Label htmlFor="receivedBy">Received By</Label>
              <Input
                id="receivedBy"
                value={paymentForm.receivedBy}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, receivedBy: e.target.value }))}
                placeholder="Admin/Receptionist name"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={recordPayment}
                disabled={recordingPayment || !paymentForm.amount || !paymentForm.paymentMethod}
                className="flex-1"
              >
                {recordingPayment ? 'Recording...' : 'Record Payment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice View Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoicePDF invoiceData={InvoiceService.convertToInvoiceData(selectedInvoice)}>
              <Invoice data={InvoiceService.convertToInvoiceData(selectedInvoice)} />
            </InvoicePDF>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
