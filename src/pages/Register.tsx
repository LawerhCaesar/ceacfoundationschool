import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabaseAuth } from '@/lib/supabase-auth';
import { Eye, EyeOff } from 'lucide-react';

const CHURCH_OPTIONS = [
  'PFCC 1',
  'TACC',
  'PFCC 3',
  'PFCC 4',
  'OFCC',
  'ARC',
  'MODEL CHURCH',
  'LORDS ARMY',
  'FIREBRAND',
  'FRUITFUL CHURCH',
  'TRUIMPHANT CHURCH',
  'LUMINOUS CHURCH',
  'PERFECT CHURCH',
  'WINNING CHURCH',
  'ABUNDANT GRACE',
  'KASOA CHURCH',
  'MEGA CHURCH',
  'WONDER CHURCH',
  'GLORIOUS CHURCH',
  'TRUELIGHT CHURCH',
  'KORLE BU CHURCH',
  'POWERHOUSE',
  'JESUS BRAND',
  'TAKORADI CHURCH',
  'KOFORIDUA CHURCH',
  'HO CHURCH',
  'CHILDREN\'S CHURCH',
  'MODEL TEENS CHURCH 1',
  'MODEL TEENS CHURCH 2',
  'MODEL TEENS CHURCH 3',
  'MODEL TEENS CHURCH 4',
  'NATIONAL MISSIONS',
];

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [church, setChurch] = useState('');
  const [fellowship, setFellowship] = useState('');
  const [cell, setCell] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await supabaseAuth.register(email, name, password, church, fellowship, cell);
      
      if (result.success && result.user) {
        if (result.needsEmailConfirmation) {
          // Email confirmation required
          toast({
            title: 'Registration successful!',
            description: `Please check your email (${email}) to confirm your account before logging in.`,
            duration: 10000, // Show for 10 seconds
          });
          // Redirect to login page instead of dashboard
          navigate('/login');
        } else {
          // No email confirmation needed (auto-logged in)
          toast({
            title: 'Registration successful!',
            description: 'Welcome to Foundation School',
          });
          navigate('/dashboard');
        }
      } else {
        toast({
          title: 'Registration failed',
          description: result.error || 'An error occurred during registration',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary p-3 sm:p-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-3 sm:pb-6">
          <div className="flex justify-center mb-2 sm:mb-4">
            <img src="logo.png" alt="Foundation School Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm object-cover" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Register</CardTitle>
          <CardDescription className="text-xs sm:text-base">Join us today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 text-sm"
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
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Min 8 chars with uppercase, lowercase & number
              </p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="church" className="text-xs sm:text-sm">Church</Label>
              <Select value={church} onValueChange={setChurch} required>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select your church" />
                </SelectTrigger>
                <SelectContent>
                  {CHURCH_OPTIONS.map((churchOption) => (
                    <SelectItem key={churchOption} value={churchOption} className="text-sm">
                      {churchOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="fellowship" className="text-xs sm:text-sm">Fellowship</Label>
              <Input
                id="fellowship"
                value={fellowship}
                onChange={(e) => setFellowship(e.target.value)}
                placeholder="Your fellowship"
                className="text-sm"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="cell" className="text-xs sm:text-sm">Cell</Label>
              <Input
                id="cell"
                value={cell}
                onChange={(e) => setCell(e.target.value)}
                placeholder="Your cell"
                className="text-sm"
              />
            </div>
            <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs sm:text-sm"
              onClick={() => navigate('/login')}
            >
              Have an account? Sign In
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs sm:text-sm"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
