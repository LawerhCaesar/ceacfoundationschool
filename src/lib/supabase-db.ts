/**
 * Supabase Database Operations Module
 * 
 * Provides comprehensive database operations for:
 * - User management (CRUD operations)
 * - Class/course management
 * - Enrollment tracking and management
 * - Exam records
 * 
 * All operations respect Row Level Security (RLS) policies
 * and handle errors gracefully with appropriate error logging.
 * 
 * @module supabase-db
 * @version 1.0.0
 */

import { supabase } from './supabase';

/**
 * User entity interface
 * Represents a user in the system (student, teacher, or admin)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  church?: string | null;
  fellowship?: string | null;
  cell?: string | null;
  role: 'student' | 'teacher' | 'admin' | 'pastor';
  primaryTeacherId?: string | null;
  profilePictureUrl?: string | null;
  registeredAt: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  schedule: string;
  startDate: string;
  endDate: string;
  capacity: number;
  videoFile?: string | null;
  videoTitle?: string | null;
  videoDescription?: string | null;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  assignedTeacherId: string;
  enrolledAt: string;
  completed: boolean;
  completedAt: string | null;
  graduated: boolean;
  graduatedAt: string | null;
}

export interface ChurchTeacher {
  id: string;
  church: string;
  teacherId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  classId: string;
  studentId: string;
  score: number | null;
  completedAt: string | null;
  sectionAAnswers?: Record<string, string> | null;
  sectionAScore?: number | null;
  sectionBAnswers?: string[] | null;
  sectionBScore?: number | null;
  status?: 'not_started' | 'section_a_complete' | 'section_b_submitted' | 'fully_graded';
  startedAt?: string | null;
}

export const supabaseDb = {
  // ==================== USERS ====================
  
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return (data || []).map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      church: u.church,
      fellowship: u.fellowship,
      cell: u.cell,
      role: u.role,
      primaryTeacherId: u.primary_teacher_id,
      profilePictureUrl: u.profile_picture_url,
      registeredAt: u.registered_at,
    }));
  },

  getUserById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      church: data.church,
      fellowship: data.fellowship,
      cell: data.cell,
      role: data.role,
      primaryTeacherId: data.primary_teacher_id,
      profilePictureUrl: data.profile_picture_url,
      registeredAt: data.registered_at,
    };
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    const { data, error} = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      church: data.church,
      fellowship: data.fellowship,
      cell: data.cell,
      role: data.role,
      primaryTeacherId: data.primary_teacher_id,
      profilePictureUrl: data.profile_picture_url,
      registeredAt: data.registered_at,
    };
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    // Build update object with only defined fields
    const updateData: Record<string, any> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.church !== undefined) updateData.church = updates.church;
    if (updates.fellowship !== undefined) updateData.fellowship = updates.fellowship;
    if (updates.cell !== undefined) updateData.cell = updates.cell;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.primaryTeacherId !== undefined) updateData.primary_teacher_id = updates.primaryTeacherId;
    if (updates.profilePictureUrl !== undefined) updateData.profile_picture_url = updates.profilePictureUrl;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      church: data.church,
      fellowship: data.fellowship,
      cell: data.cell,
      role: data.role,
      primaryTeacherId: data.primary_teacher_id,
      profilePictureUrl: data.profile_picture_url,
      registeredAt: data.registered_at,
    };
  },

  // ==================== CLASSES ====================
  
  getClasses: async (): Promise<Class[]> => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return (data || []).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      schedule: c.schedule || 'Self-paced',
      startDate: c.start_date,
      endDate: c.end_date,
      capacity: c.capacity || 100,
      videoFile: c.video_file,
      videoTitle: c.video_title,
      videoDescription: c.video_description,
    }));
  },

  addClass: async (classData: Omit<Class, 'id'>): Promise<Class | null> => {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        name: classData.name,
        description: classData.description,
        schedule: classData.schedule,
        start_date: classData.startDate,
        end_date: classData.endDate,
        capacity: classData.capacity,
        video_file: classData.videoFile,
        video_title: classData.videoTitle,
        video_description: classData.videoDescription,
      })
      .select()
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      schedule: data.schedule || 'Self-paced',
      startDate: data.start_date,
      endDate: data.end_date,
      capacity: data.capacity || 100,
      videoFile: data.video_file,
      videoTitle: data.video_title,
      videoDescription: data.video_description,
    };
  },

  updateClass: async (id: string, updates: Partial<Class>): Promise<void> => {
    const { error } = await supabase
      .from('classes')
      .update({
        name: updates.name,
        description: updates.description,
        schedule: updates.schedule,
        start_date: updates.startDate,
        end_date: updates.endDate,
        capacity: updates.capacity,
        video_file: updates.videoFile,
        video_title: updates.videoTitle,
        video_description: updates.videoDescription,
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  setStudentPrimaryTeacher: async (studentId: string, teacherId: string): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .update({ primary_teacher_id: teacherId })
      .eq('id', studentId);
    
    if (error) throw error;
  },

  deleteClass: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ==================== ENROLLMENTS ====================
  
  getEnrollments: async (): Promise<Enrollment[]> => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .order('enrolled_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(e => ({
      id: e.id,
      studentId: e.student_id,
      classId: e.class_id,
      assignedTeacherId: e.assigned_teacher_id,
      enrolledAt: e.enrolled_at,
      completed: e.completed,
      completedAt: e.completed_at,
      graduated: e.graduated,
      graduatedAt: e.graduated_at,
    }));
  },

  getStudentEnrollments: async (studentId: string): Promise<Enrollment[]> => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(e => ({
      id: e.id,
      studentId: e.student_id,
      classId: e.class_id,
      assignedTeacherId: e.assigned_teacher_id,
      enrolledAt: e.enrolled_at,
      completed: e.completed,
      completedAt: e.completed_at,
      graduated: e.graduated,
      graduatedAt: e.graduated_at,
    }));
  },

  addEnrollment: async (enrollment: Omit<Enrollment, 'id'>): Promise<Enrollment | null> => {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: enrollment.studentId,
        class_id: enrollment.classId,
        assigned_teacher_id: enrollment.assignedTeacherId,
        enrolled_at: enrollment.enrolledAt,
        completed: enrollment.completed,
        completed_at: enrollment.completedAt,
        graduated: enrollment.graduated,
        graduated_at: enrollment.graduatedAt,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Enrollment error:', error);
      return null;
    }
    
    return {
      id: data.id,
      studentId: data.student_id,
      classId: data.class_id,
      assignedTeacherId: data.assigned_teacher_id,
      enrolledAt: data.enrolled_at,
      completed: data.completed,
      completedAt: data.completed_at,
      graduated: data.graduated,
      graduatedAt: data.graduated_at,
    };
  },

  updateEnrollment: async (id: string, updates: Partial<Enrollment>): Promise<void> => {
    const { error} = await supabase
      .from('enrollments')
      .update({
        completed: updates.completed,
        completed_at: updates.completedAt,
        graduated: updates.graduated,
        graduated_at: updates.graduatedAt,
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  markClassCompleted: async (studentId: string, classId: string): Promise<void> => {
    const { error } = await supabase
      .from('enrollments')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('class_id', classId);
    
    if (error) throw error;
  },

  // ==================== CHURCH TEACHERS ====================

  getChurchTeachers: async (church?: string): Promise<ChurchTeacher[]> => {
    let query = supabase
      .from('church_teachers')
      .select('*')
      .eq('is_active', true);
    
    if (church) {
      query = query.eq('church', church);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(ct => ({
      id: ct.id,
      church: ct.church,
      teacherId: ct.teacher_id,
      isActive: ct.is_active,
      createdAt: ct.created_at,
      updatedAt: ct.updated_at,
    }));
  },

  getTeachersForChurch: async (church: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from('church_teachers')
      .select(`
        teacher_id,
        users!church_teachers_teacher_id_fkey (
          id,
          email,
          name,
          church,
          fellowship,
          cell,
          role,
          registered_at
        )
      `)
      .eq('church', church)
      .eq('is_active', true);
    
    if (error) throw error;
    
    return (data || [])
      .map(ct => ct.users as any)
      .filter(Boolean)
      .map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        church: u.church,
        fellowship: u.fellowship,
        cell: u.cell,
        role: u.role,
        registeredAt: u.registered_at,
      }));
  },

  addChurchTeacher: async (church: string, teacherId: string): Promise<ChurchTeacher | null> => {
    const { data, error } = await supabase
      .from('church_teachers')
      .insert({
        church,
        teacher_id: teacherId,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding church teacher:', error);
      return null;
    }
    
    return {
      id: data.id,
      church: data.church,
      teacherId: data.teacher_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  removeChurchTeacher: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('church_teachers')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  // ==================== EXAMS ====================

  _mapExam: (e: any): Exam => ({
    id: e.id,
    classId: e.class_id,
    studentId: e.student_id,
    score: e.score,
    completedAt: e.completed_at,
    sectionAAnswers: e.section_a_answers,
    sectionAScore: e.section_a_score,
    sectionBAnswers: e.section_b_answers,
    sectionBScore: e.section_b_score,
    status: e.status,
    startedAt: e.started_at,
  }),

  getExams: async (): Promise<Exam[]> => {
    const { data, error } = await supabase
      .from('exams')
      .select('*');
    if (error) throw error;
    return (data || []).map(supabaseDb._mapExam);
  },

  /** Get a single student's exam record (returns null if not started) */
  getStudentExam: async (studentId: string): Promise<Exam | null> => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error || !data) return null;
    return supabaseDb._mapExam(data);
  },

  /** Start the exam — creates a record with status not_started */
  startExam: async (studentId: string, classId: string): Promise<Exam | null> => {
    // Check if already exists (e.g. page refresh)
    const existing = await supabaseDb.getStudentExam(studentId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('exams')
      .insert({
        class_id: classId,
        student_id: studentId,
        status: 'not_started',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !data) return null;
    return supabaseDb._mapExam(data);
  },

  /** Auto-grade and save Section A */
  submitSectionA: async (
    examId: string,
    answers: Record<string, string>,
    autoScore: number
  ): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .update({
        section_a_answers: answers,
        section_a_score: autoScore,
        status: 'section_a_complete',
      })
      .eq('id', examId);
    if (error) throw error;
  },

  /** Save student's Section B answers */
  submitSectionB: async (
    examId: string,
    answers: string[]
  ): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .update({
        section_b_answers: answers,
        status: 'section_b_submitted',
        completed_at: new Date().toISOString(),
      })
      .eq('id', examId);
    if (error) throw error;
  },

  /** Teacher grades Section B and finalises total */
  gradeSectionB: async (
    examId: string,
    sectionBScore: number,
    sectionAScore: number
  ): Promise<void> => {
    const total = sectionAScore + sectionBScore;
    const { error } = await supabase
      .from('exams')
      .update({
        section_b_score: sectionBScore,
        score: total,
        status: 'fully_graded',
      })
      .eq('id', examId);
    if (error) throw error;
  },

  /** Get all student exams submitted for teacher grading, with student info */
  getPendingExamsForTeacher: async (teacherId: string): Promise<any[]> => {
    // Get student IDs assigned to this teacher
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('assigned_teacher_id', teacherId);

    if (!enrollments || enrollments.length === 0) return [];

    const studentIds = enrollments.map((e: any) => e.student_id);

    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        student:users!exams_student_id_fkey(id, name, email, church, fellowship)
      `)
      .in('student_id', studentIds)
      .in('status', ['section_b_submitted', 'fully_graded'])
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending exams:', error);
      return [];
    }
    return (data || []).map((e: any) => ({
      ...supabaseDb._mapExam(e),
      student: e.student,
    }));
  },

  /** Admin: get ALL exam submissions across every student, with student info */
  getAllExamsForAdmin: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        student:users!exams_student_id_fkey(id, name, email, church, fellowship, cell)
      `)
      .not('status', 'eq', 'not_started')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching all exams for admin:', error);
      return [];
    }
    return (data || []).map((e: any) => ({
      ...supabaseDb._mapExam(e),
      student: e.student,
    }));
  },

  /** Admin: annul Section B grading — resets score & status so it can be regraded */
  annulSectionB: async (examId: string): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .update({
        section_b_score: null,
        score: null,
        status: 'section_b_submitted',
      })
      .eq('id', examId);
    if (error) throw error;
  },


  // ── App settings ────────────────────────────────────────────────────────────

  /** Returns true if the exam is currently locked by admin */
  getExamLocked: async (): Promise<boolean> => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'exam_locked')
      .single();
    // Default to locked if setting doesn't exist yet
    return !data || data.value === 'true';
  },

  /** Admin sets the exam lock state */
  setExamLocked: async (locked: boolean): Promise<void> => {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'exam_locked', value: locked ? 'true' : 'false', updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  addExam: async (exam: Omit<Exam, 'id'>): Promise<Exam | null> => {
    const { data, error } = await supabase
      .from('exams')
      .insert({
        class_id: exam.classId,
        student_id: exam.studentId,
        score: exam.score,
        completed_at: exam.completedAt,
        status: 'not_started',
      })
      .select()
      .single();
    if (error || !data) return null;
    return supabaseDb._mapExam(data);
  },

  updateExam: async (classId: string, studentId: string, score: number): Promise<void> => {
    const { error } = await supabase
      .from('exams')
      .update({ score, completed_at: new Date().toISOString() })
      .eq('class_id', classId)
      .eq('student_id', studentId);
    if (error) throw error;
  },

  // ==================== VIDEO STORAGE ====================
  
  getVideoUrl: (videoFile: string): string => {
    if (!videoFile) return '';

    // If already a full URL, return it
    if (videoFile.startsWith('http')) return videoFile;

    // Use environment variable or default to production URL
    const baseUrl = import.meta.env.VITE_MEDIA_BASE_URL || 'https://ceacfoundationschool.com';
    
    // Remove leading slash if present to avoid double slash
    const normalizedPath = videoFile.startsWith('/') ? videoFile.substring(1) : videoFile;
    return `${baseUrl}/${normalizedPath}`;
  },

  // ==================== CHURCH OVERSIGHT ====================


  /**
   * Get all church oversight relationships (admin only)
   */
  getChurchOversight: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('church_oversight')
      .select('*')
      .eq('is_active', true)
      .order('oversight_church', { ascending: true });

    if (error) {
      console.error('Error getting church oversight:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Add church oversight relationship (admin only)
   */
  addChurchOversight: async (oversightChurch: string, managedChurch: string): Promise<boolean> => {
    const { error } = await supabase
      .from('church_oversight')
      .insert({
        oversight_church: oversightChurch,
        managed_church: managedChurch,
        is_active: true,
      });

    if (error) {
      console.error('Error adding church oversight:', error);
      return false;
    }

    return true;
  },

  /**
   * Remove church oversight relationship (admin only)
   */
  removeChurchOversight: async (oversightChurch: string, managedChurch: string): Promise<boolean> => {
    const { error } = await supabase
      .from('church_oversight')
      .update({ is_active: false })
      .eq('oversight_church', oversightChurch)
      .eq('managed_church', managedChurch);

    if (error) {
      console.error('Error removing church oversight:', error);
      return false;
    }

    return true;
  },

  // Notification functions
  createEnrollmentRequest: async (request: {
    studentId: string;
    classId: string;
    churchId: string;
    status: 'pending' | 'approved' | 'rejected';
  }): Promise<any> => {
    // Convert camelCase to snake_case for database
    const dbRequest = {
      student_id: request.studentId,
      class_id: request.classId,
      church_id: request.churchId,
      status: request.status
    };

    const { data, error } = await supabase
      .from('enrollment_requests')
      .insert([dbRequest])
      .select()
      .single();

    if (error) {
      console.error('Error creating enrollment request:', error);
      throw error;
    }

    return data;
  },

  createNotifications: async (notifications: Array<{
    type: string;
    title: string;
    message: string;
    userId: string;
    classId?: string;
    studentId?: string;
    read: boolean;
  }>): Promise<boolean> => {
    // Convert camelCase to snake_case for database
    const dbNotifications = notifications.map(notif => ({
      type: notif.type,
      title: notif.title,
      message: notif.message,
      user_id: notif.userId,
      class_id: notif.classId,
      student_id: notif.studentId,
      read: notif.read
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(dbNotifications);

    if (error) {
      console.error('Error creating notifications:', error);
      return false;
    }

    return true;
  },

  getUserNotifications: async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  },

  markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  },

  markAllNotificationsAsRead: async (userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  },

  getEnrollmentRequests: async (churchId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('enrollment_requests')
      .select(`
        *,
        student:users!enrollment_requests_student_id_fkey(id, name, email, role),
        class:classes!enrollment_requests_class_id_fkey(id, name)
      `)
      .eq('church_id', churchId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollment requests:', error);
      return [];
    }

    return data || [];
  },

  updateEnrollmentRequestStatus: async (
    requestId: string, 
    status: 'approved' | 'rejected'
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('enrollment_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) {
      console.error('Error updating enrollment request status:', error);
      return false;
    }

    return true;
  },

  // ==================== NEW BATCH RESET ====================

  /**
   * Resets student enrollment data for a new batch.
   * Preserves: user accounts, classes, teacher assignments, church_teachers, app_settings, exams.
   * Clears:    enrollments, primary_teacher_id on student accounts.
   */
  resetForNewBatch: async (): Promise<{ success: boolean; details: string }> => {
    try {
      // 1. Delete all enrollment records
      const { error: enrollmentsError } = await supabase
        .from('enrollments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

      if (enrollmentsError) {
        console.error('Error clearing enrollments:', enrollmentsError);
        return { success: false, details: `Failed to clear enrollments: ${enrollmentsError.message}` };
      }

      // 2. Clear primary_teacher_id on all student accounts so they re-select a teacher
      const { error: usersError } = await supabase
        .from('users')
        .update({ primary_teacher_id: null })
        .eq('role', 'student');

      if (usersError) {
        console.error('Error resetting student teacher assignments:', usersError);
        return { success: false, details: `Failed to reset teacher assignments: ${usersError.message}` };
      }

      return {
        success: true,
        details: 'All enrollments cleared. Exam records and student accounts preserved.',
      };
    } catch (err: any) {
      console.error('Unexpected error during batch reset:', err);
      return { success: false, details: err?.message || 'Unknown error occurred.' };
    }
  },
};

