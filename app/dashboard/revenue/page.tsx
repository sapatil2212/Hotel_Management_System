'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Users, 
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  PieChart,
  BarChart,
  ArrowUp,
  ArrowDown,
  Filter,
  Eye,
  CheckCircle,
  Building2,
  Loader
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

interface RevenueData {
  totalRevenue: number;
  categorizedRevenue: {
    accommodation: number;
    foodBeverage: number;
    spa: number;
    transport: number;
    laundry: number;
    minibar: number;
    conference: number;
    other: number;
  };
  paymentMethods: {
    cash: number;
    card: number;
    upi: number;
    bankTransfer: number;
    onlineGateway: number;
    cheque: number;
    wallet: number;
  };
  bookingSources: {
    website: number;
    phone: number;
    walkIn: number;
    ota: number;
    corporate: number;
    agent: number;
    referral: number;
  };
  trends: {
    revenueGrowth: number;
    bookingGrowth: number;
    averageRevenueGrowth: number;
  };
}

interface UserAccount {
  accountId: string;
  accountName: string;
  balance: number;
  userId?: string;
  userName?: string;
  isMainAccount: boolean;
}

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  useEffect(() => {
    loadRevenueData();
    loadUserAccounts();
  }, [dateRange, selectedAccount]);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      // Use enhanced revenue endpoint
      const params = new URLSearchParams();
      params.set('startDate', dateRange.from.toISOString());
      params.set('endDate', dateRange.to.toISOString());
      if (selectedAccount !== 'all') params.set('accountId', selectedAccount);
      const response = await fetch(`/api/revenue/enhanced?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      } else {
        console.error('Failed to load revenue data');
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAccounts = async () => {
    try {
      const response = await fetch('/api/accounts?action=user-accounts');
      if (response.ok) {
        const accounts = await response.json();
        // Filter to show only main hotel account
        const mainAccount = accounts.filter((account: UserAccount) => account.isMainAccount);
        setUserAccounts(mainAccount);
      }
    } catch (error) {
      console.error('Error loading user accounts:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getRevenueCategoryData = () => {
    if (!revenueData) return [];
    
    const categories = revenueData.categorizedRevenue;
    const total = revenueData.totalRevenue;
    
    return Object.entries(categories).map(([key, value]) => ({
      category: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      amount: value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    })).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);
  };

  const getPaymentMethodData = () => {
    if (!revenueData) return [];
    
    const methods = revenueData.paymentMethods;
    const total = Object.values(methods).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(methods).map(([key, value]) => ({
      method: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      amount: value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    })).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);
  };

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
        <h2 className="text-3xl font-bold tracking-tight">Revenue Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadRevenueData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(dateRange.from, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label>Account Filter</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {userAccounts.map((account) => (
                    <SelectItem key={account.accountId} value={account.accountId}>
                      {account.accountName} {account.isMainAccount && '(Main)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={loadRevenueData} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {revenueData && (
        <>
          {/* Revenue Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {revenueData.trends.revenueGrowth >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={revenueData.trends.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(revenueData.trends.revenueGrowth)}
                  </span>
                  <span>vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accommodation Revenue</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.categorizedRevenue.accommodation)}</div>
                <div className="text-xs text-muted-foreground">
                  {((revenueData.categorizedRevenue.accommodation / revenueData.totalRevenue) * 100).toFixed(1)}% of total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">F&B Revenue</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.categorizedRevenue.foodBeverage)}</div>
                <div className="text-xs text-muted-foreground">
                  {((revenueData.categorizedRevenue.foodBeverage / revenueData.totalRevenue) * 100).toFixed(1)}% of total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Other Services</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    revenueData.categorizedRevenue.spa +
                    revenueData.categorizedRevenue.transport +
                    revenueData.categorizedRevenue.laundry +
                    revenueData.categorizedRevenue.minibar +
                    revenueData.categorizedRevenue.conference +
                    revenueData.categorizedRevenue.other
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Combined services revenue
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Category</th>
                        <th className="text-right py-2 font-medium">Amount</th>
                        <th className="text-right py-2 font-medium">Percentage</th>
                        <th className="text-right py-2 font-medium">Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRevenueCategoryData().map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">
                            <span className="font-medium">{item.category}</span>
                          </td>
                          <td className="py-3 text-right font-mono">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-3 text-right">
                            <Badge variant="outline">
                              {item.percentage.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Payment Method</th>
                        <th className="text-right py-2 font-medium">Amount</th>
                        <th className="text-right py-2 font-medium">Percentage</th>
                        <th className="text-right py-2 font-medium">Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaymentMethodData().map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">
                            <span className="font-medium capitalize">{item.method}</span>
                          </td>
                          <td className="py-3 text-right font-mono">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-3 text-right">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {item.percentage.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hotel Account Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Hotel Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Account Name</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-right py-2 font-medium">Current Balance</th>
                      <th className="text-center py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAccounts.map((account) => (
                      <tr key={account.accountId} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{account.accountName}</div>
                          <div className="text-sm text-muted-foreground">
                            Account ID: {account.accountId.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="default">Main Hotel Account</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(account.balance)}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
