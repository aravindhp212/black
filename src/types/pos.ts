export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  image?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cash' | 'qr';

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  change?: number;
  cashierId: string;
  cashierName: string;
  createdAt: string;
}

export interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  totalProducts: number;
  totalCategories: number;
  totalCashiers: number;
}

export interface WeeklySalesData {
  day: string;
  sales: number;
}

export interface PaymentSplitData {
  name: string;
  value: number;
}

export interface TopProductData {
  name: string;
  sales: number;
}

export interface CategorySalesData {
  name: string;
  sales: number;
}
