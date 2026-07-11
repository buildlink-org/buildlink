
export interface User {
  id: string;
  email: string;
  full_name: string;
  account_type: 'Student' | 'Graduate' | 'Professional' | 'Company';
  profession: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  company?: string;
  experience_years?: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  document_url?: string;
  document_name?: string;
  location?: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  profiles?: {
    id: string;
    full_name: string;
    avatar?: string;
    profession?: string;
    user_type?: string;
    title?: string;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Mentor {
  id: string;
  user_id: string;
  specializations: string[];
  hourly_rate?: number;
  availability: string;
  description: string;
  rating: number;
  total_sessions: number;
  is_active: boolean;
  created_at: string;
  user?: User;
}

export interface MentorshipSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  price: number;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  instructor?: User;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  progress: number;
  completed_at?: string;
  created_at: string;
}
