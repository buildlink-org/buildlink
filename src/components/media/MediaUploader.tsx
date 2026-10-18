import React, { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, FileText, X, ArrowLeft, ArrowRight, Star, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  validateUploadFile,
  ALLOWED_MIME,
  MAX_SIZE,
} from "@/lib/uploadUtils";
import { MediaItem, MediaUploaderProps } from "./MediaTypes";
import { PdfPageThumbnailSelector } from "./PdfPageThumbnailSelector";

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaItems,
  onChange,
  allowPdf = true,
  isProject = false,
  onOpenLayoutEditor,
  disabled = false,
  className = "",
  maxImages = 10,
}) => {
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const imagesCount = mediaItems.filter((m) => m.type === "image").length;
  const hasPdf = mediaItems.some((m) => m.type === "pdf");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imagesCount + files.length > maxImages) {
      toast({
        title: "Limit Exceeded",
        description: `You can attach up to ${maxImages} images per post.`,
        variant: "destructive",
      });
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    const newItems: MediaItem[] = [];
    files.forEach((file) => {
      const { valid, error } = validateUploadFile(
        file,
        ALLOWED_MIME.image,
        MAX_SIZE.postImage
      );
      if (!valid && error) {
        toast({
          title: "Invalid File",
          description: error,
          variant: "destructive",
        });
        return;
      }

      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        type: "image",
        name: file.name,
        size: file.size,
        isCover: mediaItems.length === 0 && newItems.length === 0,
      });
    });

    if (newItems.length > 0) {
      const updated = [...mediaItems, ...newItems];
      onChange(updated);
      if (isProject) {
        setTimeout(() => {
          onOpenLayoutEditor?.();
        }, 50);
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { valid, error } = validateUploadFile(
      file,
      ALLOWED_MIME.pdf,
      MAX_SIZE.document
    );
    if (!valid && error) {
      toast({
        title: "Invalid Document",
        description: error,
        variant: "destructive",
      });
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      return;
    }

    // Replace existing PDF or add
    const withoutPdf = mediaItems.filter((m) => {
      if (m.type === "pdf") URL.revokeObjectURL(m.previewUrl);
      return m.type !== "pdf";
    });
    const newPdfItem: MediaItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: "pdf",
      name: file.name,
      size: file.size,
      isCover: !mediaItems.some((item) => item.type === "image" && item.isCover),
    };

    const updated = [...withoutPdf, newPdfItem];
    onChange(updated);

    if (isProject) {
      setTimeout(() => {
        onOpenLayoutEditor?.();
      }, 50);
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handleRemoveItem = (id: string) => {
    const itemToRemove = mediaItems.find((item) => item.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    const updated = mediaItems.filter((item) => item.id !== id);
    // If the removed item was cover, ensure index 0 becomes cover
    if (itemToRemove?.isCover && updated.length > 0) {
      const nextImage = updated.find((it) => it.type === "image");
      if (nextImage) nextImage.isCover = true;
    }
    onChange(updated);
  };

  const handleSelectThumbnail = (index: number) => {
    const selected = imageItems[index];
    if (!selected) return;
    const updated = mediaItems.map((item) => ({
      ...item,
      isCover: item.id === selected.id,
    }));
    onChange(updated);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetImageIdx = direction === "left" ? index - 1 : index + 1;
    if (targetImageIdx < 0 || targetImageIdx >= imageItems.length) return;

    const updated = [...mediaItems];
    const currentIndex = updated.findIndex((item) => item.id === imageItems[index].id);
    const targetIndex = updated.findIndex((item) => item.id === imageItems[targetImageIdx].id);
    [updated[currentIndex], updated[targetIndex]] = [updated[targetIndex], updated[currentIndex]];
    onChange(updated);
  };

  const imageItems = mediaItems.filter((m) => m.type === "image");
  const pdfItem = mediaItems.find((m) => m.type === "pdf");
  const handlePdfPageRendered = useCallback(
    (
      pdfId: string,
      page: number,
      pageCount: number,
      previewPageUrl: string,
      thumbnailFile: File,
    ) => {
      onChange(
        mediaItems.map((item) => {
          if (item.id !== pdfId) return item;
          const shouldSelectDefault = item.thumbnailPage === undefined && page === 1;
          const selectedPage = item.thumbnailPage ?? (shouldSelectDefault ? 1 : undefined);
          const isSelectedPreview = selectedPage === page;
          const hasImageCover = mediaItems.some(
            (candidate) => candidate.type === "image" && candidate.isCover,
          );
          return {
            ...item,
            previewPageUrl,
            pageCount,
            thumbnailPage: selectedPage,
            thumbnailPreviewUrl: isSelectedPreview
              ? previewPageUrl
              : item.thumbnailPreviewUrl,
            thumbnailFile: isSelectedPreview ? thumbnailFile : item.thumbnailFile,
            isCover: shouldSelectDefault && !hasImageCover ? true : item.isCover,
          };
        }),
      );
    },
    [mediaItems, onChange],
  );
  const handleSelectPdfPage = (
    pdfId: string,
    page: number,
    previewUrl: string,
    thumbnailFile: File,
  ) => {
    onChange(
      mediaItems.map((item) => ({
        ...item,
        ...(item.id === pdfId
          ? {
              isCover: true,
              thumbnailPage: page,
              thumbnailPreviewUrl: previewUrl,
              thumbnailFile,
            }
          : { isCover: false }),
      })),
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {imageItems.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">
              Attached Photos ({imageItems.length}/{maxImages})
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Choose an image or PDF page as the post thumbnail</span>
              {isProject && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenLayoutEditor}
                  className="h-6 text-[11px] px-2 gap-1"
                >
                  <LayoutGrid className="h-3 w-3" />
                  Layout Editor
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {imageItems.map((item, idx) => {
              const hasCover = Boolean(pdfItem?.isCover || imageItems.some((image) => image.isCover));
              const isCover = Boolean(item.isCover || (!hasCover && idx === 0));
              return (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-lg border overflow-hidden bg-slate-100 ${
                    isCover ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name || `Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {isCover && (
                    <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10 flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-current" /> Cover
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex flex-col justify-between p-1">
                    <div className="flex items-center justify-between">
                      {!isCover ? (
                        <button
                          type="button"
                          onClick={() => handleSelectThumbnail(idx)}
                          className="bg-white/90 hover:bg-white text-yellow-600 p-1 rounded-full text-xs shadow"
                          title="Select Thumbnail"
                          aria-label="Select Thumbnail"
                        >
                          <Star className="h-3 w-3 fill-yellow-500" />
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-auto bg-white/90 hover:bg-white text-destructive p-1 rounded-full shadow"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "left")}
                        className="bg-white/90 hover:bg-white disabled:opacity-30 p-1 rounded-full text-gray-700 shadow"
                        title="Move left"
                        aria-label="Move left"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === imageItems.length - 1}
                        onClick={() => handleMove(idx, "right")}
                        className="bg-white/90 hover:bg-white disabled:opacity-30 p-1 rounded-full text-gray-700 shadow"
                        title="Move right"
                        aria-label="Move right"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pdfItem && (
        <div className="border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="h-9 w-9 rounded bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            {pdfItem.previewPageUrl && (
              <img
                src={pdfItem.previewPageUrl}
                alt={`Current page preview of ${pdfItem.name || "PDF"}`}
                className="h-12 w-10 rounded border bg-white object-contain"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                {pdfItem.name || "Attachment Document.pdf"}
              </p>
              <Badge variant="outline" className="text-[10px] mt-0.5 px-1 py-0 h-4">
                PDF Document
              </Badge>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveItem(pdfItem.id)}
            className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
            aria-label="Remove PDF"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Remove
          </Button>
        </div>
      )}
      {pdfItem?.file && (
        <PdfPageThumbnailSelector
          key={pdfItem.id}
          file={pdfItem.file}
          selectedPage={pdfItem.thumbnailPage}
          onPageRendered={(page, pageCount, previewUrl, thumbnailFile) =>
            handlePdfPageRendered(
              pdfItem.id,
              page,
              pageCount,
              previewUrl,
              thumbnailFile,
            )
          }
          onSelectPage={(page, previewUrl, thumbnailFile) =>
            handleSelectPdfPage(pdfItem.id, page, previewUrl, thumbnailFile)
          }
        />
      )}

      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || imagesCount >= maxImages}
          onClick={() => imageInputRef.current?.click()}
          className="text-xs h-8 gap-1.5"
          aria-label="Add Images"
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Add Images</span>
        </Button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageChange}
        />

        {allowPdf && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || hasPdf}
              onClick={() => pdfInputRef.current?.click()}
              className="text-xs h-8 gap-1.5"
              aria-label="Add PDF"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Add PDF</span>
            </Button>

            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handlePdfChange}
            />
          </>
        )}
      </div>
    </div>
  );
};
export default MediaUploader;
