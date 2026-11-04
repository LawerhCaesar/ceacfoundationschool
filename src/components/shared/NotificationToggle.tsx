import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/lib/notifications';
import { NotificationPermissionPrompt } from './NotificationPermissionPrompt';
import { BlockNotificationPrompt } from './BlockNotificationPrompt';
import { Bell, BellOff, Settings } from 'lucide-react';

interface NotificationToggleProps {
  userRole: string;
  className?: string;
  variant?: 'button' | 'toggle' | 'compact' | 'sidebar';
  userId?: string;
}

export const NotificationToggle = ({ 
  userRole, 
  className = '', 
  variant = 'button',
  userId
}: NotificationToggleProps) => {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [appPreference, setAppPreference] = useState<boolean>(true);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [showBlockPrompt, setShowBlockPrompt] = useState(false);

  useEffect(() => {
    checkNotificationSupport();
    if (userId) {
      const preference = NotificationService.isNotificationEnabled(userId);
      setAppPreference(preference);
    }
  }, [userId]);

  const checkNotificationSupport = () => {
    const supported = NotificationService.isNotificationSupported();
    const status = NotificationService.getPermissionStatus();
    
    setIsSupported(supported);
    setPermissionStatus(status);
  };

  const handleToggleNotifications = async () => {
    setIsRequesting(true);
    
    try {
      // If we have userId, toggle app preference
      if (userId) {
        const newPreference = !appPreference;
        NotificationService.setNotificationPreference(userId, newPreference);
        setAppPreference(newPreference);
        
        if (newPreference) {
          // If enabling, show permission prompt if not granted
          if (permissionStatus !== 'granted') {
            setShowPermissionPrompt(true);
          } else {
            toast({
              title: 'Notifications Enabled! 🔔',
              description: 'You\'ll now receive instant alerts when students request enrollment.',
            });
          }
        } else {
          // If disabling, show block prompt
          setShowBlockPrompt(true);
        }
        return;
      }

      // Fallback to browser permission only (for components without userId)
      if (permissionStatus === 'granted') {
        // Show instructions to disable
        toast({
          title: 'Disable Notifications',
          description: 'To disable notifications, go to your browser settings and block notifications for this site.',
          duration: 5000,
        });
        return;
      }

      // Request permission to enable notifications
      const granted = await NotificationService.requestPermission();
      
      if (granted) {
        setPermissionStatus('granted');
        toast({
          title: 'Notifications Enabled! 🔔',
          description: 'You\'ll now receive instant alerts when students request enrollment.',
        });
      } else {
        setPermissionStatus('denied');
        toast({
          title: 'Notifications Blocked',
          description: 'You can enable them later in your browser settings or notification settings.',
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

  const handlePermissionGranted = () => {
    setPermissionStatus('granted');
    setShowPermissionPrompt(false);
    toast({
      title: 'Notifications Enabled! 🔔',
      description: 'You\'ll now receive instant alerts when students request enrollment.',
    });
  };

  const handlePermissionDismissed = () => {
    setShowPermissionPrompt(false);
    // Revert the app preference since permission wasn't granted
    if (userId) {
      NotificationService.setNotificationPreference(userId, false);
      setAppPreference(false);
    }
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
    // Revert the app preference since user didn't confirm blocking
    if (userId) {
      NotificationService.setNotificationPreference(userId, true);
      setAppPreference(true);
    }
  };

  const getStatusIcon = (isSidebar = false) => {
    const iconSize = isSidebar ? "w-3 h-3" : "w-4 h-4";
    
    switch (permissionStatus) {
      case 'granted':
        return <Bell className={`${iconSize} text-green-600`} />;
      case 'denied':
        return <BellOff className={`${iconSize} text-red-600`} />;
      default:
        return <Bell className={`${iconSize} text-muted-foreground`} />;
    }
  };

  const getStatusText = () => {
    if (userId) {
      return appPreference ? 'Turn Off Notifications' : 'Enable Notifications';
    }
    
    switch (permissionStatus) {
      case 'granted':
        return 'Turn Off Notifications';
      case 'denied':
        return 'Enable Notifications';
      default:
        return 'Enable Notifications';
    }
  };

  const getStatusBadge = (isSidebar = false) => {
    const badgeSize = isSidebar ? "text-[10px] px-1 py-0" : "text-xs";
    
    if (userId) {
      return appPreference ? 
        <Badge className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${badgeSize}`}>ON</Badge> :
        <Badge variant="outline" className={badgeSize}>OFF</Badge>;
    }
    
    switch (permissionStatus) {
      case 'granted':
        return <Badge className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${badgeSize}`}>ON</Badge>;
      case 'denied':
        return <Badge variant="destructive" className={badgeSize}>BLOCKED</Badge>;
      default:
        return <Badge variant="outline" className={badgeSize}>OFF</Badge>;
    }
  };

  // Don't show for students
  if (!['teacher', 'admin', 'pastor'].includes(userRole)) {
    return null;
  }

  // Don't show if notifications not supported
  if (!isSupported) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <>
        <div className={`flex items-center justify-between w-full max-w-full ${className}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getStatusIcon(true)}
            <span className="text-xs text-muted-foreground truncate">Notifications</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Switch
              id="notification-toggle-sidebar"
              checked={userId ? appPreference : permissionStatus === 'granted'}
              onCheckedChange={handleToggleNotifications}
              disabled={isRequesting}
              aria-label="Toggle notifications"
              className="scale-75"
            />
            {getStatusBadge(true)}
          </div>
        </div>
        
        {/* Permission Prompt */}
        {showPermissionPrompt && (
          <NotificationPermissionPrompt 
            userRole={userRole}
            onPermissionGranted={handlePermissionGranted}
            onDismiss={handlePermissionDismissed}
          />
        )}
        
        {/* Block Prompt */}
        {showBlockPrompt && (
          <BlockNotificationPrompt 
            onConfirm={handleBlockConfirmed}
            onDismiss={handleBlockDismissed}
          />
        )}
      </>
    );
  }

  if (variant === 'toggle') {
    return (
      <>
        <div className={`flex items-center gap-3 ${className}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Label htmlFor="notification-toggle" className="text-sm font-medium">
              Push Notifications
            </Label>
          </div>
          <Switch
            id="notification-toggle"
            checked={userId ? appPreference : permissionStatus === 'granted'}
            onCheckedChange={handleToggleNotifications}
            disabled={isRequesting}
            aria-label="Toggle notifications"
          />
          {getStatusBadge()}
        </div>
        
        {/* Permission Prompt */}
        {showPermissionPrompt && (
          <NotificationPermissionPrompt 
            userRole={userRole}
            onPermissionGranted={handlePermissionGranted}
            onDismiss={handlePermissionDismissed}
          />
        )}
        
        {/* Block Prompt */}
        {showBlockPrompt && (
          <BlockNotificationPrompt 
            onConfirm={handleBlockConfirmed}
            onDismiss={handleBlockDismissed}
          />
        )}
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <Button
          variant={permissionStatus === 'granted' ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleNotifications}
          disabled={isRequesting}
          className={`${className} ${permissionStatus === 'granted' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
          {getStatusBadge()}
        </Button>
        
        {/* Permission Prompt */}
        {showPermissionPrompt && (
          <NotificationPermissionPrompt 
            userRole={userRole}
            onPermissionGranted={handlePermissionGranted}
            onDismiss={handlePermissionDismissed}
          />
        )}
        
        {/* Block Prompt */}
        {showBlockPrompt && (
          <BlockNotificationPrompt 
            onConfirm={handleBlockConfirmed}
            onDismiss={handleBlockDismissed}
          />
        )}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <Button
        variant={permissionStatus === 'granted' ? 'default' : 'outline'}
        onClick={handleToggleNotifications}
        disabled={isRequesting}
        className={`${className} ${permissionStatus === 'granted' ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>
        {getStatusBadge()}
      </Button>
      
      {/* Permission Prompt */}
      {showPermissionPrompt && (
        <NotificationPermissionPrompt 
          userRole={userRole}
          onPermissionGranted={handlePermissionGranted}
          onDismiss={handlePermissionDismissed}
        />
      )}
      
      {/* Block Prompt */}
      {showBlockPrompt && (
        <BlockNotificationPrompt 
          onConfirm={handleBlockConfirmed}
          onDismiss={handleBlockDismissed}
        />
      )}
    </>
  );
};
