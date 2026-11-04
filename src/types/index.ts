// Re-export types from supabase-db for consistency
export type { User, Class, Enrollment, Exam } from '@/lib/supabase-db';

export type UserRole = 'student' | 'teacher' | 'admin' | 'pastor';

// Notification types
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
