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
      organizations: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          settings: Json
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          settings?: Json
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          settings?: Json
          is_active?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null  // NULL para super admins
          created_at: string
          full_name: string
          role: 'admin' | 'doctor' | 'assistant'
          avatar_url: string | null
          is_active: boolean
          is_super_admin: boolean  // TRUE para super admins
        }
        Insert: {
          id: string
          organization_id?: string | null  // NULL para super admins
          created_at?: string
          full_name: string
          role?: 'admin' | 'doctor' | 'assistant'
          avatar_url?: string | null
          is_active?: boolean
          is_super_admin?: boolean
        }
        Update: {
          id?: string
          organization_id?: string | null
          created_at?: string
          full_name?: string
          role?: 'admin' | 'doctor' | 'assistant'
          avatar_url?: string | null
          is_active?: boolean
          is_super_admin?: boolean
        }
      }
      patients: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          name: string
          email: string
          phone: string
          status: 'active' | 'inactive'
          last_visit: string | null
          total_visits: number
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          name: string
          email: string
          phone: string
          status?: 'active' | 'inactive'
          last_visit?: string | null
          total_visits?: number
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          name?: string
          email?: string
          phone?: string
          status?: 'active' | 'inactive'
          last_visit?: string | null
          total_visits?: number
        }
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          date: string
          time: string
          start_datetime: string | null  // TEXT: formato ISO8601 com TZ (2025-11-25T09:00:00-03:00)
          end_datetime: string | null    // TEXT: formato ISO8601 com TZ (2025-11-25T10:00:00-03:00)
          patient_id: string
          patient_name: string
          type: string
          status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
          notes: string | null
          observations: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          date: string
          time: string
          start_datetime?: string | null  // TEXT: formato ISO8601 com TZ (2025-11-25T09:00:00-03:00)
          end_datetime?: string | null    // TEXT: formato ISO8601 com TZ (2025-11-25T10:00:00-03:00)
          patient_id: string
          patient_name: string
          type: string
          status?: 'confirmed' | 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          observations?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          date?: string
          time?: string
          start_datetime?: string | null  // TEXT: formato ISO8601 com TZ (2025-11-25T09:00:00-03:00)
          end_datetime?: string | null    // TEXT: formato ISO8601 com TZ (2025-11-25T10:00:00-03:00)
          patient_id?: string
          patient_name?: string
          type?: string
          status?: 'confirmed' | 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          observations?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          created_at: string
          organization_id: string
          clinic_name: string
          doctor_name: string
          subscription_plan: string
          subscription_renews_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          organization_id: string
          clinic_name: string
          doctor_name: string
          subscription_plan?: string
          subscription_renews_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          organization_id?: string
          clinic_name?: string
          doctor_name?: string
          subscription_plan?: string
          subscription_renews_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

