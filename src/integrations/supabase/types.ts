export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_features: {
        Row: {
          created_at: string | null
          description: string | null
          feature_name: string
          id: string
          is_premium: boolean | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_premium?: boolean | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_premium?: boolean | null
          user_type?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          connected_user_id: string
          created_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_connected_user_id_fkey"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      mentor_expertise: {
        Row: {
          created_at: string | null
          id: string
          mentor_id: string
          skill: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentor_id: string
          skill: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mentor_id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_expertise_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          availability: string[] | null
          bio: string
          created_at: string | null
          hourly_rate: number | null
          id: string
          rating: number | null
          reviews_count: number | null
          updated_at: string | null
          user_id: string
          years_of_experience: number
        }
        Insert: {
          availability?: string[] | null
          bio: string
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          user_id: string
          years_of_experience?: number
        }
        Update: {
          availability?: string[] | null
          bio?: string
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          user_id?: string
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          mentor_id: string
          rating: number
          reviewer_id: string
          session_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          mentor_id: string
          rating: number
          reviewer_id: string
          session_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          mentor_id?: string
          rating?: number
          reviewer_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_reviews_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_requests: {
        Row: {
          created_at: string | null
          duration: string
          id: string
          mentee_id: string
          mentor_id: string
          message: string
          status: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration: string
          id?: string
          mentee_id: string
          mentor_id: string
          message: string
          status?: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string
          status?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          mentee_id: string
          mentor_id: string
          notes: string | null
          request_id: string
          start_time: string
          status: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          mentee_id: string
          mentor_id: string
          notes?: string | null
          request_id: string
          start_time: string
          status?: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          request_id?: string
          start_time?: string
          status?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "mentorship_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          from_user_id: string | null
          id: string
          link: string | null
          priority: string | null
          read: boolean | null
          type: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          link?: string | null
          priority?: string | null
          read?: boolean | null
          type: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          link?: string | null
          priority?: string | null
          read?: boolean | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_images: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string | null
          document_name: string | null
          document_url: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          location: string | null
          reposts_count: number | null
          shares_count: number | null
          updated_at: string | null
          visibility: string
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          document_name?: string | null
          document_url?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          location?: string | null
          reposts_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
          visibility?: string
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          document_name?: string | null
          document_url?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          location?: string | null
          reposts_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          id: string
          post_id: string
          user_id: string
          platform: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          platform?: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          platform?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_access_logs: {
        Row: {
          access_type: string
          accessed_profile_id: string
          accessor_user_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_profile_id: string
          accessor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_profile_id?: string
          accessor_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profile_privacy_settings: {
        Row: {
          created_at: string | null
          id: string
          show_education: boolean | null
          show_email: boolean | null
          show_experience: boolean | null
          show_phone: boolean | null
          show_skills: boolean | null
          show_social_links: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_education?: boolean | null
          show_email?: boolean | null
          show_experience?: boolean | null
          show_phone?: boolean | null
          show_skills?: boolean | null
          show_social_links?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          show_education?: boolean | null
          show_email?: boolean | null
          show_experience?: boolean | null
          show_phone?: boolean | null
          show_skills?: boolean | null
          show_social_links?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string | null
          id: string
          viewed_profile_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          viewed_profile_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          viewed_profile_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_tier: string | null
          avatar: string | null
          average_rating: number | null
          banner: string | null
          bio: string | null
          certifications: Json | null
          created_at: string | null
          education: Json | null
          education_level: string | null
          experiences: Json | null
          full_name: string
          id: string
          interests: string[] | null
          languages: Json | null
          organization: string | null
          portfolio: Json | null
          premium_features: Json | null
          profession: string | null
          profile_completion_score: number | null
          profile_visibility: string | null
          skills: string[] | null
          social_links: Json | null
          title: string | null
          total_ratings: number | null
          updated_at: string | null
          user_type: string
          verification_badges: Json | null
          verification_level: string | null
        }
        Insert: {
          account_tier?: string | null
          avatar?: string | null
          average_rating?: number | null
          banner?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          education_level?: string | null
          experiences?: Json | null
          full_name: string
          id: string
          interests?: string[] | null
          languages?: Json | null
          organization?: string | null
          portfolio?: Json | null
          premium_features?: Json | null
          profession?: string | null
          profile_completion_score?: number | null
          profile_visibility?: string | null
          skills?: string[] | null
          social_links?: Json | null
          title?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          user_type: string
          verification_badges?: Json | null
          verification_level?: string | null
        }
        Update: {
          account_tier?: string | null
          avatar?: string | null
          average_rating?: number | null
          banner?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          education?: Json | null
          education_level?: string | null
          experiences?: Json | null
          full_name?: string
          id?: string
          interests?: string[] | null
          languages?: Json | null
          organization?: string | null
          portfolio?: Json | null
          premium_features?: Json | null
          profession?: string | null
          profile_completion_score?: number | null
          profile_visibility?: string | null
          skills?: string[] | null
          social_links?: Json | null
          title?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          user_type?: string
          verification_badges?: Json | null
          verification_level?: string | null
        }
        Relationships: []
      }
      reposts: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reposts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          rating: number
          resource_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          rating: number
          resource_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_reviews_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "skill_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_resources: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          difficulty_level: string | null
          duration: string | null
          id: string
          learning_outcomes: string[] | null
          link: string
          prerequisites: string[] | null
          price: number | null
          provider: string
          rating: number | null
          reviews_count: number | null
          syllabus: Json | null
          thumbnail: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          difficulty_level?: string | null
          duration?: string | null
          id?: string
          learning_outcomes?: string[] | null
          link: string
          prerequisites?: string[] | null
          price?: number | null
          provider: string
          rating?: number | null
          reviews_count?: number | null
          syllabus?: Json | null
          thumbnail: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          difficulty_level?: string | null
          duration?: string | null
          id?: string
          learning_outcomes?: string[] | null
          link?: string
          prerequisites?: string[] | null
          price?: number | null
          provider?: string
          rating?: number | null
          reviews_count?: number | null
          syllabus?: Json | null
          thumbnail?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          awarded_by: string | null
          badge_icon: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          awarded_by?: string | null
          badge_icon?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          awarded_by?: string | null
          badge_icon?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          progress_percentage: number | null
          resource_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress_percentage?: number | null
          resource_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          progress_percentage?: number | null
          resource_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "skill_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_notification_for_user: {
        Args: { input_user_id: string }
        Returns: {
          id: string
          type: string
          category: string
          priority: string
          content: string
          read: boolean
          created_at: string
          from_user_id: string
          link: string
          full_name: string
          avatar: string
        }[]
      }
      create_notification: {
        Args: {
          p_content: string
          p_from_user_id?: string
          p_link?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_connected_profile_info: {
        Args: { user_id_param: string }
        Returns: {
          avatar: string
          bio: string
          created_at: string
          full_name: string
          id: string
          organization: string
          profession: string
          skills: string[]
          title: string
          user_type: string
        }[]
      }
      get_filtered_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar: string
          bio: string
          created_at: string
          education: Json
          experiences: Json
          full_name: string
          id: string
          organization: string
          profession: string
          skills: string[]
          social_links: Json
          title: string
          user_type: string
        }[]
      }
      get_limited_profile_info: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      get_post_author_info: {
        Args: { author_id_param: string }
        Returns: {
          avatar: string
          full_name: string
          id: string
          user_type: string
        }[]
      }
      get_post_interaction_counts: {
        Args: { post_id_param: string }
        Returns: {
          bookmarks_count: number
          likes_count: number
          reposts_count: number
        }[]
      }
      get_public_profile_info: {
        Args: { user_id_param: string }
        Returns: {
          avatar: string
          created_at: string
          full_name: string
          id: string
          organization: string
          profession: string
          title: string
          user_type: string
        }[]
      }
      get_user_post_interactions: {
        Args: { post_id_param: string }
        Returns: {
          has_bookmarked: boolean
          has_liked: boolean
          has_reposted: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id_param?: string }
        Returns: boolean
      }
      is_connected_user: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      search_connected_profiles: {
        Args: { search_term: string }
        Returns: {
          avatar: string
          full_name: string
          id: string
          profession: string
          title: string
          user_type: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
