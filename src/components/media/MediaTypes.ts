export interface MediaItem {
  id: string;
  file?: File;
  previewUrl: string;
  type: 'image' | 'pdf';
  name?: string;
  size?: number;
  caption?: string; // Optional per-item text input, max 300 characters
  isCover?: boolean; // thumbnail selection
}

export interface MediaUploaderProps {
  mediaItems: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  allowPdf?: boolean;
  isProject?: boolean;
  onOpenLayoutEditor?: () => void;
  disabled?: boolean;
  className?: string;
  maxImages?: number;
}
