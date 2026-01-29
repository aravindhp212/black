import { Category, Product, Sale, User, CartItem } from '@/types/pos';

const STORAGE_KEYS = {
  CATEGORIES: 'pos_categories',
  PRODUCTS: 'pos_products',
  SALES: 'pos_sales',
  USERS: 'pos_users',
  CURRENT_USER: 'pos_current_user',
};

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Beverages', description: 'Hot and cold drinks', isActive: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Snacks', description: 'Quick bites and treats', isActive: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Main Course', description: 'Full meals', isActive: true, createdAt: new Date().toISOString() },
  { id: '4', name: 'Desserts', description: 'Sweet treats', isActive: true, createdAt: new Date().toISOString() },
  { id: '5', name: 'Uncategorized', description: 'Default category', isActive: true, createdAt: new Date().toISOString() },
];

// Default products
const defaultProducts: Product[] = [
  { id: '1', name: 'Espresso', price: 3.50, stock: 100, categoryId: '1', createdAt: new Date().toISOString() },
  { id: '2', name: 'Cappuccino', price: 4.50, stock: 80, categoryId: '1', createdAt: new Date().toISOString() },
  { id: '3', name: 'Latte', price: 5.00, stock: 75, categoryId: '1', createdAt: new Date().toISOString() },
  { id: '4', name: 'Iced Tea', price: 3.00, stock: 50, categoryId: '1', createdAt: new Date().toISOString() },
  { id: '5', name: 'Croissant', price: 3.50, stock: 30, categoryId: '2', createdAt: new Date().toISOString() },
  { id: '6', name: 'Muffin', price: 3.00, stock: 25, categoryId: '2', createdAt: new Date().toISOString() },
  { id: '7', name: 'Sandwich', price: 7.50, stock: 20, categoryId: '3', createdAt: new Date().toISOString() },
  { id: '8', name: 'Pasta Bowl', price: 12.00, stock: 15, categoryId: '3', createdAt: new Date().toISOString() },
  { id: '9', name: 'Grilled Chicken', price: 14.00, stock: 12, categoryId: '3', createdAt: new Date().toISOString() },
  { id: '10', name: 'Cheesecake', price: 6.50, stock: 10, categoryId: '4', createdAt: new Date().toISOString() },
  { id: '11', name: 'Brownie', price: 4.00, stock: 20, categoryId: '4', createdAt: new Date().toISOString() },
  { id: '12', name: 'Ice Cream', price: 5.00, stock: 30, categoryId: '4', createdAt: new Date().toISOString() },
];

// Default users
const defaultUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@pos.com', role: 'admin', isActive: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'John Cashier', email: 'john@pos.com', role: 'cashier', isActive: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Jane Cashier', email: 'jane@pos.com', role: 'cashier', isActive: true, createdAt: new Date().toISOString() },
];

// Generate sample sales for the past week
const generateSampleSales = (): Sale[] => {
  const sales: Sale[] = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 12) + 8);
    
    const numItems = Math.floor(Math.random() * 4) + 1;
    const items: CartItem[] = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = defaultProducts[Math.floor(Math.random() * defaultProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({ product, quantity });
      subtotal += product.price * quantity;
    }
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const paymentMethod = Math.random() > 0.4 ? 'cash' : 'qr';
    const cashier = Math.random() > 0.5 ? defaultUsers[1] : defaultUsers[2];
    
    sales.push({
      id: `sale-${i + 1}`,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      amountReceived: paymentMethod === 'cash' ? Math.ceil(total / 10) * 10 : undefined,
      change: paymentMethod === 'cash' ? Math.ceil(total / 10) * 10 - total : undefined,
      cashierId: cashier.id,
      cashierName: cashier.name,
      createdAt: date.toISOString(),
    });
  }
  
  return sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Initialize storage with defaults if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(generateSampleSales()));
  }
};

// Categories
export const getCategories = (): Category[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
};

export const saveCategory = (category: Category) => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const deleteCategory = (id: string): boolean => {
  const products = getProducts();
  if (products.some(p => p.categoryId === id)) {
    return false;
  }
  const categories = getCategories().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  return true;
};

// Products
export const getProducts = (): Product[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
};

export const saveProduct = (product: Product) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = (id: string) => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const updateProductStock = (id: string, quantity: number) => {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    product.stock -= quantity;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

// Sales
export const getSales = (): Sale[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');
};

export const saveSale = (sale: Sale) => {
  const sales = getSales();
  sales.unshift(sale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  
  // Update stock
  sale.items.forEach(item => {
    updateProductStock(item.product.id, item.quantity);
  });
};

// Users
export const getUsers = (): User[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Dashboard stats
export const getDashboardStats = () => {
  const sales = getSales();
  const products = getProducts();
  const categories = getCategories();
  const users = getUsers();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const todaySales = sales
    .filter(s => new Date(s.createdAt) >= today)
    .reduce((sum, s) => sum + s.total, 0);
  
  const monthlySales = sales
    .filter(s => new Date(s.createdAt) >= monthStart)
    .reduce((sum, s) => sum + s.total, 0);
  
  return {
    todaySales,
    monthlySales,
    totalProducts: products.length,
    totalCategories: categories.filter(c => c.isActive).length,
    totalCashiers: users.filter(u => u.role === 'cashier' && u.isActive).length,
  };
};

export const getWeeklySalesData = () => {
  const sales = getSales();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const daySales = sales
      .filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= date && saleDate < nextDate;
      })
      .reduce((sum, s) => sum + s.total, 0);
    
    data.push({ day: days[date.getDay()], sales: daySales });
  }
  
  return data;
};

export const getPaymentSplitData = () => {
  const sales = getSales();
  const cash = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const qr = sales.filter(s => s.paymentMethod === 'qr').reduce((sum, s) => sum + s.total, 0);
  
  return [
    { name: 'Cash', value: cash },
    { name: 'QR', value: qr },
  ];
};

export const getTopProductsData = () => {
  const sales = getSales();
  const productSales: Record<string, { name: string; sales: number }> = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.product.id]) {
        productSales[item.product.id] = { name: item.product.name, sales: 0 };
      }
      productSales[item.product.id].sales += item.product.price * item.quantity;
    });
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
};

export const getCategorySalesData = () => {
  const sales = getSales();
  const categories = getCategories();
  const categorySales: Record<string, number> = {};
  
  categories.forEach(c => {
    categorySales[c.id] = 0;
  });
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (categorySales[item.product.categoryId] !== undefined) {
        categorySales[item.product.categoryId] += item.product.price * item.quantity;
      }
    });
  });
  
  return categories
    .map(c => ({ name: c.name, sales: categorySales[c.id] || 0 }))
    .filter(c => c.sales > 0)
    .sort((a, b) => b.sales - a.sales);
};

export const getLowStockProducts = (threshold: number = 10) => {
  return getProducts().filter(p => p.stock <= threshold);
};
