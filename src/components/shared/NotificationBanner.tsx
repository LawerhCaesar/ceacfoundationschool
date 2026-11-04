import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, CheckCircle, Clock, User } from 'lucide-react';
import { NotificationService } from '@/lib/notifications';
import { Notification } from '@/types';

interface NotificationBannerProps {
  userId: string;
  userRole: string;
  onClose?: () => void;
}

export const NotificationBanner = ({ userId, userRole, onClose }: NotificationBannerProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const userNotifications = await NotificationService.getUserNotifications(userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await NotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await NotificationService.markAllAsRead(userId);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    onClose?.();
  };

  if (!showBanner || loading) {
    return null;
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const enrollmentRequests = unreadNotifications.filter(n => n.type === 'enrollment_request');

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Notifications</h3>
              <Badge variant="secondary" className="text-xs">
                {unreadNotifications.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {unreadNotifications.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-6 px-2"
                >
                  Mark All Read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {enrollmentRequests.map((notification) => (
              <div
                key={notification.id}
                className="p-3 bg-muted/50 rounded-lg border border-primary/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-blue-600">
                        {notification.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs h-6 px-2"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark Read
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs h-6 px-2"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {unreadNotifications.filter(n => n.type !== 'enrollment_request').map((notification) => (
              <div
                key={notification.id}
                className="p-3 bg-muted/30 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Bell className="w-4 h-4 text-green-600 mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-green-600 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs h-6 px-2"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark Read
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {enrollmentRequests.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/10">
              <p className="text-xs text-muted-foreground text-center">
                💡 Teachers can approve/reject enrollment requests in their dashboard
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};






























