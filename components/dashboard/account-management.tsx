'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  ArrowRightLeft,
  Calendar,
  Filter,
  Download,
  Loader2,
  Loader
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  transactionDate: string;
  processedBy: string;
  account: {
    accountName: string;
    accountType: string;
  };
}

interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
  transactionCount: number;
  creditCount: number;
  debitCount: number;
}

interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  // Form states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: '',
    paymentMethod: '',
    notes: '',
  });
  const [transferForm, setTransferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchAccountData();
  }, [selectedPeriod, selectedAccount]);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      // Fetch account balances - filter to show only main account
      const balancesResponse = await fetch('/api/accounts?action=balances');
      if (balancesResponse.ok) {
        const balancesData = await balancesResponse.json();
        // Filter to show only main hotel account
        const mainAccounts = balancesData.filter((account: any) => account.isMainAccount);
        setAccounts(mainAccounts);
      }

      // Fetch transaction summary
      const summaryResponse = await fetch(
        `/api/accounts?action=summary&period=${selectedPeriod}${selectedAccount !== 'all' ? `&accountId=${selectedAccount}` : ''}`
      );
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      // Fetch category breakdown
      const breakdownResponse = await fetch(
        `/api/accounts?action=breakdown&period=${selectedPeriod}${selectedAccount !== 'all' ? `&accountId=${selectedAccount}` : ''}`
      );
      if (breakdownResponse.ok) {
        const breakdownData = await breakdownResponse.json();
        setBreakdown(breakdownData);
      }

      // Fetch recent transactions
      const transactionsResponse = await fetch(
        `/api/accounts?action=transactions&limit=100${selectedAccount !== 'all' ? `&accountId=${selectedAccount}` : ''}`
      );
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast({ title: 'Error', description: 'Failed to fetch account data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.category || !expenseForm.amount || !expenseForm.description) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_expense',
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Expense added successfully' });
        setShowAddExpense(false);
        setExpenseForm({
          category: '',
          amount: '',
          description: '',
          paymentMethod: '',
          notes: '',
        });
        fetchAccountData();
      } else {
        toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          ...transferForm,
          transferAmount: parseFloat(transferForm.amount),
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Transfer completed successfully' });
        setShowTransfer(false);
        setTransferForm({
          fromAccountId: '',
          toAccountId: '',
          amount: '',
          description: '',
        });
        fetchAccountData();
      } else {
        toast({ title: 'Error', description: 'Failed to process transfer', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
      toast({ title: 'Error', description: 'Failed to process transfer', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getCategoryDisplayName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === 'credit' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  if (loading && accounts.length === 0) {
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
        <h2 className="text-2xl font-bold">Account Management</h2>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.accountId} value={account.accountId}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((account) => (
          <Card key={account.accountId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{account.accountName}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
              <p className="text-xs text-muted-foreground">
                {getCategoryDisplayName(account.accountType)} Account
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCredits)}</div>
              <p className="text-xs text-muted-foreground">{summary.creditCount} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDebits)}</div>
              <p className="text-xs text-muted-foreground">{summary.debitCount} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className={`h-4 w-4 ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netAmount)}
              </div>
              <p className="text-xs text-muted-foreground">{summary.transactionCount} total transactions</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="manage">Manage Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Processed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className={getTransactionTypeColor(transaction.type)}>
                        <div className="flex items-center gap-2">
                          {getTransactionTypeIcon(transaction.type)}
                          {transaction.type.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryDisplayName(transaction.category)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transaction.account.accountName}</TableCell>
                      <TableCell>{transaction.processedBy || 'System'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breakdown.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{getCategoryDisplayName(item.category)}</span>
                        <span className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-bold">{formatCurrency(item.totalAmount)}</div>
                      <div className="text-xs text-muted-foreground">{item.transactionCount} transactions</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Expense */}
            <Card>
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expenseCategory">Category</Label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room_maintenance">Room Maintenance</SelectItem>
                      <SelectItem value="staff_salary">Staff Salary</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="taxes_paid">Taxes Paid</SelectItem>
                      <SelectItem value="bank_charges">Bank Charges</SelectItem>
                      <SelectItem value="other_expense">Other Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expenseAmount">Amount</Label>
                  <Input
                    id="expenseAmount"
                    type="number"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expenseDescription">Description</Label>
                  <Input
                    id="expenseDescription"
                    placeholder="Enter expense description"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expensePaymentMethod">Payment Method</Label>
                  <Select
                    value={expenseForm.paymentMethod}
                    onValueChange={(value) => setExpenseForm({...expenseForm, paymentMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expenseNotes">Notes (Optional)</Label>
                  <Textarea
                    id="expenseNotes"
                    placeholder="Additional notes"
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardContent>
            </Card>

            {/* Account Transfer */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Between Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fromAccount">From Account</Label>
                  <Select
                    value={transferForm.fromAccountId}
                    onValueChange={(value) => setTransferForm({...transferForm, fromAccountId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.accountId} value={account.accountId}>
                          {account.accountName} ({formatCurrency(account.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="toAccount">To Account</Label>
                  <Select
                    value={transferForm.toAccountId}
                    onValueChange={(value) => setTransferForm({...transferForm, toAccountId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(acc => acc.accountId !== transferForm.fromAccountId).map((account) => (
                        <SelectItem key={account.accountId} value={account.accountId}>
                          {account.accountName} ({formatCurrency(account.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transferAmount">Amount</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    placeholder="0.00"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="transferDescription">Description</Label>
                  <Input
                    id="transferDescription"
                    placeholder="Transfer description"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                  />
                </div>
                <Button onClick={handleTransfer} className="w-full">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transfer Funds
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

