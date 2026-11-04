import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabaseAuth } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Password reset state
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Check for password recovery session on mount
  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        // Check if this is a password recovery session
        const searchParams = new URLSearchParams(window.location.search);
        const type = searchParams.get('type');
        
        if (type === 'recovery') {
          setIsPasswordRecovery(true);
          toast({
            title: 'Reset your password',
            description: 'Please enter your new password below.',
          });
        }
      }
    };
    
    checkRecoverySession();
  }, [toast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      const result = await supabaseAuth.updatePasswordFromReset(newPassword);
      
      if (result.success) {
        toast({
          title: 'Password updated successfully',
          description: 'You can now log in with your new password',
        });
        setIsPasswordRecovery(false);
        setNewPassword('');
        setConfirmPassword('');
        
        // Clear the recovery URL params
        window.history.replaceState({}, document.title, '/login');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await supabaseAuth.login(email, password);
      
      if (result.success && result.user) {
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${result.user.name}`,
        });
        
        // Route based on role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'pastor') {
        navigate('/pastor');
      } else if (result.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
      } else {
        toast({
          title: 'Login failed',
          description: result.error || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img src="logo.png" alt="Foundation School Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm object-cover" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">
            {isPasswordRecovery ? (
              <div className="flex items-center justify-center gap-2">
                <KeyRound className="w-6 h-6" />
                Reset Password
              </div>
            ) : (
              'Sign In'
            )}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {isPasswordRecovery ? 'Enter your new password' : 'Welcome back'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPasswordRecovery ? (
            <form onSubmit={handleUpdatePassword} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="new-password" className="text-sm">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10 text-sm sm:text-base"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10 text-sm sm:text-base"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full text-sm sm:text-base" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Forgot Password - dedicated page for reliable mobile touch */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="text-xs sm:text-sm px-0 h-auto min-h-[44px] py-2 -my-2"
                asChild
              >
                <Link to="/forgot-password">Forgot Password?</Link>
              </Button>
            </div>

            <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm sm:text-base"
              onClick={() => navigate('/register')}
            >
              Need an account? Register
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm sm:text-base"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
