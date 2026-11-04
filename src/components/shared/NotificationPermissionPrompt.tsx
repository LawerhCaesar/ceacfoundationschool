import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Laptop, X, CheckCircle } from 'lucide-react';
import { NotificationService } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermissionPromptProps {
  userRole: string;
  onPermissionGranted?: () => void;
  onDismiss?: () => void;
}

export const NotificationPermissionPrompt = ({ 
  userRole, 
  onPermissionGranted, 
  onDismiss 
}: NotificationPermissionPromptProps) => {
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Only show for teachers, admins, and pastors
    if (!['teacher', 'admin', 'pastor'].includes(userRole)) {
      return;
    }

    // Check if we've already asked for permission
    const hasAskedBefore = localStorage.getItem('notification-permission-asked');
    if (hasAskedBefore) {
      return;
    }

    // Check current permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      
      // Show prompt if permission is default (not asked yet)
      if (Notification.permission === 'default') {
        setShowPrompt(true);
      }
    }
  }, [userRole]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await NotificationService.requestPermission();
      
      if (granted) {
        setPermissionStatus('granted');
        setShowPrompt(false);
        
        // Mark that we've asked for permission
        localStorage.setItem('notification-permission-asked', 'true');
        
        // Show success toast
        toast({
          title: 'Notifications Enabled! 🔔',
          description: 'You\'ll now receive instant alerts when students request enrollment.',
        });

        onPermissionGranted?.();
      } else {
        setPermissionStatus('denied');
        toast({
          title: 'Notifications Blocked',
          description: 'You can enable notifications later in your browser settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to request notification permission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-permission-asked', 'true');
    onDismiss?.();
  };

  const handleEnableLater = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-permission-asked', 'true');
    toast({
      title: 'No Problem!',
      description: 'You can enable notifications anytime in your browser settings.',
    });
    onDismiss?.();
  };

  if (!showPrompt || permissionStatus !== 'default') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl text-primary">
            Enable Instant Notifications
          </CardTitle>
          <CardDescription className="text-sm">
            Get notified immediately when students request enrollment in your classes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-sm">Mobile Notifications</h4>
                <p className="text-xs text-muted-foreground">
                  Receive alerts on your phone even when the app is closed
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Laptop className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-sm">Desktop Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Get popup notifications on your computer
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-sm">Instant Response</h4>
                <p className="text-xs text-muted-foreground">
                  Approve or reject enrollment requests immediately
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isRequesting ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleEnableLater}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDismiss}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💡 You can change this setting anytime in your browser
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};






























