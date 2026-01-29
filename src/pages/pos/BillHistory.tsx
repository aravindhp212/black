import React, { useState, useMemo } from 'react';
import { Search, Receipt, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getSales } from '@/lib/store';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Sale } from '@/types/pos';

const BillHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    const allSales = getSales();
    const dateStart = startOfDay(new Date(selectedDate));
    const dateEnd = endOfDay(new Date(selectedDate));

    return allSales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      const inDateRange = saleDate >= dateStart && saleDate <= dateEnd;
      const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase());
      const isMySale = sale.cashierId === user?.id;

      return inDateRange && matchesSearch && isMySale;
    });
  }, [searchQuery, selectedDate, user?.id]);

  const dailyTotal = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [filteredSales]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bill History</h1>
        <p className="text-muted-foreground">View your daily transactions.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 w-full sm:w-48"
          />
        </div>
      </div>

      {/* Daily Summary */}
      <div className="stat-card-gradient gradient-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">
              Sales for {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </p>
            <p className="text-3xl font-bold text-white">${dailyTotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Transactions</p>
            <p className="text-3xl font-bold text-white">{filteredSales.length}</p>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredSales.map((sale) => (
          <div key={sale.id} className="pos-card">
            <button
              onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{sale.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.createdAt), 'HH:mm')} • {sale.items.length} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-foreground">${sale.total.toFixed(2)}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sale.paymentMethod === 'cash'
                        ? 'bg-success/10 text-success'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {sale.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  {expandedSale === sale.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedSale === sale.id && (
              <div className="mt-4 pt-4 border-t border-border animate-slide-up">
                <div className="space-y-2 mb-4">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${sale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">${sale.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${sale.total.toFixed(2)}</span>
                  </div>
                  {sale.paymentMethod === 'cash' && sale.amountReceived && (
                    <>
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Received</span>
                        <span className="text-foreground">${sale.amountReceived.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Change</span>
                        <span className="text-success">${sale.change?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No bills found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Try a different search term.'
              : 'No transactions for this date.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BillHistory;
