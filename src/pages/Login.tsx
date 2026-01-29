import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Store, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password);
    
    if (success) {
      const isAdmin = email.toLowerCase().includes('admin');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate(isAdmin ? '/admin' : '/pos');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid email or inactive account.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Access your Black Pekoe POS system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gradient-primary border-0"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {/* Quick login buttons */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Quick login for demo:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin('admin@pos.com')}
                className="h-11"
              >
                Admin Login
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => quickLogin('john@pos.com')}
                className="h-11"
              >
                Cashier Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      {/* <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4">
            Modern POS Solution
          </h2>
          <p className="text-lg opacity-90">
            Streamline your business operations with our intuitive point of sale system.
            Fast, reliable, and designed for efficiency.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm opacity-80">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1K+</div>
              <div className="text-sm opacity-80">Sales/Day</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">99%</div>
              <div className="text-sm opacity-80">Uptime</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Login;
