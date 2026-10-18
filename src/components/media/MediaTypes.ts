export interface MediaItem {
  id: string;
  file?: File;
  previewUrl: string;
  type: 'image' | 'pdf';
  name?: string;
  size?: number;
  caption?: string; // Optional per-item text input, max 300 characters
  isCover?: boolean; // thumbnail selection
  previewPageUrl?: string;
  thumbnailPreviewUrl?: string;
  thumbnailFile?: File;
  thumbnailPage?: number;
  pageCount?: number;
}

export const getPostImageFiles = (mediaItems: MediaItem[]): File[] => {
  const pdfItem = mediaItems.find((item) => item.type === "pdf");
  const imageItems = mediaItems
    .filter((item) => item.type === "image" && item.file)
    .sort((a, b) => Number(Boolean(b.isCover)) - Number(Boolean(a.isCover)));
  const imageFiles = imageItems.map((item) => item.file as File);
  const pdfThumbnail = pdfItem?.thumbnailFile;

  if (!pdfThumbnail) return imageFiles;
  return pdfItem.isCover
    ? [pdfThumbnail, ...imageFiles]
    : [...imageFiles, pdfThumbnail];
};

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
