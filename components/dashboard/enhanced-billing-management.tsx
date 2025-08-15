'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  DollarSign, 
  CreditCard, 
  Plus, 
  Minus, 
  Edit, 
  Send, 
  MessageCircle,
  Download,
  Eye,
  Calculator,
  Split,
  Receipt,
  Mail,
  Phone
} from 'lucide-react';
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

interface BillItem {
  id: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  taxAmount: number;
  finalAmount: number;
  service?: {
    name: string;
    category: string;
  };
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  taxable: boolean;
}

interface PaymentSummary {
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  paymentStatus: string;
  payments: any[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function EnhancedBillingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showBillItemDialog, setShowBillItemDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSplitPaymentDialog, setShowSplitPaymentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  // Form states
  const [billItemForm, setBillItemForm] = useState({
    serviceId: '',
    itemName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: '',
    paymentReference: '',
    receivedBy: '',
    notes: '',
    transactionId: '',
  });

  const [splitPayments, setSplitPayments] = useState([
    { amount: 0, paymentMethod: 'cash', description: '' }
  ]);

  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      fetchBillItems(selectedBooking.id);
      fetchPaymentSummary(selectedBooking.id);
    }
  }, [selectedBooking]);

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

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/billing/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBillItems = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/billing/bill-items?bookingId=${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBillItems(data);
      }
    } catch (error) {
      console.error('Error fetching bill items:', error);
    }
  };

  const fetchPaymentSummary = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/billing/payment-summary?bookingId=${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentSummary(data);
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    }
  };

  const addBillItem = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch('/api/billing/bill-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          ...billItemForm,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Bill item added successfully' });
        setShowBillItemDialog(false);
        setBillItemForm({
          serviceId: '',
          itemName: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
        });
        fetchBillItems(selectedBooking.id);
        fetchPaymentSummary(selectedBooking.id);
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error adding bill item:', error);
      toast({ title: 'Error', description: 'Failed to add bill item', variant: 'destructive' });
    }
  };

  const removeBillItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/billing/bill-items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Bill item removed successfully' });
        fetchBillItems(selectedBooking!.id);
        fetchPaymentSummary(selectedBooking!.id);
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error removing bill item:', error);
      toast({ title: 'Error', description: 'Failed to remove bill item', variant: 'destructive' });
    }
  };

  const recordPayment = async () => {
    if (!selectedBooking) return;

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
          notes: paymentForm.notes,
          transactionId: paymentForm.transactionId,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Payment recorded successfully' });
        setShowPaymentDialog(false);
        setPaymentForm({
          amount: '',
          paymentMethod: '',
          paymentReference: '',
          receivedBy: '',
          notes: '',
          transactionId: '',
        });
        fetchPaymentSummary(selectedBooking.id);
        fetchBookings();
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({ title: 'Error', description: 'Failed to record payment', variant: 'destructive' });
    }
  };

  const setupSplitPayments = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch('/api/billing/split-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          splitPayments,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Split payments configured successfully' });
        setShowSplitPaymentDialog(false);
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error setting up split payments:', error);
      toast({ title: 'Error', description: 'Failed to setup split payments', variant: 'destructive' });
    }
  };

  const generateInvoice = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch('/api/enhanced-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          includeQRCode: true,
          sendEmail: false,
          sendWhatsApp: false,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'GST invoice generated successfully' });
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({ title: 'Error', description: 'Failed to generate invoice', variant: 'destructive' });
    }
  };

  const createGuestAccess = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch('/api/guest-billing/create-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedBooking.id }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({ 
          title: 'Success', 
          description: `Guest billing access created. URL: ${data.url}` 
        });
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error creating guest access:', error);
      toast({ title: 'Error', description: 'Failed to create guest access', variant: 'destructive' });
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { amount: 0, paymentMethod: 'cash', description: '' }]);
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const updateSplitPayment = (index: number, field: string, value: any) => {
    const updated = [...splitPayments];
    updated[index] = { ...updated[index], [field]: value };
    setSplitPayments(updated);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enhanced Billing Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedBooking?.id === booking.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="font-semibold">{booking.guestName}</div>
                <div className="text-sm text-gray-600">
                  Room {booking.room.roomNumber} - {booking.room.roomType.name}
                </div>
                <div className="text-sm text-gray-600">
                  ₹{booking.totalAmount.toFixed(2)}
                </div>
                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                  {booking.paymentStatus.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Billing Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing Details
              {selectedBooking && (
                <span className="text-lg font-normal text-gray-600">
                  - {selectedBooking.guestName}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedBooking ? (
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="items">Bill Items</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Bill Items</h3>
                    <Button onClick={() => setShowBillItemDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.itemName}</div>
                              {item.description && (
                                <div className="text-sm text-gray-600">{item.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>₹{item.finalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBillItem(item.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Payment Summary</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSplitPaymentDialog(true)}
                      >
                        <Split className="h-4 w-4 mr-2" />
                        Split Payment
                      </Button>
                      <Button onClick={() => setShowPaymentDialog(true)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                    </div>
                  </div>

                  {paymentSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-600">Total Amount</div>
                          <div className="text-2xl font-bold">₹{paymentSummary.totalAmount.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-600">Total Paid</div>
                          <div className="text-2xl font-bold text-green-600">₹{paymentSummary.totalPaid.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-600">Remaining</div>
                          <div className="text-2xl font-bold text-red-600">₹{paymentSummary.remainingAmount.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-600">Status</div>
                          <Badge className={getPaymentStatusColor(paymentSummary.paymentStatus)}>
                            {paymentSummary.paymentStatus.replace('_', ' ')}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {paymentSummary?.payments && paymentSummary.payments.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Received By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentSummary.payments.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{payment.paymentReference || '-'}</TableCell>
                            <TableCell>{payment.receivedBy || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Invoices</h3>
                    <Button onClick={generateInvoice}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate GST Invoice
                    </Button>
                  </div>
                  {/* Invoice list will be implemented */}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={createGuestAccess} variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Create Guest View
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send WhatsApp
                    </Button>
                    <Button variant="outline">
                      <Calculator className="h-4 w-4 mr-2" />
                      Recalculate
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a booking to view billing details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Bill Item Dialog */}
      <Dialog open={showBillItemDialog} onOpenChange={setShowBillItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bill Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service">Service (Optional)</Label>
              <Select
                value={billItemForm.serviceId}
                onValueChange={(value) => {
                  setBillItemForm(prev => ({ ...prev, serviceId: value }));
                  const service = services.find(s => s.id === value);
                  if (service) {
                    setBillItemForm(prev => ({
                      ...prev,
                      itemName: service.name,
                      unitPrice: service.price,
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ₹{service.price} ({service.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={billItemForm.itemName}
                onChange={(e) => setBillItemForm(prev => ({ ...prev, itemName: e.target.value }))}
                placeholder="Enter item name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={billItemForm.description}
                onChange={(e) => setBillItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={billItemForm.quantity}
                  onChange={(e) => setBillItemForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={billItemForm.unitPrice}
                  onChange={(e) => setBillItemForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={billItemForm.discount}
                onChange={(e) => setBillItemForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addBillItem} className="flex-1">
                Add Item
              </Button>
              <Button variant="outline" onClick={() => setShowBillItemDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online_gateway">Online Gateway</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                placeholder="Gateway transaction ID"
              />
            </div>
            <div>
              <Label htmlFor="receivedBy">Received By</Label>
              <Select
                value={paymentForm.receivedBy}
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, receivedBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-gray-500">{user.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={!paymentForm.amount || !paymentForm.paymentMethod}
                className="flex-1"
              >
                Record Payment
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

      {/* Split Payment Dialog */}
      <Dialog open={showSplitPaymentDialog} onOpenChange={setShowSplitPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setup Split Payments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {splitPayments.map((payment, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => updateSplitPayment(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex-1">
                  <Label>Payment Method</Label>
                  <Select
                    value={payment.paymentMethod}
                    onValueChange={(value) => updateSplitPayment(index, 'paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="online_gateway">Online Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input
                    value={payment.description}
                    onChange={(e) => updateSplitPayment(index, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSplitPayment(index)}
                  disabled={splitPayments.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={addSplitPayment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
              <div className="text-lg font-semibold">
                Total: ₹{splitPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={setupSplitPayments} className="flex-1">
                Setup Split Payments
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSplitPaymentDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
