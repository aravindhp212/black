import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Inventory from "@/pages/admin/Inventory";
import Categories from "@/pages/admin/Categories";
import Cashiers from "@/pages/admin/Cashiers";
import Reports from "@/pages/admin/Reports";
import POS from "@/pages/pos/POS";
import BillHistory from "@/pages/pos/BillHistory";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: ('admin' | 'cashier')[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/pos'} replace />;
  }
  
  return <>{children}</>;
};

// Redirect based on role
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={user.role === 'admin' ? '/admin' : '/pos'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Root redirect */}
      <Route path="/" element={<RoleBasedRedirect />} />
      
      {/* Admin routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/cashiers" element={<Cashiers />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>
      
      {/* Cashier routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['cashier']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/pos" element={<POS />} />
        <Route path="/pos/history" element={<BillHistory />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
     </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
