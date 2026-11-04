import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabaseAuth } from '@/lib/supabase-auth';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { toast } = useToast();
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsResetting(true);

    try {
      const result = await supabaseAuth.resetPassword(resetEmail);

      if (result.success) {
        toast({
          title: 'Check your email',
          description: 'If an account exists, you\'ll receive a reset link shortly. It may take a few minutes—check spam if needed.',
          duration: 8000,
        });
        setResetEmail('');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send reset email',
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
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary p-3 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img src="logo.png" alt="Foundation School Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm object-cover" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Reset Password</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isResetting}>
              {isResetting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
