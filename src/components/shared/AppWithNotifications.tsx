import { useState, useEffect } from 'react';
import { NotificationBanner } from './NotificationBanner';
import { NotificationPermissionPrompt } from './NotificationPermissionPrompt';
import { NotificationService } from '@/lib/notifications';
import { useAuth } from '@/lib/supabase-auth';

interface AppWithNotificationsProps {
  children: React.ReactNode;
}

export const AppWithNotifications = ({ children }: AppWithNotificationsProps) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Request notification permission when user logs in
    if (user && (user.role === 'teacher' || user.role === 'admin' || user.role === 'pastor')) {
      NotificationService.requestPermission();
      setShowNotifications(true);
    }
  }, [user]);

  if (!user || !showNotifications) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt 
        userRole={user.role}
        onPermissionGranted={() => {
          console.log('Notification permission granted!');
        }}
        onDismiss={() => {
          console.log('Notification prompt dismissed');
        }}
      />
      
      {/* Notification Banner */}
      <NotificationBanner 
        userId={user.id} 
        userRole={user.role}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};
