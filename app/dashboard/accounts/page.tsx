'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Banknote, 
  ArrowUpDown, 
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Building,
  Eye,
  ArrowRight,
  History,
  Plus,
  Minus,
  Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface UserAccount {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  isActive: boolean;
  userId?: string;
  userName?: string;
  isMainAccount: boolean;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: string;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  paymentMethod?: string;
  processedBy?: string;
  notes?: string;
  transactionDate: string;
  isModification: boolean;
  originalAmount?: number;
  modificationReason?: string;
  account: {
    id: string;
    accountName: string;
    user?: {
      id: string;
      name: string;
    };
  };
}

interface TransferForm {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string;
}

interface ManualTransactionForm {
  accountId: string;
  amount: string;
  type: 'deposit' | 'withdrawal';
  description: string;
  notes: string;
  paymentMethod: string;
}

export default function AccountsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showManualTransactionDialog, setShowManualTransactionDialog] = useState(false);
  
  const [transferForm, setTransferForm] = useState<TransferForm>({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
  });

  const [manualTransactionForm, setManualTransactionForm] = useState<ManualTransactionForm>({
    accountId: '',
    amount: '',
    type: 'deposit',
    description: '',
    notes: '',
    paymentMethod: '',
  });

  const [filters, setFilters] = useState({
    accountId: 'all',
    startDate: '',
    endDate: '',
    type: 'all',
    category: 'all',
  });

  const userRole = (session?.user as any)?.role;
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    loadAccounts();
    loadTransactions();
  }, [filters]);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/accounts?action=user-accounts');
      if (response.ok) {
        const data = await response.json();
        // Filter to show only main hotel account
        const mainAccount = data.filter((account: UserAccount) => account.isMainAccount);
        setAccounts(mainAccount);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/accounts/transactions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount || !transferForm.description) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/accounts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: transferForm.fromAccountId,
          toAccountId: transferForm.toAccountId,
          amount: parseFloat(transferForm.amount),
          description: transferForm.description,
        }),
      });

      if (response.ok) {
        setTransferForm({
          fromAccountId: '',
          toAccountId: '',
          amount: '',
          description: '',
        });
        setShowTransferDialog(false);
        loadAccounts();
        loadTransactions();
      } else {
        const error = await response.json();
        toast({ title: 'Transfer failed', description: error.error || 'Please try again', variant: 'destructive' as any });
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
      toast({ title: 'Transfer failed', description: 'Unexpected error occurred', variant: 'destructive' as any });
    }
  };

  const handleManualTransaction = async () => {
    if (!manualTransactionForm.accountId || !manualTransactionForm.amount || !manualTransactionForm.description) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/accounts/manual-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: manualTransactionForm.accountId,
          amount: parseFloat(manualTransactionForm.amount),
          type: manualTransactionForm.type,
          description: manualTransactionForm.description,
          notes: manualTransactionForm.notes,
          paymentMethod: manualTransactionForm.paymentMethod || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setManualTransactionForm({
          accountId: '',
          amount: '',
          type: 'deposit',
          description: '',
          notes: '',
          paymentMethod: '',
        });
        setShowManualTransactionDialog(false);
        loadAccounts();
        loadTransactions();
        toast({ title: 'Success', description: `${manualTransactionForm.type === 'deposit' ? 'Deposit' : 'Withdrawal'} completed successfully.` });
      } else {
        const error = await response.json();
        toast({ title: 'Action failed', description: error.error || `${manualTransactionForm.type === 'deposit' ? 'Deposit' : 'Withdrawal'} failed`, variant: 'destructive' as any });
      }
    } catch (error) {
      console.error('Error processing manual transaction:', error);
      toast({ title: 'Action failed', description: `${manualTransactionForm.type === 'deposit' ? 'Deposit' : 'Withdrawal'} failed`, variant: 'destructive' as any });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'credit') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getMainAccountBalance = () => {
    const mainAccount = accounts.find(account => account.isMainAccount);
    return mainAccount ? mainAccount.balance : 0;
  };

  const getUserAccountsBalance = () => {
    return accounts
      .filter(account => !account.isMainAccount)
      .reduce((total, account) => total + account.balance, 0);
  };

  const canViewAllAccounts = userRole === 'OWNER' || userRole === 'ADMIN';
  const canTransferFunds = userRole === 'OWNER' || userRole === 'ADMIN';

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Account Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadAccounts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canTransferFunds && (
            <>
              <Dialog open={showManualTransactionDialog} onOpenChange={setShowManualTransactionDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add/Remove Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manual Deposit/Withdrawal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Transaction Type</Label>
                      <Select 
                        value={manualTransactionForm.type} 
                        onValueChange={(value: 'deposit' | 'withdrawal') => setManualTransactionForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-green-500" />
                              Deposit (Add Money)
                            </div>
                          </SelectItem>
                          <SelectItem value="withdrawal">
                            <div className="flex items-center gap-2">
                              <Minus className="h-4 w-4 text-red-500" />
                              Withdrawal (Remove Money)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Account</Label>
                      <Select 
                        value={manualTransactionForm.accountId} 
                        onValueChange={(value) => setManualTransactionForm(prev => ({ ...prev, accountId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.accountId} value={account.accountId}>
                              {account.accountName} - {formatCurrency(account.balance)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        value={manualTransactionForm.amount}
                        onChange={(e) => setManualTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={manualTransactionForm.description}
                        onChange={(e) => setManualTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Transaction description"
                      />
                    </div>

                    <div>
                      <Label>Payment Method (Optional)</Label>
                      <Select 
                        value={manualTransactionForm.paymentMethod} 
                        onValueChange={(value) => setManualTransactionForm(prev => ({ ...prev, paymentMethod: value }))}
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

                    <div>
                      <Label>Notes (Optional)</Label>
                      <Input
                        value={manualTransactionForm.notes}
                        onChange={(e) => setManualTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes"
                      />
                    </div>

                    <Button 
                      onClick={handleManualTransaction} 
                      className="w-full"
                      disabled={!manualTransactionForm.accountId || !manualTransactionForm.amount || !manualTransactionForm.description}
                    >
                      {manualTransactionForm.type === 'deposit' ? 'Add Funds' : 'Remove Funds'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Transfer Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Funds Between Accounts</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                  <div>
                    <Label>From Account</Label>
                    <Select 
                      value={transferForm.fromAccountId} 
                      onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromAccountId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.filter(account => account.balance > 0).map((account) => (
                          <SelectItem key={account.accountId} value={account.accountId}>
                            {account.accountName} - {formatCurrency(account.balance)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>To Account</Label>
                    <Select 
                      value={transferForm.toAccountId} 
                      onValueChange={(value) => setTransferForm(prev => ({ ...prev, toAccountId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter(account => account.accountId !== transferForm.fromAccountId)
                          .map((account) => (
                            <SelectItem key={account.accountId} value={account.accountId}>
                              {account.accountName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={transferForm.description}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Transfer description"
                    />
                  </div>

                  <Button 
                    onClick={handleTransfer} 
                    className="w-full"
                    disabled={!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount || !transferForm.description}
                  >
                    Transfer Funds
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalBalance())}</div>
            <p className="text-xs text-muted-foreground">
              All accounts combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Main Account</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getMainAccountBalance())}</div>
            <p className="text-xs text-muted-foreground">
              Hotel main account
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getUserAccountsBalance())}</div>
            <p className="text-xs text-muted-foreground">
              All user accounts combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.filter(a => a.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} total accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Account Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Account Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.accountId} className={cn(
                    "p-4",
                    account.isMainAccount ? "border-amber-200 bg-amber-50" : ""
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{account.accountName}</div>
                      <div className="flex items-center space-x-2">
                        {account.isMainAccount && (
                          <Badge variant="default">Main</Badge>
                        )}
                        <Badge variant={account.isActive ? 'outline' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    {account.userName && (
                      <div className="text-sm text-muted-foreground mb-2">
                        User: {account.userName}
                      </div>
                    )}
                    
                    <div className="text-2xl font-bold mb-1">
                      {formatCurrency(account.balance)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Account Type: {account.accountType.replace('_', ' ').toUpperCase()}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Transaction Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Account</Label>
                  <Select 
                    value={filters.accountId} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, accountId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All accounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All accounts</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.accountId} value={account.accountId}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Transaction Type</Label>
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="accommodation_revenue">Accommodation Revenue</SelectItem>
                      <SelectItem value="food_beverage_revenue">F&B Revenue</SelectItem>
                      <SelectItem value="other_expense">Expenses</SelectItem>
                      <SelectItem value="transfer_in">Transfer In</SelectItem>
                      <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full" onClick={loadTransactions}>
                    <Eye className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction)}
                            <span className={cn(
                              "font-medium",
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            )}>
                              {transaction.type.toUpperCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.account.accountName}</div>
                            {transaction.account.user && (
                              <div className="text-sm text-muted-foreground">
                                {transaction.account.user.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.notes && (
                              <div className="text-sm text-muted-foreground">{transaction.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transaction.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          "font-medium",
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {transaction.isModification ? (
                            <Badge variant="destructive">Modified</Badge>
                          ) : (
                            <Badge variant="default">Completed</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
