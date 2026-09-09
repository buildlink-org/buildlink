// Shared types for post creation components

export type PostCategory = 'general' | 'project' | 'career' | 'technical' | 'news';

export interface PostDraft {
  id?: string;
  user_id: string;
  content: string;
  category: PostCategory;
  image_url?: string | null;
  document_url?: string | null;
  document_name?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  location_name?: string | null;
  saved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PostAttachment {
  file: File;
  previewUrl: string | null;
  type: 'image' | 'pdf';
  name: string;
  size: number;
}

export interface PostLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface CreatePostPayload {
  content: string;
  category: PostCategory;
  image_url?: string;
  document_url?: string;
  document_name?: string;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  user_id: string;
}

export const POST_CATEGORIES: { value: PostCategory; label: string; description: string }[] = [
  { value: 'general', label: 'Express Yourself', description: 'Share & discuss industry insights & experiences' },
  { value: 'project', label: 'Showcase Project', description: 'Display & highlight your latest and past work' },
  { value: 'career', label: 'Post Opportunity', description: 'Advertise jobs, gigs & opportunities' },
  { value: 'technical', label: 'Technical', description: 'Share technical tips, tutorials & how-tos' },
  { value: 'news', label: 'News & Updates', description: 'Share industry news, updates & announcements' },
];