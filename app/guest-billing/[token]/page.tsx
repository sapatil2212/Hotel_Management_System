'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Receipt, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  CreditCard,
  Download,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GuestBillingData {
  booking: any;
  billCalculation: any;
  paymentSummary: any;
  viewInfo: {
    viewCount: number;
    lastViewed: Date;
  };
}

export default function GuestBillingPage({ params }: { params: { token: string } }) {
  const [billingData, setBillingData] = useState<GuestBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBillingData();
  }, [params.token]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guest-billing/${params.token}`);
      
      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json();
          setError(errorData.error || 'Invalid or expired access token');
        } else {
          setError('Failed to load billing information');
        }
        return;
      }

      const data = await response.json();
      setBillingData(data);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setError('Failed to load billing information');
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-2">Access Unavailable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return null;
  }

  const { booking, billCalculation, paymentSummary } = billingData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Your Billing Information</h1>
          <p className="text-gray-600">Real-time view of your hotel charges and payments</p>
        </div>

        {/* Guest Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg">{booking.guestName}</h3>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <Mail className="h-4 w-4" />
                  {booking.guestEmail}
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Phone className="h-4 w-4" />
                  {booking.guestPhone}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  Room {booking.room.roomNumber} - {booking.room.roomType.name}
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                </div>
                <div className="mt-2">
                  <Badge variant="outline">
                    {booking.nights} night{booking.nights > 1 ? 's' : ''} • {booking.adults} adult{booking.adults > 1 ? 's' : ''} 
                    {booking.children > 0 && ` • ${booking.children} child${booking.children > 1 ? 'ren' : ''}`}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paymentSummary.totalAmount)}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(paymentSummary.totalPaid)}
                </div>
                <div className="text-sm text-gray-600">Amount Paid</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(paymentSummary.remainingAmount)}
                </div>
                <div className="text-sm text-gray-600">Amount Due</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Badge className={getPaymentStatusColor(paymentSummary.paymentStatus)}>
                  {paymentSummary.paymentStatus.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="text-sm text-gray-600 mt-2">Payment Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bill Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billCalculation.itemsBreakdown.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{item.itemName}</div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.finalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(billCalculation.subtotal)}</span>
              </div>
              {billCalculation.totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(billCalculation.totalDiscount)}</span>
                </div>
              )}
              {billCalculation.gstAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>{formatCurrency(billCalculation.gstAmount)}</span>
                </div>
              )}
              {billCalculation.serviceTaxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service Tax:</span>
                  <span>{formatCurrency(billCalculation.serviceTaxAmount)}</span>
                </div>
              )}
              {billCalculation.otherTaxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Other Taxes:</span>
                  <span>{formatCurrency(billCalculation.otherTaxAmount)}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>{formatCurrency(billCalculation.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        {paymentSummary.payments.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentSummary.payments.map((payment: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.paymentReference || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchBillingData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  Print/Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a secure view of your billing information.</p>
          <p>For any questions, please contact the hotel reception.</p>
        </div>
      </div>
    </div>
  );
}
