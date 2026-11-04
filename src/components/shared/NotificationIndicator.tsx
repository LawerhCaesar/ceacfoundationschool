import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { NotificationService } from '@/lib/notifications';

interface NotificationIndicatorProps {
  userId: string;
  className?: string;
}

export const NotificationIndicator = ({ userId, className = '' }: NotificationIndicatorProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnreadCount();
    
    // Check for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const loadUnreadCount = async () => {
    try {
      const notifications = await NotificationService.getUserNotifications(userId);
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || unreadCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-4 h-4" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </Badge>
    </div>
  );
};






























