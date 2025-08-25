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
  Loader,
  X
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
    <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-3xl font-bold">Account Management</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAccounts} className="h-8 w-8 sm:h-9 sm:w-auto text-xs sm:text-sm">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-2">Export</span>
          </Button>
          {canTransferFunds && (
            <>
              <Dialog open={showManualTransactionDialog} onOpenChange={setShowManualTransactionDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-8 w-8 sm:h-9 sm:w-auto text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-2">Add/Remove Funds</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl sm:max-w-4xl mx-2 sm:mx-8 p-3 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="mb-3 sm:mb-6">
                    <DialogTitle className="text-base sm:text-xl">Manual Deposit/Withdrawal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label className="text-[10px] sm:text-xs">Transaction Type</Label>
                      <Select 
                        value={manualTransactionForm.type} 
                        onValueChange={(value: 'deposit' | 'withdrawal') => setManualTransactionForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">
                            <div className="flex items-center gap-2">
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              Deposit (Add Money)
                            </div>
                          </SelectItem>
                          <SelectItem value="withdrawal">
                            <div className="flex items-center gap-2">
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                              Withdrawal (Remove Money)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[10px] sm:text-xs">Account</Label>
                      <Select 
                        value={manualTransactionForm.accountId} 
                        onValueChange={(value) => setManualTransactionForm(prev => ({ ...prev, accountId: value }))}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
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
                      <Label className="text-[10px] sm:text-xs">Amount (₹)</Label>
                      <Input
                        type="number"
                        value={manualTransactionForm.amount}
                        onChange={(e) => setManualTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] sm:text-xs">Description</Label>
                      <Input
                        value={manualTransactionForm.description}
                        onChange={(e) => setManualTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Transaction description"
                        className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] sm:text-xs">Payment Method (Optional)</Label>
                      <Select 
                        value={manualTransactionForm.paymentMethod} 
                        onValueChange={(value) => setManualTransactionForm(prev => ({ ...prev, paymentMethod: value }))}
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

                    <div>
                      <Label className="text-[10px] sm:text-xs">Notes (Optional)</Label>
                      <Input
                        value={manualTransactionForm.notes}
                        onChange={(e) => setManualTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes"
                        className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                      />
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        variant="outline"
                        onClick={() => setShowManualTransactionDialog(false)} 
                        className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleManualTransaction} 
                        className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                        disabled={!manualTransactionForm.accountId || !manualTransactionForm.amount || !manualTransactionForm.description}
                      >
                        {manualTransactionForm.type === 'deposit' ? 'Add Funds' : 'Remove Funds'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogTrigger asChild>
                  <Button className="h-8 sm:h-9 text-xs sm:text-sm">
                    <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Transfer Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl sm:max-w-4xl mx-2 sm:mx-8 p-3 sm:p-6 rounded-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="mb-3 sm:mb-6">
                    <DialogTitle className="text-base sm:text-xl">Transfer Funds Between Accounts</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label className="text-[10px] sm:text-xs">From Account</Label>
                    <Select 
                      value={transferForm.fromAccountId} 
                      onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromAccountId: value }))}
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
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
                    <Label className="text-[10px] sm:text-xs">To Account</Label>
                    <Select 
                      value={transferForm.toAccountId} 
                      onValueChange={(value) => setTransferForm(prev => ({ ...prev, toAccountId: value }))}
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
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
                    <Label className="text-[10px] sm:text-xs">Amount (₹)</Label>
                    <Input
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] sm:text-xs">Description</Label>
                    <Input
                      value={transferForm.description}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Transfer description"
                      className="h-8 sm:h-9 text-xs sm:text-sm rounded-md"
                    />
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      variant="outline"
                      onClick={() => setShowTransferDialog(false)} 
                      className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleTransfer} 
                      className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                      disabled={!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount || !transferForm.description}
                    >
                      Transfer Funds
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-2">
            <CardTitle className="text-[8px] sm:text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-2xl font-bold">{formatCurrency(getTotalBalance())}</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">
              All accounts combined
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-2">
            <CardTitle className="text-[8px] sm:text-sm font-medium">Main Account</CardTitle>
            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-2xl font-bold">{formatCurrency(getMainAccountBalance())}</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">
              Hotel main account
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-2">
            <CardTitle className="text-[8px] sm:text-sm font-medium">User Accounts</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-2xl font-bold">{formatCurrency(getUserAccountsBalance())}</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">
              All user accounts combined
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-2">
            <CardTitle className="text-[8px] sm:text-sm font-medium">Active Accounts</CardTitle>
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-2xl font-bold">{accounts.filter(a => a.isActive).length}</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">
              {accounts.length} total accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-3 sm:space-y-6">
        <TabsList className="h-8 sm:h-9">
          <TabsTrigger value="accounts" className="text-xs sm:text-sm">Account Balances</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-3 sm:space-y-6">
          <Card className="rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Banknote className="h-4 w-4 sm:h-5 sm:w-5" />
                Account Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account.accountId} className={cn(
                    "p-3 sm:p-4 rounded-lg",
                    account.isMainAccount ? "border-amber-200 bg-amber-50" : ""
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-[10px] sm:text-sm">{account.accountName}</div>
                      <div className="flex items-center gap-1">
                        {account.isMainAccount && (
                          <Badge variant="default" className="text-[9px] sm:text-xs">Main</Badge>
                        )}
                        <Badge variant={account.isActive ? 'outline' : 'secondary'} className="text-[9px] sm:text-xs">
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    {account.userName && (
                      <div className="text-[9px] sm:text-xs text-muted-foreground mb-2">
                        User: {account.userName}
                      </div>
                    )}
                    
                    <div className="text-sm sm:text-2xl font-bold mb-1">
                      {formatCurrency(account.balance)}
                    </div>
                    
                    <div className="text-[9px] sm:text-xs text-muted-foreground">
                      Account Type: {account.accountType.replace('_', ' ').toUpperCase()}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-3 sm:space-y-6">
          {/* Transaction Filters */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                Transaction Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <Label className="text-[10px] sm:text-xs">Account</Label>
                  <Select 
                    value={filters.accountId} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, accountId: value }))}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
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
                  <Label className="text-[10px] sm:text-xs">Transaction Type</Label>
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
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
                  <Label className="text-[10px] sm:text-xs">Category</Label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm rounded-md">
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
                  <Button className="w-full h-8 sm:h-9 text-xs sm:text-sm" onClick={loadTransactions}>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                Transaction History
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
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Account</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Description</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Category</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Amount</TableHead>
                        <TableHead className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
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
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          <div>
                            <div className="font-medium">{transaction.account.accountName}</div>
                            {transaction.account.user && (
                              <div className="text-[9px] sm:text-xs text-muted-foreground">
                                {transaction.account.user.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.notes && (
                              <div className="text-[9px] sm:text-xs text-muted-foreground">{transaction.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          <Badge variant="outline" className="text-[9px] sm:text-xs">
                            {transaction.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          "text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4 font-medium",
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs px-2 sm:px-3 py-3 sm:py-4">
                          {transaction.isModification ? (
                            <Badge variant="destructive" className="text-[9px] sm:text-xs">Modified</Badge>
                          ) : (
                            <Badge variant="default" className="text-[9px] sm:text-xs">Completed</Badge>
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
      </Tabs>
    </div>
  );
}
