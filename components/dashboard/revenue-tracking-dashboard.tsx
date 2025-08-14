'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  Eye,
  Calendar,
  Users,
  CreditCard,
  Edit,
  Trash2,
  Save,
  X,
  Loader
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RevenueStatus {
  lastUpdated: Date | null;
  totalRevenue: number;
  status: 'up_to_date' | 'pending' | 'error';
}

interface BookingRevenueData {
  bookingId: string;
  guestName: string;
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  paymentStatus: string;
  revenueStatus: RevenueStatus;
  recentPayments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    receivedBy: string;
  }>;
  checkIn: string;
  checkOut: string;
  hasInvoices: boolean;
  actualBillableAmount?: number;
  originalTotalAmount?: number;
}

interface RevenueSummary {
  totalRevenue: number;
  totalBookings: number;
  paidBookings: number;
  pendingBookings: number;
  todayRevenue: number;
  thisMonthRevenue: number;
}

export default function RevenueTrackingDashboard() {
  const [recentBookings, setRecentBookings] = useState<BookingRevenueData[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRevenueData | null>(null);
  
  // Edit/Delete states
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [deletingPayment, setDeletingPayment] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    paymentMethod: '',
    notes: ''
  });

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent bookings with revenue status
      const bookingsResponse = await fetch('/api/bookings?limit=10');
      if (!bookingsResponse.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const bookings = await bookingsResponse.json();
      
      // Get revenue status for each booking
      const bookingsWithRevenue = await Promise.all(
        bookings.map(async (booking: any) => {
          try {
            const revenueResponse = await fetch(`/api/revenue/status?bookingId=${booking.id}`);
            if (revenueResponse.ok) {
              const revenueData = await revenueResponse.json();
              // Only include bookings that have invoices/bills generated
              return revenueData.hasInvoices ? revenueData : null;
            }
          } catch (error) {
            console.error(`Error fetching revenue status for booking ${booking.id}:`, error);
          }
          return null;
        })
      );

      const filteredBookings = bookingsWithRevenue.filter(Boolean);
      setRecentBookings(filteredBookings);

      // Fetch revenue summary
      const summaryResponse = await fetch('/api/revenue/enhanced');
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        console.log('Revenue summary data:', summaryData); // Debug log
        // Calculate actual revenue from billable amounts
        const actualTotalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        const actualPaidRevenue = filteredBookings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, booking) => sum + booking.totalPaid, 0);
        
        setRevenueSummary({
          totalRevenue: actualTotalRevenue,
          totalBookings: filteredBookings.length,
          paidBookings: filteredBookings.filter(b => b.paymentStatus === 'paid').length,
          pendingBookings: filteredBookings.filter(b => b.paymentStatus !== 'paid').length,
          todayRevenue: actualPaidRevenue, // Use actual paid revenue for today
          thisMonthRevenue: actualTotalRevenue, // Use total billable amount for this month
        });
      } else {
        console.log('Revenue summary failed:', summaryResponse.status); // Debug log
        // Set default values if revenue summary fails
        const actualTotalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        const actualPaidRevenue = filteredBookings
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, booking) => sum + booking.totalPaid, 0);
        
        setRevenueSummary({
          totalRevenue: actualTotalRevenue,
          totalBookings: filteredBookings.length,
          paidBookings: filteredBookings.filter(b => b.paymentStatus === 'paid').length,
          pendingBookings: filteredBookings.filter(b => b.paymentStatus !== 'paid').length,
          todayRevenue: actualPaidRevenue,
          thisMonthRevenue: actualTotalRevenue,
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch revenue data',
        variant: 'destructive',
      });
      
      // Set default values on error
      setRevenueSummary({
        totalRevenue: 0,
        totalBookings: 0,
        paidBookings: 0,
        pendingBookings: 0,
        todayRevenue: 0,
        thisMonthRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchRevenueData();
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Revenue data refreshed',
    });
  };

  // Edit payment functionality
  const handleEditPayment = (payment: any, booking: BookingRevenueData) => {
    setEditingPayment(payment);
    setSelectedBooking(booking);
    setEditForm({
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      notes: payment.notes || ''
    });
    setShowEditDialog(true);
  };

  const saveEditedPayment = async () => {
    if (!editingPayment || !selectedBooking) return;

    try {
      const response = await fetch(`/api/payments/${editingPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(editForm.amount),
          paymentMethod: editForm.paymentMethod,
          notes: editForm.notes,
          reason: 'Revenue adjustment'
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment updated successfully. Revenue automatically adjusted!',
        });
        setShowEditDialog(false);
        fetchRevenueData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment',
        variant: 'destructive',
      });
    }
  };

  // Delete payment functionality
  const handleDeletePayment = (payment: any, booking: BookingRevenueData) => {
    setDeletingPayment(payment);
    setSelectedBooking(booking);
    setShowDeleteDialog(true);
  };

  const confirmDeletePayment = async () => {
    if (!deletingPayment || !selectedBooking) return;

    try {
      const response = await fetch(`/api/payments/${deletingPayment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Revenue reversal',
          processedBy: 'Admin'
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment deleted successfully. Revenue automatically reversed!',
        });
        setShowDeleteDialog(false);
        fetchRevenueData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up_to_date':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up_to_date':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Revenue Tracking Dashboard</h2>
        <Button onClick={refreshData} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              ) : (
                `₹${(revenueSummary?.totalRevenue || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
              ) : (
                `₹${(revenueSummary?.todayRevenue || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Today's earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                revenueSummary?.totalBookings || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Bookings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                revenueSummary?.paidBookings || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings with Revenue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Bookings - Revenue Tracking Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.bookingId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{booking.guestName}</h3>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(booking.revenueStatus.status)}
                          <Badge className={getStatusColor(booking.revenueStatus.status)}>
                            Revenue {booking.revenueStatus.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                   <div>
                            <span className="text-gray-600">Invoice Amount:</span>
                            <p className="font-medium">₹{booking.totalAmount.toLocaleString()}</p>
                            {booking.originalTotalAmount && booking.originalTotalAmount !== booking.totalAmount && (
                              <p className="text-xs text-gray-500">
                                Booking Total: ₹{booking.originalTotalAmount.toLocaleString()}
                              </p>
                            )}
                          </div>
                         <div>
                           <span className="text-gray-600">Paid Amount:</span>
                           <p className="font-medium text-green-600">₹{booking.totalPaid.toLocaleString()}</p>
                         </div>
                         <div>
                           <span className="text-gray-600">Remaining:</span>
                           <p className="font-medium text-red-600">₹{booking.remainingAmount.toLocaleString()}</p>
                         </div>
                         <div>
                           <span className="text-gray-600">Stay Period:</span>
                           <p className="font-medium">
                             {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                           </p>
                         </div>
                       </div>

                      {/* Recent Payments with Edit/Delete Actions */}
                      {booking.recentPayments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">Recent Payments:</p>
                          <div className="space-y-1">
                            {booking.recentPayments.map((payment, index) => (
                              <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-3 w-3" />
                                  <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                                  <span className="text-gray-500">({payment.paymentMethod})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-gray-500">
                                    {new Date(payment.paymentDate).toLocaleDateString()} by {payment.receivedBy}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleEditPayment(payment, booking)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      onClick={() => handleDeletePayment(payment, booking)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
                         ) : (
               <div className="text-center py-8 text-gray-500">
                 <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                 <p>No bookings with invoices found</p>
                 <p className="text-sm text-gray-400 mt-2">
                   Generate invoices in Billing Management to track revenue
                 </p>
               </div>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Tracking Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Automatic Revenue Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How Automatic Revenue Tracking Works</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>When a bill is paid, revenue is automatically added to daily, monthly, and yearly reports</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Revenue is categorized by service type (accommodation, food & beverage, spa, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Payment method breakdown is tracked for financial reporting</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>If payment status changes, revenue is automatically reversed or updated</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Edit or delete payments to adjust revenue with automatic updates</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold">Up to Date</h4>
                <p className="text-sm text-gray-600">Revenue has been automatically tracked</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold">Pending</h4>
                <p className="text-sm text-gray-600">Payment pending, revenue not yet tracked</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h4 className="font-semibold">Error</h4>
                <p className="text-sm text-gray-600">Issue with revenue tracking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Payment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-paymentMethod">Payment Method</Label>
              <Input
                id="edit-paymentMethod"
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                placeholder="Payment method"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Reason for adjustment"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEditedPayment} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Warning</h4>
              <p className="text-sm text-red-800">
                Are you sure you want to delete this payment? This action will:
              </p>
              <ul className="text-sm text-red-800 mt-2 space-y-1">
                <li>• Remove the payment from the system</li>
                <li>• Automatically reverse the revenue</li>
                <li>• Update all revenue reports</li>
                <li>• Create an audit trail</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium">Payment Details:</p>
              <p className="text-sm text-gray-600">
                Amount: ₹{deletingPayment?.amount?.toLocaleString()}<br />
                Method: {deletingPayment?.paymentMethod}<br />
                Date: {deletingPayment?.paymentDate ? new Date(deletingPayment.paymentDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={confirmDeletePayment} 
                variant="destructive" 
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Payment
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
