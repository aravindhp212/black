import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  FolderOpen,
  Users,
  AlertTriangle,
  Plus,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats,
  getWeeklySalesData,
  getPaymentSplitData,
  getTopProductsData,
  getCategorySalesData,
  getLowStockProducts,
} from '@/lib/store';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const CHART_COLORS = ['hsl(173, 80%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = getDashboardStats();
  const weeklySales = getWeeklySalesData();
  const paymentSplit = getPaymentSplitData();
  const topProducts = getTopProductsData();
  const categorySales = getCategorySalesData();
  const lowStockProducts = getLowStockProducts();

  const statCards = [
    {
      label: "Today's Sales",
      value: `₹${stats.todaySales.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'gradient-primary',
    },
    {
      label: 'Monthly Sales',
      value: `₹${stats.monthlySales.toFixed(2)}`,
      icon: TrendingUp,
      gradient: 'gradient-success',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      className: 'stat-card',
    },
    {
      label: 'Categories',
      value: stats.totalCategories.toString(),
      icon: FolderOpen,
      className: 'stat-card',
    },
    {
      label: 'Active Cashiers',
      value: stats.totalCashiers.toString(),
      icon: Users,
      className: 'stat-card',
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Hello! Here’s your business snapshot.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/inventory')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          <Button className="gradient-primary border-0">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className={stat.gradient ? `stat-card-gradient ${stat.gradient}` : stat.className}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.gradient ? 'text-white/80' : 'text-muted-foreground'}`} />
            </div>
            <p className={`text-2xl font-bold ${stat.gradient ? 'text-white' : 'text-foreground'}`}>
              {stat.value}
            </p>
            <p className={`text-sm ${stat.gradient ? 'text-white/80' : 'text-muted-foreground'}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Trend */}
        <div className="lg:col-span-2 pos-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Sales Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySales}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(173, 80%, 40%)"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Split */}
        <div className="pos-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentSplit.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {paymentSplit.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index] }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="pos-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Selling Products</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="hsl(173, 80%, 40%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales */}
        <div className="pos-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="pos-card border-warning/30 bg-warning/5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background"
              >
                <span className="font-medium text-foreground">{product.name}</span>
                <span className="text-sm font-semibold text-warning">{product.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
