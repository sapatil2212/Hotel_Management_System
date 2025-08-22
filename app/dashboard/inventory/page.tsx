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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Package, 
  AlertTriangle,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Loader,
  Warehouse,
  ShoppingCart,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Receipt,
  Download
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count: {
    items: number;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  sku?: string;
  barcode?: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  costPrice: number;
  sellingPrice?: number;
  supplier?: string;
  supplierContact?: string;
  location?: string;
  expiryDate?: string;
  isActive: boolean;
  category: {
    name: string;
  };
}

interface InventoryFormData {
  name: string;
  description: string;
  categoryId: string;
  sku: string;
  barcode: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  supplierContact: string;
  location: string;
  expiryDate: string;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [billingItem, setBillingItem] = useState<InventoryItem | null>(null);
  const [billFormData, setBillFormData] = useState({
    gstNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: 1,
    unitPrice: 0,
    gstApplicable: 'yes',
    paymentTerms: '30',
    paymentMethod: 'bank',
    notes: ''
  });

  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    description: '',
    categoryId: '',
    sku: '',
    barcode: '',
    unit: '',
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    supplierContact: '',
    location: '',
    expiryDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/inventory/items'),
        fetch('/api/inventory/categories?activeOnly=true')
      ]);

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory data.',
        variant: 'destructive' as any,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      sku: '',
      barcode: '',
      unit: '',
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      costPrice: 0,
      sellingPrice: 0,
      supplier: '',
      supplierContact: '',
      location: '',
      expiryDate: '',
    });
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Inventory item added successfully.',
        });
        setIsAddDialogOpen(false);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to add inventory item.',
          variant: 'destructive' as any,
        });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add inventory item.',
        variant: 'destructive' as any,
      });
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch('/api/inventory/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingItem.id,
          ...formData,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Inventory item updated successfully.',
        });
        setIsEditDialogOpen(false);
        setEditingItem(null);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update inventory item.',
          variant: 'destructive' as any,
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory item.',
        variant: 'destructive' as any,
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      const response = await fetch(`/api/inventory/items?id=${deletingItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Inventory item deleted successfully.',
        });
        setDeletingItem(null);
        loadData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete inventory item.',
          variant: 'destructive' as any,
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item.',
        variant: 'destructive' as any,
      });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId,
      sku: item.sku || '',
      barcode: item.barcode || '',
      unit: item.unit,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock || 0,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice || 0,
      supplier: item.supplier || '',
      supplierContact: item.supplierContact || '',
      location: item.location || '',
      expiryDate: item.expiryDate || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (item: InventoryItem) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const openBillDialog = (item: InventoryItem) => {
    setBillingItem(item);
    setBillFormData({
      gstNumber: '',
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 1,
      unitPrice: item.costPrice,
      gstApplicable: 'yes',
      paymentTerms: '30',
      paymentMethod: 'bank',
      notes: ''
    });
    setIsBillDialogOpen(true);
  };

  const calculateBillAmounts = () => {
    if (!billingItem) return { subtotal: 0, gstAmount: 0, totalAmount: 0 };
    
    const subtotal = billFormData.quantity * billFormData.unitPrice;
    const gstAmount = billFormData.gstApplicable === 'yes' ? subtotal * 0.18 : 0;
    const totalAmount = subtotal + gstAmount;
    
    return { subtotal, gstAmount, totalAmount };
  };

  const handleGenerateBill = async () => {
    if (!billingItem) return;

    try {
      const { subtotal, gstAmount, totalAmount } = calculateBillAmounts();
      
      const billData = {
        supplierName: billingItem.supplier || 'Unknown Supplier',
        supplierContact: billingItem.supplierContact || '',
        gstNumber: billFormData.gstNumber,
        billDate: billFormData.billDate,
        dueDate: billFormData.dueDate,
        items: [{
          itemName: billingItem.name,
          sku: billingItem.sku || '',
          unit: billingItem.unit,
          quantity: billFormData.quantity,
          unitPrice: billFormData.unitPrice,
          totalPrice: subtotal
        }],
        subtotal,
        gstAmount,
        totalAmount,
        paymentTerms: `${billFormData.paymentTerms} days`,
        paymentMethod: billFormData.paymentMethod === 'bank' ? 'Bank Transfer' : 
                      billFormData.paymentMethod === 'cash' ? 'Cash' :
                      billFormData.paymentMethod === 'cheque' ? 'Cheque' : 'UPI',
        notes: billFormData.notes
      };

      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Bill generated successfully!',
        });
        setIsBillDialogOpen(false);
        // Optionally redirect to billing page
        window.location.href = '/dashboard/billing';
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to generate bill.',
          variant: 'destructive' as any,
        });
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate bill.',
        variant: 'destructive' as any,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { status: 'out_of_stock', color: 'destructive' };
    } else if (item.currentStock <= item.minimumStock) {
      return { status: 'low_stock', color: 'warning' };
    }
    return { status: 'in_stock', color: 'default' };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Enter SKU"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Enter barcode"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., kg, liters, pieces"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Minimum Stock *</Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumStock">Maximum Stock</Label>
                  <Input
                    id="maximumStock"
                    type="number"
                    value={formData.maximumStock}
                    onChange={(e) => setFormData({ ...formData, maximumStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price *</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierContact">Supplier Contact</Label>
                  <Input
                    id="supplierContact"
                    value={formData.supplierContact}
                    onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Storage Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter storage location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem} disabled={!formData.name || !formData.categoryId || !formData.unit}>
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

             {/* Dashboard Stats */}
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Items</CardTitle>
             <Package className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{items.length}</div>
             <p className="text-xs text-muted-foreground">
               {filteredItems.length} of {items.length} shown
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
             <AlertTriangle className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-amber-600">
               {items.filter(item => item.currentStock <= item.minimumStock && item.currentStock > 0).length}
             </div>
             <p className="text-xs text-muted-foreground">
               Items below minimum stock
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
             <BarChart3 className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">
               {formatCurrency(items.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0))}
             </div>
             <p className="text-xs text-muted-foreground">
               Current stock × cost price
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
             <AlertCircle className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-red-600">
               {items.filter(item => item.currentStock === 0).length}
             </div>
             <p className="text-xs text-muted-foreground">
               Items with zero stock
             </p>
           </CardContent>
         </Card>
       </div>

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
              <Label htmlFor="search">Search Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Inventory Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.sku && <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{item.category.name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.currentStock} {item.unit}</div>
                        <div className="text-sm text-muted-foreground">
                          Min: {item.minimumStock} {item.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.costPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.currentStock * item.costPrice)}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color as any}>
                        {stockStatus.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                                         <TableCell>
                       <div className="flex items-center space-x-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => openViewDialog(item)}
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => openEditDialog(item)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                                                   <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/dashboard/billing?tab=inventory'}
                            title="Generate Supplier Bill"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => setDeletingItem(item)}
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel onClick={() => setDeletingItem(null)}>
                                 Cancel
                               </AlertDialogCancel>
                               <AlertDialogAction onClick={handleDeleteItem}>
                                 Delete
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </div>
                     </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-barcode">Barcode</Label>
              <Input
                id="edit-barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit *</Label>
              <Input
                id="edit-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., kg, liters, pieces"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-minimumStock">Minimum Stock *</Label>
              <Input
                id="edit-minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maximumStock">Maximum Stock</Label>
              <Input
                id="edit-maximumStock"
                type="number"
                value={formData.maximumStock}
                onChange={(e) => setFormData({ ...formData, maximumStock: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Cost Price *</Label>
              <Input
                id="edit-costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sellingPrice">Selling Price</Label>
              <Input
                id="edit-sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplierContact">Supplier Contact</Label>
              <Input
                id="edit-supplierContact"
                value={formData.supplierContact}
                onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                placeholder="Enter contact number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Storage Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter storage location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">Expiry Date</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem} disabled={!formData.name || !formData.categoryId || !formData.unit}>
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Inventory Item Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Item Name</Label>
                      <div className="text-sm font-medium">{viewingItem.name}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                      <div className="text-sm">{viewingItem.category.name}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">SKU</Label>
                      <div className="text-sm">{viewingItem.sku || 'Not specified'}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Barcode</Label>
                      <div className="text-sm">{viewingItem.barcode || 'Not specified'}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Unit</Label>
                      <div className="text-sm">{viewingItem.unit}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                      <div className="text-sm">
                        <Badge variant={getStockStatus(viewingItem).color as any} className="text-xs">
                          {getStockStatus(viewingItem).status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Stock Information</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Current Stock</Label>
                      <div className="text-lg font-bold">{viewingItem.currentStock} {viewingItem.unit}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Minimum Stock</Label>
                      <div className="text-lg font-bold text-amber-600">{viewingItem.minimumStock} {viewingItem.unit}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Maximum Stock</Label>
                      <div className="text-lg font-bold text-blue-600">{viewingItem.maximumStock || 'Not set'} {viewingItem.unit}</div>
                    </div>
                  </div>
                </div>

                {/* Supplier Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Supplier Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Supplier</Label>
                      <div className="text-sm">{viewingItem.supplier || 'Not specified'}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Contact</Label>
                      <div className="text-sm">{viewingItem.supplierContact || 'Not specified'}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Storage Location</Label>
                      <div className="text-sm">{viewingItem.location || 'Not specified'}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Expiry Date</Label>
                      <div className="text-sm">
                        {viewingItem.expiryDate 
                          ? new Date(viewingItem.expiryDate).toLocaleDateString()
                          : 'Not specified'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Financial Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Financial Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Cost Price</Label>
                      <div className="text-lg font-bold">{formatCurrency(viewingItem.costPrice)}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Selling Price</Label>
                      <div className="text-lg font-bold">{formatCurrency(viewingItem.sellingPrice || 0)}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Total Value</Label>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(viewingItem.currentStock * viewingItem.costPrice)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Profit Margin</Label>
                      <div className="text-lg font-bold text-blue-600">
                        {viewingItem.sellingPrice && viewingItem.costPrice > 0
                          ? `${(((viewingItem.sellingPrice - viewingItem.costPrice) / viewingItem.costPrice) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {viewingItem.description && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Description</h3>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {viewingItem.description}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Quick Actions</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        openEditDialog(viewingItem);
                      }}
                      className="text-xs"
                    >
                      Edit Item
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsViewDialogOpen(false)}
                      className="text-xs"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
                     )}
         </DialogContent>
       </Dialog>

       {/* Generate Bill Dialog */}
       <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="text-lg">Generate Supplier Bill</DialogTitle>
           </DialogHeader>
           {billingItem && (
             <div className="space-y-6">
               {/* Bill Header */}
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Supplier Information</h3>
                   <div className="space-y-3">
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Supplier Name</Label>
                       <div className="text-sm font-medium">{billingItem.supplier || 'Not specified'}</div>
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Contact Number</Label>
                       <div className="text-sm">{billingItem.supplierContact || 'Not specified'}</div>
                     </div>
                                           <div>
                        <Label className="text-xs font-medium text-muted-foreground">GST Number</Label>
                        <Input 
                          placeholder="Enter GST number" 
                          className="text-xs"
                          value={billFormData.gstNumber}
                          onChange={(e) => setBillFormData({ ...billFormData, gstNumber: e.target.value })}
                        />
                      </div>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Bill Details</h3>
                   <div className="space-y-3">
                                           <div>
                        <Label className="text-xs font-medium text-muted-foreground">Bill Number</Label>
                        <Input 
                          placeholder="Auto-generated" 
                          className="text-xs"
                          value={`BILL-${Date.now().toString().slice(-6)}`}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Bill Date</Label>
                        <Input 
                          type="date" 
                          className="text-xs"
                          value={billFormData.billDate}
                          onChange={(e) => setBillFormData({ ...billFormData, billDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
                        <Input 
                          type="date" 
                          className="text-xs"
                          value={billFormData.dueDate}
                          onChange={(e) => setBillFormData({ ...billFormData, dueDate: e.target.value })}
                        />
                      </div>
                   </div>
                 </div>
               </div>

               {/* Item Details */}
               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Item Details</h3>
                 <div className="border rounded-lg p-4">
                   <div className="grid grid-cols-4 gap-4 text-xs">
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Item Name</Label>
                       <div className="text-sm font-medium">{billingItem.name}</div>
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">SKU</Label>
                       <div className="text-sm">{billingItem.sku || 'N/A'}</div>
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Unit</Label>
                       <div className="text-sm">{billingItem.unit}</div>
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                       <Input 
                         type="number" 
                         placeholder="Enter quantity"
                         className="text-xs"
                         value={billFormData.quantity}
                         onChange={(e) => setBillFormData({ ...billFormData, quantity: parseInt(e.target.value) || 1 })}
                       />
                     </div>
                   </div>
                 </div>
               </div>

               {/* Pricing Details */}
               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Pricing Details</h3>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Unit Price (₹)</Label>
                       <Input 
                         type="number" 
                         placeholder="Enter unit price"
                         className="text-xs"
                         value={billFormData.unitPrice}
                         onChange={(e) => setBillFormData({ ...billFormData, unitPrice: parseFloat(e.target.value) || 0 })}
                       />
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
                       <Input 
                         type="number" 
                         placeholder="Enter quantity"
                         className="text-xs"
                         value={billFormData.quantity}
                         onChange={(e) => setBillFormData({ ...billFormData, quantity: parseInt(e.target.value) || 1 })}
                       />
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Subtotal (₹)</Label>
                       <div className="text-lg font-bold text-blue-600">
                         {formatCurrency(calculateBillAmounts().subtotal)}
                       </div>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">GST Applicable</Label>
                       <Select value={billFormData.gstApplicable} onValueChange={(value) => setBillFormData({ ...billFormData, gstApplicable: value })}>
                         <SelectTrigger className="text-xs">
                           <SelectValue placeholder="Select GST option" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="yes">Yes - 18% GST</SelectItem>
                           <SelectItem value="no">No GST</SelectItem>
                           <SelectItem value="exempt">GST Exempt</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">GST Amount (₹)</Label>
                       <div className="text-sm font-medium text-green-600">
                         {formatCurrency(calculateBillAmounts().gstAmount)}
                       </div>
                     </div>
                     <div>
                       <Label className="text-xs font-medium text-muted-foreground">Total Amount (₹)</Label>
                       <div className="text-xl font-bold text-green-600">
                         {formatCurrency(calculateBillAmounts().totalAmount)}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Additional Details */}
               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Additional Details</h3>
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">Payment Terms</Label>
                     <Select value={billFormData.paymentTerms} onValueChange={(value) => setBillFormData({ ...billFormData, paymentTerms: value })}>
                       <SelectTrigger className="text-xs">
                         <SelectValue placeholder="Select payment terms" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="0">Immediate</SelectItem>
                         <SelectItem value="7">7 days</SelectItem>
                         <SelectItem value="15">15 days</SelectItem>
                         <SelectItem value="30">30 days</SelectItem>
                         <SelectItem value="45">45 days</SelectItem>
                         <SelectItem value="60">60 days</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                     <Select value={billFormData.paymentMethod} onValueChange={(value) => setBillFormData({ ...billFormData, paymentMethod: value })}>
                       <SelectTrigger className="text-xs">
                         <SelectValue placeholder="Select payment method" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="cash">Cash</SelectItem>
                         <SelectItem value="bank">Bank Transfer</SelectItem>
                         <SelectItem value="cheque">Cheque</SelectItem>
                         <SelectItem value="upi">UPI</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
                                   <div>
                    <Label className="text-xs font-medium text-muted-foreground">Notes/Remarks</Label>
                    <Textarea 
                      placeholder="Enter any additional notes or remarks..."
                      className="text-xs"
                      rows={3}
                      value={billFormData.notes}
                      onChange={(e) => setBillFormData({ ...billFormData, notes: e.target.value })}
                    />
                  </div>
               </div>

               {/* Bill Summary */}
               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Bill Summary</h3>
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <div className="grid grid-cols-2 gap-4 text-sm">
                                           <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span>{formatCurrency(calculateBillAmounts().subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GST (18%):</span>
                          <span className="text-green-600">{formatCurrency(calculateBillAmounts().gstAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Amount:</span>
                          <span className="text-green-600">{formatCurrency(calculateBillAmounts().totalAmount)}</span>
                        </div>
                      </div>
                     <div className="space-y-2">
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Bill Number:</span>
                         <span>BILL-{Date.now().toString().slice(-6)}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Bill Date:</span>
                         <span>{new Date().toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Due Date:</span>
                         <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

                               {/* Action Buttons */}
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsBillDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={() => {
                    // Preview functionality - could open a new tab with bill preview
                    const { subtotal, gstAmount, totalAmount } = calculateBillAmounts();
                    const previewData = {
                      billNumber: `BILL-${Date.now().toString().slice(-6)}`,
                      supplierName: billingItem.supplier || 'Unknown Supplier',
                      itemName: billingItem.name,
                      quantity: billFormData.quantity,
                      unitPrice: billFormData.unitPrice,
                      subtotal,
                      gstAmount,
                      totalAmount,
                      billDate: billFormData.billDate,
                      dueDate: billFormData.dueDate
                    };
                    console.log('Bill Preview:', previewData);
                    toast({
                      title: 'Bill Preview',
                      description: 'Bill preview data logged to console. Check browser console for details.',
                    });
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Preview Bill
                  </Button>
                  <Button onClick={handleGenerateBill}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Generate Bill
                  </Button>
                </DialogFooter>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 }
