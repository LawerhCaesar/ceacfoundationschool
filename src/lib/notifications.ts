import { supabaseDb } from './supabase-db';
import { EmailService } from './email-service';

export interface Notification {
  id: string;
  type: 'enrollment_request' | 'class_completed' | 'assignment_submitted';
  title: string;
  message: string;
  userId: string;
  classId?: string;
  studentId?: string;
  read: boolean;
  createdAt: string;
}

export interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  churchId: string;
  churchName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export class NotificationService {
  // Send enrollment request notification to all teachers in the same church
  static async sendEnrollmentRequest(
    studentId: string,
    studentName: string,
    classId: string,
    className: string,
    churchId: string,
    churchName: string
  ): Promise<boolean> {
    try {
      // Get all teachers in the same church
      const teachers = await supabaseDb.getUsersByRole('teacher');
      const churchTeachers = teachers.filter(teacher => teacher.church === churchId);

      // Create enrollment request record
      const enrollmentRequest = await supabaseDb.createEnrollmentRequest({
        studentId,
        classId,
        churchId,
        status: 'pending'
      });

      // Send notifications to all teachers in the church
      const notifications = churchTeachers.map(teacher => ({
        type: 'enrollment_request' as const,
        title: 'New Enrollment Request',
        message: `${studentName} wants to enroll in ${className}`,
        userId: teacher.id,
        classId,
        studentId,
        read: false
      }));

      // Only create notifications if there are teachers to notify
      if (notifications.length > 0) {
      await supabaseDb.createNotifications(notifications);
      }

      // Send enhanced push notifications if supported
      if (this.isNotificationSupported() && Notification.permission === 'granted') {
        churchTeachers.forEach(teacher => {
          this.sendEnhancedNotification('New Enrollment Request', {
            body: `${studentName} from ${churchName} wants to enroll in ${className}`,
            studentName,
            className,
            churchName,
            actionUrl: '/teacher?section=enrollment-requests',
            tag: `enrollment-${enrollmentRequest.id}`,
            userId: teacher.id
          });
        });
      }

      // Send email notifications to teachers
      const teacherEmails = churchTeachers
        .map(teacher => ({
          email: teacher.email,
          userId: teacher.id
        }))
        .filter(teacher => teacher.email && EmailService.isEmailNotificationEnabled(teacher.userId))
        .map(teacher => teacher.email!);
      
      if (teacherEmails.length > 0) {
        const portalUrl = 'https://ceacfoundationschool.com';
        EmailService.sendEnrollmentRequestEmail(teacherEmails, {
          studentName,
          studentEmail: undefined, // Could be added if needed
          className,
          churchName,
          enrollmentRequestId: enrollmentRequest.id,
          portalUrl,
        }).catch(error => {
          console.error('Failed to send email notifications:', error);
          // Don't fail the entire operation if email fails
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending enrollment request:', error);
      return false;
    }
  }

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Check if notifications are supported and enabled
  static isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  // Get current permission status
  static getPermissionStatus(): NotificationPermission {
    if (!this.isNotificationSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Check if user has disabled notifications in app preferences
  static isNotificationEnabled(userId: string): boolean {
    const preference = localStorage.getItem(`notification-preference-${userId}`);
    return preference !== 'disabled';
  }

  // Set notification preference
  static setNotificationPreference(userId: string, enabled: boolean): void {
    localStorage.setItem(`notification-preference-${userId}`, enabled ? 'enabled' : 'disabled');
  }

  // Send enhanced notification with user preference check
  static sendEnhancedNotification(
    title: string, 
    options: NotificationOptions & {
      studentName?: string;
      className?: string;
      churchName?: string;
      actionUrl?: string;
      userId?: string;
    }
  ): Notification | null {
    if (!this.isNotificationSupported() || Notification.permission !== 'granted') {
      return null;
    }

    // Check user preference
    if (options.userId && !this.isNotificationEnabled(options.userId)) {
      return null;
    }

    const notification = new Notification(title, {
      ...options,
      icon: '/logo.png',
      badge: '/logo.png',
      requireInteraction: true, // Keep notification visible until user interacts
      silent: false,
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      tag: options.tag || 'enrollment-request', // Group similar notifications
      renotify: true, // Show notification even if one with same tag exists
    });

    // Add click handler to focus the app
    notification.onclick = () => {
      window.focus();
      if (options.actionUrl) {
        window.location.href = options.actionUrl;
      }
      notification.close();
    };

    // Auto-close after 10 seconds if not interacted with
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      return await supabaseDb.getUserNotifications(userId);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      return await supabaseDb.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      return await supabaseDb.markAllNotificationsAsRead(userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}
