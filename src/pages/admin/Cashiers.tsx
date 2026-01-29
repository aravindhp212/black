import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Users, Check, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/pos';
import { getUsers, saveUser, getSales } from '@/lib/store';
import { format } from 'date-fns';

const Cashiers: React.FC = () => {
  const [cashiers, setCashiers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const users = getUsers().filter(u => u.role === 'cashier');
    setCashiers(users);
  };

  const getCashierSales = (cashierId: string) => {
    const sales = getSales().filter(s => s.cashierId === cashierId);
    const total = sales.reduce((sum, s) => sum + s.total, 0);
    return { count: sales.length, total };
  };

  const handleOpenDialog = (cashier?: User) => {
    if (cashier) {
      setSelectedCashier(cashier);
      setFormData({
        name: cashier.name,
        email: cashier.email,
        isActive: cashier.isActive,
      });
    } else {
      setSelectedCashier(null);
      setFormData({ name: '', email: '', isActive: true });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    const user: User = {
      id: selectedCashier?.id || Date.now().toString(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: 'cashier',
      isActive: formData.isActive,
      createdAt: selectedCashier?.createdAt || new Date().toISOString(),
    };

    saveUser(user);
    loadData();
    setIsDialogOpen(false);
    toast({
      title: selectedCashier ? 'Cashier Updated' : 'Cashier Created',
      description: `${user.name} has been ${selectedCashier ? 'updated' : 'added'} successfully.`,
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cashiers</h1>
          <p className="text-muted-foreground">Manage cashier accounts and view their performance.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Cashier
        </Button>
      </div>

      {/* Cashiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashiers.map((cashier) => {
          const salesData = getCashierSales(cashier.id);
          return (
            <div key={cashier.id} className="pos-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {cashier.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cashier.name}</h3>
                    <p className="text-sm text-muted-foreground">{cashier.email}</p>
                  </div>
                </div>
                {cashier.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    <X className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold text-foreground">
                      {salesData.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transactions</p>
                  <span className="text-lg font-bold text-foreground">{salesData.count}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Joined {format(new Date(cashier.createdAt), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(cashier)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {cashiers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No cashiers yet</h3>
          <p className="text-muted-foreground">Add your first cashier to get started.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCashier ? 'Edit Cashier' : 'Add New Cashier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter cashier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="status">Account Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive accounts cannot log in
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gradient-primary border-0">
              {selectedCashier ? 'Save Changes' : 'Add Cashier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cashiers;
