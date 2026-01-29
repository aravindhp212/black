import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Check, X } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types/pos';
import { getCategories, getProducts, saveCategory, deleteCategory } from '@/lib/store';
import { format } from 'date-fns';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(getCategories());
  };

  const getProductCount = (categoryId: string) => {
    return getProducts().filter(p => p.categoryId === categoryId).length;
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        isActive: category.isActive,
      });
    } else {
      setSelectedCategory(null);
      setFormData({ name: '', description: '', isActive: true });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required.',
        variant: 'destructive',
      });
      return;
    }

    const category: Category = {
      id: selectedCategory?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      isActive: formData.isActive,
      createdAt: selectedCategory?.createdAt || new Date().toISOString(),
    };

    saveCategory(category);
    loadData();
    setIsDialogOpen(false);
    toast({
      title: selectedCategory ? 'Category Updated' : 'Category Created',
      description: `${category.name} has been ${selectedCategory ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleDelete = () => {
    if (selectedCategory) {
      const success = deleteCategory(selectedCategory.id);
      if (success) {
        loadData();
        toast({
          title: 'Category Deleted',
          description: `${selectedCategory.name} has been removed.`,
        });
      } else {
        toast({
          title: 'Cannot Delete',
          description: 'This category has products assigned to it.',
          variant: 'destructive',
        });
      }
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Description</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Products</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Created</th>
                <th className="text-right py-4 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const productCount = getProductCount(category.id);
                return (
                  <tr key={category.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-muted-foreground">
                        {category.description || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-medium">
                        {productCount}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {category.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-sm">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          <X className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-muted-foreground text-sm">
                        {format(new Date(category.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsDeleteDialogOpen(true);
                          }}
                          disabled={category.name === 'Uncategorized'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
          <p className="text-muted-foreground">Create your first category to organize products.</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="status">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive categories won't appear in POS
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
              {selectedCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? 
              {getProductCount(selectedCategory?.id || '') > 0 && (
                <span className="text-destructive block mt-2">
                  Warning: This category has products. Delete or reassign them first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
