'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  BarChart,
  ArrowUp,
  ArrowDown,
  Loader
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface RevenueData {
  period: {
    start: Date;
    end: Date;
    type: 'daily' | 'monthly' | 'yearly';
  };
  revenue: {
    accommodation: number;
    foodBeverage: number;
    spa: number;
    transport: number;
    laundry: number;
    minibar: number;
    conference: number;
    other: number;
    total: number;
  };
  payments: {
    cash: number;
    card: number;
    upi: number;
    bankTransfer: number;
    onlineGateway: number;
    cheque: number;
    wallet: number;
    total: number;
  };
  bookingSources: {
    website: number;
    phone: number;
    walkIn: number;
    ota: number;
    corporate: number;
    agent: number;
    referral: number;
    total: number;
  };
  bookingStats: {
    totalBookings: number;
    occupiedRooms: number;
    occupancyRate: number;
    averageStayDuration: number;
    averageRevenuePerBooking: number;
  };
  outstandingPayments: {
    pending: number;
    partiallyPaid: number;
    overdue: number;
    total: number;
  };
  taxCollected: {
    gst: number;
    serviceTax: number;
    otherTax: number;
    total: number;
  };
  trends: {
    revenueGrowth: number;
    bookingGrowth: number;
    averageRevenueGrowth: number;
  };
}

export default function RevenueDashboard() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod, selectedDate]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      let url = `/api/revenue/reports?type=${selectedPeriod}`;
      
      if (selectedPeriod !== 'daily') {
        url += `&date=${selectedDate.toISOString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'excel') => {
    try {
      const startDate = selectedPeriod === 'monthly' 
        ? startOfMonth(selectedDate) 
        : selectedPeriod === 'yearly' 
        ? startOfYear(selectedDate) 
        : selectedDate;
      
      const endDate = selectedPeriod === 'monthly' 
        ? endOfMonth(selectedDate) 
        : selectedPeriod === 'yearly' 
        ? endOfYear(selectedDate) 
        : selectedDate;

      const url = `/api/revenue/export?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
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

  if (!revenueData) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue Dashboard</h2>
          <p className="text-gray-600">
            {format(new Date(revenueData.period.start), 'MMM dd, yyyy')} - {format(new Date(revenueData.period.end), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchRevenueData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.revenue.total)}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(revenueData.trends.revenueGrowth)}
                  <span className={`text-sm ${getTrendColor(revenueData.trends.revenueGrowth)}`}>
                    {formatPercentage(revenueData.trends.revenueGrowth)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{revenueData.bookingStats.totalBookings}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(revenueData.trends.bookingGrowth)}
                  <span className={`text-sm ${getTrendColor(revenueData.trends.bookingGrowth)}`}>
                    {formatPercentage(revenueData.trends.bookingGrowth)}
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueData.bookingStats.averageRevenuePerBooking)}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(revenueData.trends.averageRevenueGrowth)}
                  <span className={`text-sm ${getTrendColor(revenueData.trends.averageRevenueGrowth)}`}>
                    {formatPercentage(revenueData.trends.averageRevenueGrowth)}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold">{revenueData.bookingStats.occupancyRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-2">
                  {revenueData.bookingStats.occupiedRooms} rooms occupied
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="sources">Booking Sources</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Accommodation</span>
                    <span className="text-sm">{formatCurrency(revenueData.revenue.accommodation)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(revenueData.revenue.accommodation / revenueData.revenue.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Food & Beverage</span>
                    <span className="text-sm">{formatCurrency(revenueData.revenue.foodBeverage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(revenueData.revenue.foodBeverage / revenueData.revenue.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Spa</span>
                    <span className="text-sm">{formatCurrency(revenueData.revenue.spa)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(revenueData.revenue.spa / revenueData.revenue.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Other Services</span>
                    <span className="text-sm">
                      {formatCurrency(
                        revenueData.revenue.transport + 
                        revenueData.revenue.laundry + 
                        revenueData.revenue.minibar + 
                        revenueData.revenue.conference + 
                        revenueData.revenue.other
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ 
                        width: `${((revenueData.revenue.transport + revenueData.revenue.laundry + revenueData.revenue.minibar + revenueData.revenue.conference + revenueData.revenue.other) / revenueData.revenue.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(revenueData.payments).filter(([key]) => key !== 'total').map(([method, amount]) => (
                  <div key={method} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium capitalize">{method.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(amount / revenueData.payments.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {((amount / revenueData.payments.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Revenue by Booking Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(revenueData.bookingSources).filter(([key]) => key !== 'total').map(([source, amount]) => (
                  <div key={source} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium capitalize">{source.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(amount / revenueData.bookingSources.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {((amount / revenueData.bookingSources.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Pending</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                      {formatCurrency(revenueData.outstandingPayments.pending)}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Partially Paid</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-800">
                      {formatCurrency(revenueData.outstandingPayments.partiallyPaid)}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overdue</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50 text-red-800">
                      {formatCurrency(revenueData.outstandingPayments.overdue)}
                    </Badge>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Outstanding</span>
                    <span>{formatCurrency(revenueData.outstandingPayments.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Collection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>GST Collected</span>
                  <span>{formatCurrency(revenueData.taxCollected.gst)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Service Tax</span>
                  <span>{formatCurrency(revenueData.taxCollected.serviceTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Other Taxes</span>
                  <span>{formatCurrency(revenueData.taxCollected.otherTax)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Tax Collected</span>
                    <span>{formatCurrency(revenueData.taxCollected.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
