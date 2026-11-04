import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabaseAuth } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, KeyRound, Lock, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Wait for Supabase to process the URL hash fragment
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          console.log('Valid password recovery session detected');
          setIsValidSession(true);
        } else {
          toast({
            title: 'Invalid or expired link',
            description: 'Please request a new password reset link',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify reset link',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        setIsValidSession(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out after password reset');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
    
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast({
        title: 'Weak password',
        description: 'Password must contain uppercase, lowercase, and numbers',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      const result = await supabaseAuth.updatePasswordFromReset(newPassword);
      
      if (result.success) {
        toast({
          title: 'Password updated successfully!',
          description: 'Redirecting to login...',
        });
        
        // Sign out the user to clear the recovery session
        await supabaseAuth.logout();
        
        // Wait a moment then redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary p-3 sm:p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
              <p className="text-muted-foreground">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary p-3 sm:p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl">Reset Your Password</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10 text-sm sm:text-base"
                  placeholder="Enter new password"
                  minLength={8}
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
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10 text-sm sm:text-base"
                  placeholder="Confirm new password"
                  minLength={8}
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

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full text-sm sm:text-base h-11" 
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <>
                    <Lock className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>

            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/login')}
                className="text-sm text-muted-foreground"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

