import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { MediaItem } from "./MediaTypes";

interface MediaLayoutEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MediaItem[];
  onSave: (items: MediaItem[]) => void;
}

export const MediaLayoutEditor: React.FC<MediaLayoutEditorProps> = ({
  open,
  onOpenChange,
  items,
  onSave,
}) => {
  const [localItems, setLocalItems] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync state whenever dialog opens with latest items
  useEffect(() => {
    if (open) {
      // Ensure at least item 0 has isCover if there are items and none is selected
      const initial = items.map((it, idx) => ({
        ...it,
        isCover: it.isCover ?? idx === 0,
      }));
      setLocalItems(initial);
      setCurrentIndex(0);
    }
  }, [open, items]);

  if (localItems.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(0, currentIndex), localItems.length - 1);
  const currentItem = localItems[safeIndex];

  const handleNext = () => {
    if (safeIndex < localItems.length - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  const handleCaptionChange = (val: string) => {
    const updated = [...localItems];
    updated[safeIndex] = {
      ...updated[safeIndex],
      caption: val.slice(0, 300),
    };
    setLocalItems(updated);
  };

  const handleSetCover = () => {
    const updated = localItems.map((item, idx) => ({
      ...item,
      isCover: idx === safeIndex,
    }));
    // Reorder so that the cover item moves to index 0 per standard thumbnail mechanics
    const selected = updated[safeIndex];
    updated.splice(safeIndex, 1);
    updated.unshift(selected);
    setLocalItems(updated);
    setCurrentIndex(0);
  };

  const handleMoveItem = (direction: "left" | "right") => {
    const targetIdx = direction === "left" ? safeIndex - 1 : safeIndex + 1;
    if (targetIdx < 0 || targetIdx >= localItems.length) return;

    const updated = [...localItems];
    const temp = updated[safeIndex];
    updated[safeIndex] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Preserve cover status: ensure the cover item retains its flag
    setLocalItems(updated);
    setCurrentIndex(targetIdx);
  };

  const handleRemoveCurrent = () => {
    const updated = localItems.filter((_, idx) => idx !== safeIndex);
    if (updated.length > 0) {
      // If we removed the cover, set the new first item as cover
      if (currentItem.isCover && !updated.some((it) => it.isCover)) {
        updated[0].isCover = true;
      }
      setLocalItems(updated);
      setCurrentIndex(Math.min(safeIndex, updated.length - 1));
    } else {
      setLocalItems([]);
      onSave([]);
      onOpenChange(false);
    }
  };

  const handleSave = () => {
    onSave(localItems);
    onOpenChange(false);
  };

  const isCurrentCover = Boolean(currentItem?.isCover || safeIndex === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-[95vw] max-h-[92vh] overflow-y-auto p-4 sm:p-6"
        description="Layout editor for project uploads"
      >
        <DialogHeader className="pb-2 border-b pr-8 sm:pr-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold">
                Media Layout Editor
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Organize images, select a cover thumbnail, and add per-item descriptions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Main Carousel Viewer */}
          <div className="relative rounded-lg border bg-slate-950/5 flex flex-col items-center justify-center overflow-hidden min-h-[220px] sm:min-h-[260px] max-h-[300px] sm:max-h-[380px]">
            {currentItem?.type === "image" ? (
              <img
                src={currentItem.previewUrl}
                alt={`Media item ${safeIndex + 1}`}
                className="max-h-[340px] w-auto max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-16 w-16 text-red-500 mb-2" />
                <p className="font-medium text-sm text-foreground max-w-xs truncate">
                  {currentItem?.name || "PDF Document"}
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  PDF Document
                </Badge>
              </div>
            )}

            {/* Navigation Arrows */}
            {localItems.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow bg-background/80 hover:bg-background"
                  disabled={safeIndex === 0}
                  onClick={handlePrev}
                  aria-label="Previous item"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow bg-background/80 hover:bg-background"
                  disabled={safeIndex === localItems.length - 1}
                  onClick={handleNext}
                  aria-label="Next item"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[11px] font-mono shadow-sm bg-background/90">
                {safeIndex + 1} / {localItems.length}
              </Badge>
              {isCurrentCover && (
                <Badge className="bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                  Cover Thumbnail
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border rounded-md p-2 bg-muted/30">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant={isCurrentCover ? "default" : "outline"}
                size="sm"
                onClick={handleSetCover}
                className="h-8 text-xs gap-1.5"
                aria-label="Select Thumbnail"
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    isCurrentCover ? "fill-current text-yellow-300" : "text-muted-foreground"
                  }`}
                />
                {isCurrentCover ? "Cover Selected" : "Select Thumbnail"}
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Arrange:</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safeIndex === 0}
                onClick={() => handleMoveItem("left")}
                aria-label="Move left"
                title="Move left"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safeIndex === localItems.length - 1}
                onClick={() => handleMoveItem("right")}
                aria-label="Move right"
                title="Move right"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-1"
                onClick={handleRemoveCurrent}
                aria-label="Remove item"
                title="Remove item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Filmstrip thumbnails */}
          {localItems.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {localItems.map((item, idx) => {
                const isActive = idx === safeIndex;
                const isCover = Boolean(item.isCover || idx === 0);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative shrink-0 h-14 w-14 rounded-md border overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                      isActive ? "ring-2 ring-primary border-transparent" : "opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`View item ${idx + 1}`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.previewUrl}
                        alt={`Thumb ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-red-500" />
                      </div>
                    )}
                    {isCover && (
                      <span className="absolute top-0.5 left-0.5 bg-primary text-[8px] text-white px-1 rounded font-bold">
                        ★
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Per-Item Description Input (Max 300 characters per Dev Journal Page 6) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="item-caption"
                className="text-xs font-medium text-foreground"
              >
                Item Description (optional)
              </label>
              <span
                className={`text-[11px] font-mono ${
                  (currentItem?.caption || "").length > 280
                    ? "text-amber-600 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {(currentItem?.caption || "").length} / 300 characters
              </span>
            </div>
            <Textarea
              id="item-caption"
              rows={2}
              maxLength={300}
              placeholder="Add thoughts or details about this item (max 300 characters)..."
              value={currentItem?.caption || ""}
              onChange={(e) => handleCaptionChange(e.target.value)}
              className="resize-none text-xs"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default MediaLayoutEditor;
