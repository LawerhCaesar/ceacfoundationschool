// TypeScript types for Supabase database
// These match the schema in supabase-schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          church: string | null
          fellowship: string | null
          cell: string | null
          role: 'student' | 'teacher' | 'admin' | 'pastor'
          profile_picture_url: string | null
          registered_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          church?: string | null
          fellowship?: string | null
          cell?: string | null
          role?: 'student' | 'teacher' | 'admin'
          profile_picture_url?: string | null
          registered_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          church?: string | null
          fellowship?: string | null
          cell?: string | null
          role?: 'student' | 'teacher' | 'admin'
          profile_picture_url?: string | null
          registered_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          description: string | null
          teacher_id: string | null
          schedule: string | null
          start_date: string
          end_date: string
          capacity: number | null
          video_file: string | null
          video_title: string | null
          video_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          teacher_id?: string | null
          schedule?: string | null
          start_date: string
          end_date: string
          capacity?: number | null
          video_file?: string | null
          video_title?: string | null
          video_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          teacher_id?: string | null
          schedule?: string | null
          start_date?: string
          end_date?: string
          capacity?: number | null
          video_file?: string | null
          video_title?: string | null
          video_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          class_id: string
          enrolled_at: string
          completed: boolean
          completed_at: string | null
          graduated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          enrolled_at?: string
          completed?: boolean
          completed_at?: string | null
          graduated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          enrolled_at?: string
          completed?: boolean
          completed_at?: string | null
          graduated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          class_id: string
          student_id: string
          score: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          student_id: string
          score?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          student_id?: string
          score?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      student_progress: {
        Row: {
          student_id: string
          name: string
          email: string
          church: string | null
          total_enrolled: number
          total_completed: number
          total_graduated: number
          completion_rate: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

