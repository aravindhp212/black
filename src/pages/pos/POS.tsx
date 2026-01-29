import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, QrCode, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Product, Category, CartItem, PaymentMethod, Sale } from '@/types/pos';
import { getProducts, getCategories, saveSale } from '@/lib/store';

const TAX_RATE = 0.10;

const POS: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');

  useEffect(() => {
    setProducts(getProducts().filter(p => p.stock > 0));
    setCategories(getCategories().filter(c => c.isActive));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: 'Stock Limit',
          description: `Only ${product.stock} items available.`,
          variant: 'destructive',
        });
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id !== productId) return item;
      
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) return item;
      if (newQuantity > item.product.stock) {
        toast({
          title: 'Stock Limit',
          description: `Only ${item.product.stock} items available.`,
          variant: 'destructive',
        });
        return item;
      }
      
      return { ...item, quantity: newQuantity };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Add items to cart before checkout.',
        variant: 'destructive',
      });
      return;
    }
    setIsCheckoutOpen(true);
    setCashReceived('');
  };

  const processPayment = () => {
    const cashAmount = parseFloat(cashReceived);
    
    if (paymentMethod === 'cash' && (isNaN(cashAmount) || cashAmount < cartSummary.total)) {
      toast({
        title: 'Insufficient Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    const sale: Sale = {
      id: `INV-${Date.now()}`,
      items: cart,
      subtotal: cartSummary.subtotal,
      tax: cartSummary.tax,
      total: cartSummary.total,
      paymentMethod,
      amountReceived: paymentMethod === 'cash' ? cashAmount : undefined,
      change: paymentMethod === 'cash' ? cashAmount - cartSummary.total : undefined,
      cashierId: user?.id || '',
      cashierName: user?.name || '',
      createdAt: new Date().toISOString(),
    };

    saveSale(sale);
    
    toast({
      title: 'Payment Successful',
      description: `Invoice ${sale.id} created.${paymentMethod === 'cash' ? ` Change: $${sale.change?.toFixed(2)}` : ''}`,
    });

    // Refresh products to update stock
    setProducts(getProducts().filter(p => p.stock > 0));
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  return (
    <div className="h-screen flex animate-fade-in">
      {/* Products Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`pos-category-tab ${
                selectedCategory === 'all'
                  ? 'pos-category-tab-active'
                  : 'pos-category-tab-inactive'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`pos-category-tab ${
                  selectedCategory === category.id
                    ? 'pos-category-tab-active'
                    : 'pos-category-tab-inactive'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="pos-product-card text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {getCategoryName(product.categoryId)}
                  </span>
                  <span className="text-xs text-muted-foreground">{product.stock} left</span>
                </div>
                <h3 className="font-medium text-foreground mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-card border-l border-border flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Current Order</h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Cart is empty</p>
              <p className="text-sm text-muted-foreground">Tap products to add them</p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map((item) => (
                <div key={item.product.id} className="cart-item">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-secondary rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${cartSummary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="text-foreground">${cartSummary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">${cartSummary.total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="btn-pos btn-pos-success w-full"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Payment Method */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                    paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-sm font-medium ${
                    paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'
                  }`}>Cash</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'qr'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <QrCode className={`w-6 h-6 mx-auto mb-2 ${
                    paymentMethod === 'qr' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-sm font-medium ${
                    paymentMethod === 'qr' ? 'text-primary' : 'text-muted-foreground'
                  }`}>QR Scan</p>
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 rounded-xl bg-muted">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">${cartSummary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Cash Input */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cash Received</label>
                <Input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Enter amount"
                  className="h-12 text-lg"
                />
                {cashReceived && parseFloat(cashReceived) >= cartSummary.total && (
                  <p className="text-sm text-success">
                    Change: ${(parseFloat(cashReceived) - cartSummary.total).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* QR Code Placeholder */}
            {paymentMethod === 'qr' && (
              <div className="text-center p-8 rounded-xl border border-dashed border-border">
                <QrCode className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Scan QR code to pay</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processPayment} className="gradient-primary border-0">
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
