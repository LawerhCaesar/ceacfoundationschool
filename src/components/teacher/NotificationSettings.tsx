import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/lib/notifications';
import { BlockNotificationPrompt } from '@/components/shared/BlockNotificationPrompt';
import { Bell, BellOff, Smartphone, Laptop, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface NotificationSettingsProps {
  userRole: string;
}

export const NotificationSettings = ({ userRole }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showBlockPrompt, setShowBlockPrompt] = useState(false);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = () => {
    const supported = NotificationService.isNotificationSupported();
    const status = NotificationService.getPermissionStatus();
    
    setIsSupported(supported);
    setPermissionStatus(status);
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await NotificationService.requestPermission();
      
      if (granted) {
        setPermissionStatus('granted');
        toast({
          title: 'Notifications Enabled! 🔔',
          description: 'You\'ll now receive instant alerts for enrollment requests.',
        });
      } else {
        setPermissionStatus('denied');
        toast({
          title: 'Notifications Blocked',
          description: 'You can enable them later in your browser settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to request notification permission.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDisableNotifications = () => {
    // Show block confirmation prompt
    setShowBlockPrompt(true);
  };

  const handleBlockConfirmed = () => {
    setShowBlockPrompt(false);
    toast({
      title: 'Notifications Disabled',
      description: 'You won\'t receive enrollment request notifications.',
    });
  };

  const handleBlockDismissed = () => {
    setShowBlockPrompt(false);
  };

  const getStatusBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enabled
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Blocked
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Set
          </Badge>
        );
    }
  };

  const getStatusDescription = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'You\'ll receive instant notifications for enrollment requests';
      case 'denied':
        return 'Notifications are blocked. Enable them in your browser settings';
      default:
        return 'Click "Enable Notifications" to start receiving alerts';
    }
  };

  if (!['teacher', 'admin', 'pastor'].includes(userRole)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Settings
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications for enrollment requests
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-primary" />
            <h4 className="font-medium">Current Status</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {getStatusDescription()}
          </p>
          
          {!isSupported && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Notifications are not supported in this browser
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isSupported && (
          <div className="space-y-3">
            {permissionStatus === 'default' && (
              <Button 
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                {isRequesting ? 'Requesting...' : 'Enable Notifications'}
              </Button>
            )}
            
            {permissionStatus === 'denied' && (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Notifications are blocked. To enable them:
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 mt-2 space-y-1">
                    <li>• Click the lock icon in your browser's address bar</li>
                    <li>• Select "Allow" for notifications</li>
                    <li>• Refresh this page</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  onClick={checkNotificationSupport}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Check Again
                </Button>
              </div>
            )}
            
            {permissionStatus === 'granted' && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Notifications are enabled! You'll receive alerts for enrollment requests.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDisableNotifications}
                  className="w-full"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Disable Notifications
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">What you'll receive:</h4>
          
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Mobile Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get alerts on your phone even when the app is closed
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Laptop className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Desktop Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Popup notifications on your computer
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Bell className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Instant Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Immediate notifications when students request enrollment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 You can change notification settings anytime in your browser
          </p>
        </div>
      </CardContent>
      
      {/* Block Prompt */}
      {showBlockPrompt && (
        <BlockNotificationPrompt 
          onConfirm={handleBlockConfirmed}
          onDismiss={handleBlockDismissed}
        />
      )}
    </Card>
  );
};
