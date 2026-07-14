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
import { Camera, FileText, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { postsService } from "@/services/postsService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MediaPreview from "@/components/ui/media-preview";
import { Post } from "@/types/database";

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated?: () => void;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    post?.image_url || null
  );
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [removeExistingDocument, setRemoveExistingDocument] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveExistingImage(false);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PDF
      const fileType = file.type;
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileType !== "application/pdf" && fileExtension !== "pdf") {
        toast({
          title: "Invalid File Type",
          description: "Only PDF documents are supported for upload.",
          variant: "destructive",
        });
        e.target.value = ""; // Clear the input
        return;
      }

      setDocumentFile(file);
      setDocumentPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
    };
  }, [documentPreviewUrl]);

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleRemoveDocument = () => {
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
      let image_url = post.image_url;

      // Handle image upload
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `user-${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("post-media")
          .getPublicUrl(filePath);
        image_url = publicUrlData?.publicUrl;
      } else if (removeExistingImage) {
        image_url = null;
      }

      let document_url = post.document_url;

      // Handle document upload
      if (documentFile) {
        const filePath = `user-${user.id}/${Date.now()}_${documentFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(filePath, documentFile, { upsert: false });

        if (uploadError) {
          console.error("Document upload error:", uploadError);
          toast({
            title: "Upload Failed",
            description: "Could not upload document. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("post-media")
          .getPublicUrl(filePath);
        
        if (!publicUrlData?.publicUrl) {
          toast({
            title: "Document URL Error",
            description: "Could not get document URL. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        document_url = publicUrlData.publicUrl;
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

      // Close dialog first
      onOpenChange(false);

      // Then trigger parent update after a brief delay
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
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset form state on close
          setContent(post?.content || "");
          setImageFile(null);
          setDocumentFile(null);
          setDocumentPreviewUrl(null);
          setImagePreview(post?.image_url || null);
          setRemoveExistingImage(false);
          setRemoveExistingDocument(false);
        }
        onOpenChange(isOpen);
      }}>
      <DialogContent
        className="sm:max-w-[600px]"
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

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full max-w-xs">
              <img
                src={imagePreview}
                className="w-full h-40 rounded-md object-cover border"
                alt="Preview"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                onClick={handleRemoveImage}>
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* File Upload Options */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-600"
              onClick={() => imageInputRef.current?.click()}>
              <Camera className="h-4 w-4 mr-2" />
              {imagePreview ? "Change Image" : "Add Image"}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-600"
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

          {/* PDF Preview - Show for both new files and existing PDFs */}
          {(documentFile ||
            (post?.document_url && !removeExistingDocument)) && (
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
