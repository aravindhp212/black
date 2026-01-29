import React, { useState, useMemo } from 'react';
import { Calendar, Download, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSales, getCategories, getProducts } from '@/lib/store';
import { format, startOfDay, endOfDay, subDays, startOfMonth, startOfWeek } from 'date-fns';
import { Sale } from '@/types/pos';

type DateFilter = 'today' | 'week' | 'month' | 'custom';

const Reports: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const categories = getCategories();
  const products = getProducts();

  const filteredSales = useMemo(() => {
    const allSales = getSales();
    let start: Date;
    let end = endOfDay(new Date());

    switch (dateFilter) {
      case 'today':
        start = startOfDay(new Date());
        break;
      case 'week':
        start = startOfWeek(new Date());
        break;
      case 'month':
        start = startOfMonth(new Date());
        break;
      case 'custom':
        start = startOfDay(new Date(startDate));
        end = endOfDay(new Date(endDate));
        break;
      default:
        start = subDays(new Date(), 7);
    }

    return allSales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      const inDateRange = saleDate >= start && saleDate <= end;

      if (!inDateRange) return false;

      if (categoryFilter !== 'all') {
        return sale.items.some((item) => item.product.categoryId === categoryFilter);
      }

      return true;
    });
  }, [dateFilter, categoryFilter, startDate, endDate]);

  const summary = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalTax = filteredSales.reduce((sum, s) => sum + s.tax, 0);
    const cashSales = filteredSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
    const qrSales = filteredSales.filter(s => s.paymentMethod === 'qr').reduce((sum, s) => sum + s.total, 0);
    const avgTransaction = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

    return {
      totalSales,
      totalTax,
      cashSales,
      qrSales,
      avgTransaction,
      transactionCount: filteredSales.length,
    };
  }, [filteredSales]);

  const exportCSV = () => {
    const headers = ['Date', 'Invoice ID', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method', 'Cashier'];
    const rows = filteredSales.map(sale => [
      format(new Date(sale.createdAt), 'yyyy-MM-dd HH:mm'),
      sale.id,
      sale.items.map(i => `${i.product.name} x${i.quantity}`).join('; '),
      sale.subtotal.toFixed(2),
      sale.tax.toFixed(2),
      sale.total.toFixed(2),
      sale.paymentMethod.toUpperCase(),
      sale.cashierName,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Reports</h1>
          <p className="text-muted-foreground">Analyze your sales data and export reports.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button className="gradient-primary border-0">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="pos-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === 'custom' && (
            <>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="stat-card-gradient gradient-primary">
          <p className="text-sm text-white/80 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-white">${summary.totalSales.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">Transactions</p>
          <p className="text-2xl font-bold text-foreground">{summary.transactionCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">Avg. Transaction</p>
          <p className="text-2xl font-bold text-foreground">${summary.avgTransaction.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">Cash Sales</p>
          <p className="text-2xl font-bold text-foreground">${summary.cashSales.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">QR Sales</p>
          <p className="text-2xl font-bold text-foreground">${summary.qrSales.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-1">Total Tax</p>
          <p className="text-2xl font-bold text-foreground">${summary.totalTax.toFixed(2)}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="pos-card overflow-hidden">
        <h3 className="font-semibold text-foreground mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Invoice</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cashier</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, 20).map((sale) => (
                <tr key={sale.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <span className="text-foreground">
                      {format(new Date(sale.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      {format(new Date(sale.createdAt), 'HH:mm')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-foreground">{sale.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-muted-foreground">
                      {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-foreground">${sale.total.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      sale.paymentMethod === 'cash'
                        ? 'bg-success/10 text-success'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {sale.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-muted-foreground">{sale.cashierName}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No transactions found</h3>
            <p className="text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )}

        {filteredSales.length > 20 && (
          <div className="text-center py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing 20 of {filteredSales.length} transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
