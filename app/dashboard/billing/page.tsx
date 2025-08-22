'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Receipt,
  Download,
  Search,
  Filter,
  RefreshCw,
  Loader,
  FileText,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Package,
  Users
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

// Import the existing booking billing component
import BillingTable from '@/components/dashboard/billing-table';

interface SupplierBill {
  id: string;
  billNumber: string;
  supplierName: string;
  supplierContact: string;
  gstNumber?: string;
  billDate: string;
  dueDate: string;
  items: BillItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paymentTerms: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillItem {
  id: string;
  itemName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  unit: string;
  costPrice: number;
  supplier?: string;
  supplierContact?: string;
}

export default function BillingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bookings');

  // Handle URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'inventory') {
      setActiveTab('inventory');
    }
  }, []);
  const [bills, setBills] = useState<SupplierBill[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddBillDialogOpen, setIsAddBillDialogOpen] = useState(false);
  const [isViewBillDialogOpen, setIsViewBillDialogOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState<SupplierBill | null>(null);

  // Sample data for demonstration
  const sampleBills: SupplierBill[] = [
    {
      id: '1',
      billNumber: 'BILL-001',
      supplierName: 'ABC Suppliers',
      supplierContact: '+91 98765 43210',
      gstNumber: '27ABCDE1234F1Z5',
      billDate: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        {
          id: '1',
          itemName: 'Floor Cleaner',
          sku: 'CLEAN-001',
          unit: 'liters',
          quantity: 10,
          unitPrice: 150,
          totalPrice: 1500
        }
      ],
      subtotal: 1500,
      gstAmount: 270,
      totalAmount: 1770,
      paymentTerms: '30 days',
      paymentMethod: 'Bank Transfer',
      status: 'pending',
      notes: 'Monthly supply order',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      billNumber: 'BILL-002',
      supplierName: 'XYZ Trading Co.',
      supplierContact: '+91 87654 32109',
      gstNumber: '29FGHIJ5678G2Z6',
      billDate: '2024-01-10',
      dueDate: '2024-02-10',
      items: [
        {
          id: '2',
          itemName: 'Shampoo',
          sku: 'SHAMPOO-001',
          unit: 'bottles',
          quantity: 50,
          unitPrice: 80,
          totalPrice: 4000
        }
      ],
      subtotal: 4000,
      gstAmount: 720,
      totalAmount: 4720,
      paymentTerms: '30 days',
      paymentMethod: 'UPI',
      status: 'paid',
      notes: 'Amenities supply',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-25T14:30:00Z'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real application, fetch from API
      setBills(sampleBills);
      
      // Fetch inventory items for bill generation
      const response = await fetch('/api/inventory/items');
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing data.',
        variant: 'destructive' as any,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || bill.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewBill = (bill: SupplierBill) => {
    setViewingBill(bill);
    setIsViewBillDialogOpen(true);
  };

  const handleDownloadBill = (bill: SupplierBill) => {
    // Implementation for downloading bill as PDF
    toast({
      title: 'Download Started',
      description: `Downloading ${bill.billNumber}...`,
    });
  };

  const handleMarkAsPaid = (bill: SupplierBill) => {
    // Implementation for marking bill as paid
    toast({
      title: 'Success',
      description: `${bill.billNumber} marked as paid.`,
    });
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Billing & Invoice Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Guest Bookings
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory Suppliers
          </TabsTrigger>
        </TabsList>

        {/* Guest Bookings Billing Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Guest Booking Billing & Invoicing</h3>
            <p className="text-muted-foreground mb-4">
              Manage guest bookings, generate bills and invoices, track payments, and handle guest billing.
            </p>
          </div>
          
          {/* Use the existing booking billing component */}
          <BillingTable />
        </TabsContent>

        {/* Inventory Supplier Billing Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Dashboard Stats for Inventory Billing */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Supplier Bills</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bills.length}</div>
                <p className="text-xs text-muted-foreground">
                  All supplier bills
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {bills.filter(bill => bill.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(bills.reduce((sum, bill) => sum + bill.totalAmount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  All supplier bills
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(bills.filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + bill.totalAmount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Outstanding payments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Create Bill Button */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Supplier Bill
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Generate bills for inventory suppliers. You can also create bills directly from the inventory items page.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setIsAddBillDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bill
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/inventory'}>
                  <Package className="h-4 w-4 mr-2" />
                  Go to Inventory
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Bills</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by supplier name or bill number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Bills Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Supplier Bills ({filteredBills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <div className="font-medium">{bill.billNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bill.supplierName}</div>
                          <div className="text-sm text-muted-foreground">{bill.supplierContact}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(bill.billDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(bill.totalAmount)}</div>
                        <div className="text-sm text-muted-foreground">
                          GST: {formatCurrency(bill.gstAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(bill.status) as any} className="flex items-center gap-1">
                          {getStatusIcon(bill.status)}
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBill(bill)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadBill(bill)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {bill.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(bill)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredBills.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No supplier bills found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Bill Dialog */}
      <Dialog open={isViewBillDialogOpen} onOpenChange={setIsViewBillDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Supplier Bill Details</DialogTitle>
          </DialogHeader>
          {viewingBill && (
            <div className="space-y-6">
              {/* Bill Header */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Supplier Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Supplier Name</Label>
                      <div className="text-sm font-medium">{viewingBill.supplierName}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Contact Number</Label>
                      <div className="text-sm">{viewingBill.supplierContact}</div>
                    </div>
                    {viewingBill.gstNumber && (
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">GST Number</Label>
                        <div className="text-sm">{viewingBill.gstNumber}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Bill Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Bill Number</Label>
                      <div className="text-sm font-medium">{viewingBill.billNumber}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Bill Date</Label>
                      <div className="text-sm">{new Date(viewingBill.billDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
                      <div className="text-sm">{new Date(viewingBill.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                      <div className="text-sm">
                        <Badge variant={getStatusColor(viewingBill.status) as any} className="flex items-center gap-1">
                          {getStatusIcon(viewingBill.status)}
                          {viewingBill.status.charAt(0).toUpperCase() + viewingBill.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingBill.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Bill Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Bill Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(viewingBill.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST Amount:</span>
                      <span className="text-green-600">{formatCurrency(viewingBill.gstAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-green-600">{formatCurrency(viewingBill.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Payment Terms</Label>
                    <div className="text-sm">{viewingBill.paymentTerms}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                    <div className="text-sm">{viewingBill.paymentMethod}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingBill.notes && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Notes</h3>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {viewingBill.notes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsViewBillDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => handleDownloadBill(viewingBill)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {viewingBill.status === 'pending' && (
                  <Button onClick={() => handleMarkAsPaid(viewingBill)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
