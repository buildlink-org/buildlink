import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, FileText, X, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { postsService } from "@/services/postsService";
import { useToast } from "@/hooks/use-toast";
import MediaPreview from "@/components/ui/media-preview";
import { Post } from "@/types/database";
import {
  uploadPostImage,
  uploadPostDocument,
  parsePostImages,
  validateUploadFile,
  ALLOWED_MIME,
  MAX_SIZE,
} from "@/lib/uploadUtils";

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated?: () => void;
}

interface ImageEntry {
  id: string;
  url?: string;
  file?: File;
  previewUrl: string;
}

const EditPostDialog = ({
  post,
  open,
  onOpenChange,
  onPostUpdated,
}: EditPostDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(post?.content || "");
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [removeExistingDocument, setRemoveExistingDocument] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Sync post state when dialog opens or post prop updates
  useEffect(() => {
    if (open && post) {
      setContent(post.content || "");
      const existingUrls = parsePostImages(post.image_url);
      setImageEntries(
        existingUrls.map((url, idx) => ({
          id: `existing-${idx}-${url}`,
          url,
          previewUrl: url,
        }))
      );
      setDocumentFile(null);
      setDocumentPreviewUrl(null);
      setRemoveExistingDocument(false);
    }
  }, [open, post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imageEntries.length + files.length > 10) {
      toast({
        title: "Limit Exceeded",
        description: "You can attach up to 10 images per post.",
        variant: "destructive",
      });
      return;
    }

    const newEntries: ImageEntry[] = [];
    files.forEach((file) => {
      const { valid, error } = validateUploadFile(file, ALLOWED_MIME.image, MAX_SIZE.postImage);
      if (!valid && error) {
        toast({
          title: "Invalid File",
          description: error,
          variant: "destructive",
        });
        return;
      }
      newEntries.push({
        id: `new-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (newEntries.length > 0) {
      setImageEntries((prev) => [...prev, ...newEntries]);
    }

    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImageEntries((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove && itemToRemove.file) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    setImageEntries((prev) => {
      const newArr = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;
      return newArr;
    });
  };

  const makeCoverImage = (index: number) => {
    if (index === 0) return;
    setImageEntries((prev) => {
      const newArr = [...prev];
      const [selected] = newArr.splice(index, 1);
      newArr.unshift(selected);
      return newArr;
    });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { valid, error } = validateUploadFile(file, ALLOWED_MIME.pdf, MAX_SIZE.document);
      if (!valid && error) {
        toast({
          title: "Invalid Document",
          description: error,
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }

      if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
      setDocumentFile(file);
      setDocumentPreviewUrl(URL.createObjectURL(file));
      setRemoveExistingDocument(false);
    }
  };

  const handleRemoveDocument = () => {
    if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
    setDocumentFile(null);
    setDocumentPreviewUrl(null);
    setRemoveExistingDocument(true);
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsLoading(true);
    try {
      // Process images (upload new ones, retain existing ones in order)
      const finalImageUrls: string[] = [];

      for (const entry of imageEntries) {
        if (entry.url) {
          finalImageUrls.push(entry.url);
        } else if (entry.file) {
          const { url, error: uploadError } = await uploadPostImage(entry.file, user.id);
          if (uploadError || !url) {
            toast({
              title: "Image Upload Failed",
              description: uploadError ?? `Could not upload ${entry.file.name}.`,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          finalImageUrls.push(url);
        }
      }

      let image_url: string | null = null;
      if (finalImageUrls.length === 1) {
        image_url = finalImageUrls[0];
      } else if (finalImageUrls.length > 1) {
        image_url = JSON.stringify(finalImageUrls);
      }

      let document_url: string | null = post.document_url || null;
      if (documentFile) {
        const { url, error: uploadError } = await uploadPostDocument(documentFile, user.id);
        if (uploadError || !url) {
          toast({
            title: "Document Upload Failed",
            description: uploadError ?? "Could not upload document.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        document_url = url;
      } else if (removeExistingDocument) {
        document_url = null;
      }

      const { error } = await postsService.updatePost(post.id, {
        content,
        image_url,
        document_url,
        document_name:
          documentFile?.name ||
          (removeExistingDocument ? null : post.document_name),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your post has been updated successfully!",
      });

      onOpenChange(false);
      setTimeout(() => {
        onPostUpdated?.();
      }, 200);
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        description="Edit your post content, image, or PDF attachment">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, insights, or questions..."
              rows={4}
              required
            />
          </div>

          {/* Image Previews & Arrangement */}
          {imageEntries.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Images ({imageEntries.length}/10)
                </Label>
                <span className="text-xs text-muted-foreground">First image is cover thumbnail</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {imageEntries.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`group relative h-28 rounded-lg border overflow-hidden bg-slate-100 ${
                      idx === 0 ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Post image ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Cover Badge */}
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        Cover
                      </span>
                    )}

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                      <div className="flex items-center justify-between">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => makeCoverImage(idx)}
                            className="bg-white/90 hover:bg-white text-yellow-600 p-1 rounded-full text-xs"
                            title="Set as Cover"
                          >
                            <Star className="h-3 w-3 fill-yellow-500" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item.id)}
                          className="ml-auto bg-white/90 hover:bg-white text-destructive p-1 rounded-full"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, "left")}
                          className="bg-white/90 hover:bg-white disabled:opacity-30 p-1 rounded-full text-gray-700"
                          title="Move left"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === imageEntries.length - 1}
                          onClick={() => moveImage(idx, "right")}
                          className="bg-white/90 hover:bg-white disabled:opacity-30 p-1 rounded-full text-gray-700"
                          title="Move right"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Options */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-600"
              disabled={imageEntries.length >= 10}
              onClick={() => imageInputRef.current?.click()}>
              <Camera className="h-4 w-4 mr-2" />
              {imageEntries.length > 0 ? "Add More Photos" : "Add Images"}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-600"
              disabled={Boolean(documentFile || (post?.document_url && !removeExistingDocument))}
              onClick={() => documentInputRef.current?.click()}>
              <FileText className="h-4 w-4 mr-2" />
              Add PDF
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleDocumentChange}
              />
            </Button>
          </div>

          {/* PDF Preview */}
          {(documentFile || (post?.document_url && !removeExistingDocument)) && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">PDF Document</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={handleRemoveDocument}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <MediaPreview
                url={
                  documentFile
                    ? (documentPreviewUrl as string)
                    : (post.document_url as string)
                }
                type="pdf"
                name={
                  documentFile
                    ? documentFile.name
                    : post.document_name || `Document-${post.id.slice(0, 8)}`
                }
                size="lg"
                showActions
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
