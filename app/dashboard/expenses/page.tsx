'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Settings,
  Eye,
  DollarSign,
  Loader,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count: {
    expenses: number;
  };
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  notes?: string;
  paymentMethod?: string;
  expenseDate: string;
  referenceNumber?: string;
  isApproved: boolean;
  expenseType: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ExpensesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddExpenseType, setShowAddExpenseType] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [editingExpenseType, setEditingExpenseType] = useState<ExpenseType | null>(null);

  // Form states
  const [newExpenseType, setNewExpenseType] = useState({
    name: '',
    description: '',
  });

  const [newExpense, setNewExpense] = useState({
    expenseTypeId: '',
    amount: '',
    description: '',
    notes: '',
    paymentMethod: '',
    expenseDate: new Date(),
    referenceNumber: '',
    deductFromUserId: '',
  });

  const [filters, setFilters] = useState({
    expenseTypeId: 'all',
    userId: 'all',
    startDate: '',
    endDate: '',
    isApproved: 'all',
  });

  const userRole = (session?.user as any)?.role;
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    loadExpenseTypes();
    loadExpenses();
    loadUsers();
  }, [filters]);

  const loadExpenseTypes = async () => {
    try {
      const response = await fetch('/api/expense-types');
      if (response.ok) {
        const data = await response.json();
        setExpenseTypes(data);
      }
    } catch (error) {
      console.error('Error loading expense types:', error);
    }
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateExpenseType = async () => {
    try {
      const response = await fetch('/api/expense-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpenseType),
      });

      if (response.ok) {
        setNewExpenseType({ name: '', description: '' });
        setShowAddExpenseType(false);
        loadExpenseTypes();
        toast({ title: 'Expense type created', description: 'New expense type added successfully.' });
      } else {
        const err = await response.json();
        toast({ title: 'Failed to create expense type', description: err.error || 'Please try again', variant: 'destructive' as any });
      }
    } catch (error) {
      console.error('Error creating expense type:', error);
      toast({ title: 'Error', description: 'Error creating expense type', variant: 'destructive' as any });
    }
  };

  const handleUpdateExpenseType = async () => {
    if (!editingExpenseType) return;

    try {
      const response = await fetch('/api/expense-types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingExpenseType.id,
          name: editingExpenseType.name,
          description: editingExpenseType.description,
          isActive: editingExpenseType.isActive,
        }),
      });

      if (response.ok) {
        setEditingExpenseType(null);
        loadExpenseTypes();
        toast({ title: 'Expense type updated', description: 'Changes saved successfully.' });
      } else {
        const err = await response.json();
        toast({ title: 'Failed to update', description: err.error || 'Please try again', variant: 'destructive' as any });
      }
    } catch (error) {
      console.error('Error updating expense type:', error);
      toast({ title: 'Error', description: 'Error updating expense type', variant: 'destructive' as any });
    }
  };

  const handleDeleteExpenseType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense type?')) return;

    try {
      const response = await fetch(`/api/expense-types?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadExpenseTypes();
        toast({ title: 'Deleted', description: 'Expense type deleted or deactivated.' });
      } else {
        const err = await response.json();
        toast({ title: 'Failed to delete', description: err.error || 'Please try again', variant: 'destructive' as any });
      }
    } catch (error) {
      console.error('Error deleting expense type:', error);
      toast({ title: 'Error', description: 'Error deleting expense type', variant: 'destructive' as any });
    }
  };

  const handleCreateExpense = async () => {
    setIsCreatingExpense(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          expenseDate: newExpense.expenseDate.toISOString(),
        }),
      });

      if (response.ok) {
        setNewExpense({
          expenseTypeId: '',
          amount: '',
          description: '',
          notes: '',
          paymentMethod: '',
          expenseDate: new Date(),
          referenceNumber: '',
          deductFromUserId: '',
        });
        setShowAddExpense(false);
        loadExpenses();
        toast({ title: 'Expense added', description: 'Expense has been recorded successfully.' });
      } else {
        const err = await response.json();
        toast({ title: 'Failed to add expense', description: err.error || 'Please try again', variant: 'destructive' as any });
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({ title: 'Error', description: 'Error creating expense', variant: 'destructive' as any });
    } finally {
      setIsCreatingExpense(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const canManageExpenseTypes = userRole === 'OWNER' || userRole === 'ADMIN';
  const canExpenseFromAnyAccount = userRole === 'OWNER' || userRole === 'ADMIN';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-3xl font-bold">Expense Management</h2>
        <Button variant="outline" size="sm" onClick={loadExpenses} className="h-8 sm:h-9 text-xs sm:text-sm">
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="expenses" className="space-y-3 sm:space-y-6">
        <TabsList className="h-8 sm:h-9">
          <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
          {canManageExpenseTypes && <TabsTrigger value="expense-types" className="text-xs sm:text-sm">Expense Types</TabsTrigger>}
        </TabsList>

        <TabsContent value="expenses" className="space-y-3 sm:space-y-6">
          {/* Filters */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Horizontal filter layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 items-end">
                <div>
                  <Label className="text-[10px] sm:text-sm">Expense Type</Label>
                  <Select 
                    value={filters.expenseTypeId} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, expenseTypeId: value }))}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {expenseTypes.filter(type => type.isActive).map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {canExpenseFromAnyAccount && (
                  <div>
                    <Label className="text-[10px] sm:text-sm">User</Label>
                    <Select 
                      value={filters.userId} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, userId: value }))}
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                        <SelectValue placeholder="All users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="text-[10px] sm:text-sm">Approval Status</Label>
                  <Select 
                    value={filters.isApproved} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, isApproved: value }))}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="true">Approved</SelectItem>
                      <SelectItem value="false">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full h-8 sm:h-9 text-xs sm:text-sm" onClick={loadExpenses}>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Apply Filters
                  </Button>
                </div>

                <div className="flex items-end">
                  <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Add Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl sm:max-w-4xl mx-2 sm:mx-8 p-3 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="mb-3 sm:mb-6">
                        <DialogTitle className="text-base sm:text-xl">Add New Expense</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-[10px] sm:text-xs">Expense Type</Label>
                          <Select 
                            value={newExpense.expenseTypeId} 
                            onValueChange={(value) => setNewExpense(prev => ({ ...prev, expenseTypeId: value }))}
                          >
                            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                              <SelectValue placeholder="Select expense type" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseTypes.filter(type => type.isActive).map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-[10px] sm:text-xs">Amount (₹)</Label>
                          <Input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] sm:text-xs">Description</Label>
                          <Input
                            value={newExpense.description}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter description"
                            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] sm:text-xs">Payment Method</Label>
                          <Select 
                            value={newExpense.paymentMethod} 
                            onValueChange={(value) => setNewExpense(prev => ({ ...prev, paymentMethod: value }))}
                          >
                            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
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

                        {canExpenseFromAnyAccount && (
                          <div>
                            <Label className="text-[10px] sm:text-xs">Deduct from User Account</Label>
                            <Select 
                              value={newExpense.deductFromUserId} 
                              onValueChange={(value) => setNewExpense(prev => ({ ...prev, deductFromUserId: value }))}
                            >
                              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                                <SelectValue placeholder="Select user (default: your account)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="current_user">Your Account</SelectItem>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label className="text-[10px] sm:text-xs">Expense Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="h-8 sm:h-9 text-xs sm:text-sm w-full justify-start text-left font-normal rounded-md">
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {format(newExpense.expenseDate, 'PPP')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newExpense.expenseDate}
                                onSelect={(date) => date && setNewExpense(prev => ({ ...prev, expenseDate: date }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <Label className="text-[10px] sm:text-xs">Reference Number (Optional)</Label>
                          <Input
                            value={newExpense.referenceNumber}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, referenceNumber: e.target.value }))}
                            placeholder="Receipt/Bill reference"
                            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] sm:text-xs">Notes (Optional)</Label>
                          <Input
                            value={newExpense.notes}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes"
                            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                          />
                        </div>

                        <div className="md:col-span-2 flex gap-2 pt-3 border-t">
                          <Button 
                            variant="outline"
                            onClick={() => setShowAddExpense(false)} 
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateExpense} 
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                            disabled={isCreatingExpense || !newExpense.expenseTypeId || !newExpense.amount || !newExpense.description}
                          >
                            {isCreatingExpense ? (
                              <span className="inline-flex items-center gap-2">
                                <svg className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Creating...
                              </span>
                            ) : (
                              'Create Expense'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Date</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Type</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Description</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Amount</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">User</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Payment Method</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">{expense.expenseType.name}</TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          <div>
                            <div className="font-medium">{expense.description}</div>
                            {expense.notes && (
                              <div className="text-[9px] sm:text-xs text-muted-foreground">{expense.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4 font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          <div>
                            <div className="font-medium">{expense.user.name}</div>
                            <Badge variant="outline" className="text-[9px] sm:text-xs">
                              {expense.user.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          {expense.paymentMethod && (
                            <Badge variant="secondary" className="text-[9px] sm:text-xs">
                              {expense.paymentMethod.replace('_', ' ').toUpperCase()}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          {expense.isApproved ? (
                            <Badge variant="default" className="flex items-center gap-1 text-[9px] sm:text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 text-[9px] sm:text-xs">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageExpenseTypes && (
          <TabsContent value="expense-types" className="space-y-3 sm:space-y-6">
            <Card className="rounded-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    Expense Types Management
                  </span>
                  <Dialog open={showAddExpenseType} onOpenChange={setShowAddExpenseType}>
                    <DialogTrigger asChild>
                      <Button className="h-8 sm:h-9 text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Add Expense Type
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl sm:max-w-4xl mx-2 sm:mx-8 p-3 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="mb-3 sm:mb-6">
                        <DialogTitle className="text-base sm:text-xl">Add New Expense Type</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <Label className="text-[10px] sm:text-xs">Name</Label>
                          <Input
                            value={newExpenseType.name}
                            onChange={(e) => setNewExpenseType(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Light Bill, Gas, Wi-Fi"
                            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] sm:text-xs">Description (Optional)</Label>
                          <Textarea
                            value={newExpenseType.description}
                            onChange={(e) => setNewExpenseType(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe this expense type"
                            className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                          />
                        </div>
                        <div className="flex gap-2 pt-3 border-t">
                          <Button 
                            variant="outline"
                            onClick={() => setShowAddExpenseType(false)} 
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateExpenseType} 
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                            disabled={!newExpenseType.name}
                          >
                            Create Expense Type
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Name</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Description</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Status</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Expenses Count</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {expenseTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4 font-medium">{type.name}</TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">{type.description || '-'}</TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          <Badge variant={type.isActive ? 'default' : 'secondary'} className="text-[9px] sm:text-xs">
                            {type.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">{type._count.expenses}</TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => setEditingExpenseType(type)}
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => handleDeleteExpenseType(type.id)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Expense Type Dialog */}
      {editingExpenseType && (
        <Dialog open={!!editingExpenseType} onOpenChange={() => setEditingExpenseType(null)}>
          <DialogContent className="max-w-2xl sm:max-w-4xl mx-2 sm:mx-8 p-3 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-3 sm:mb-6">
              <DialogTitle className="text-base sm:text-xl">Edit Expense Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-[10px] sm:text-xs">Name</Label>
                <Input
                  value={editingExpenseType.name}
                  onChange={(e) => setEditingExpenseType(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs">Description</Label>
                <Textarea
                  value={editingExpenseType.description || ''}
                  onChange={(e) => setEditingExpenseType(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingExpenseType.isActive}
                  onChange={(e) => setEditingExpenseType(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                />
                <Label className="text-[10px] sm:text-xs">Active</Label>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button 
                  variant="outline"
                  onClick={() => setEditingExpenseType(null)} 
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateExpenseType} className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
                  Update Expense Type
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
