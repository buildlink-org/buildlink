import { supabase } from '@/integrations/supabase/client';

/**
 * Validates an image file for type and size.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are supported (JPEG, PNG, WebP, etc.).' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Images must be less than 10MB.' };
  }
  return { valid: true };
}

/**
 * Validates a PDF file for type and size.
 */
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return { valid: false, error: 'Only PDF documents are supported.' };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { valid: false, error: 'PDF documents must be less than 20MB.' };
  }
  return { valid: true };
}

/**
 * Uploads a file to Supabase storage and returns the public URL.
 */
export async function uploadFile(
  file: File,
  bucket: string = 'post-media',
  pathPrefix: string = 'uploads'
): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) return { url: null, error: uploadError };

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { url: publicUrl.publicUrl, error: null };
  } catch (error) {
    return { url: null, error };
  }
}

/**
 * Cleans up an uploaded file from Supabase storage.
 */
export async function deleteUploadedFile(
  url: string,
  bucket: string = 'post-media'
): Promise<void> {
  try {
    // Extract file path from public URL
    const path = url.split(`/storage/v1/object/public/${bucket}/`)?.[1];
    if (path) {
      await supabase.storage.from(bucket).remove([path]);
    }
  } catch {
    // Silently ignore cleanup errors
  }
}

/**
 * Revokes an object URL safely.
 */
export function revokeObjectUrl(url: string | null): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Gets a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}