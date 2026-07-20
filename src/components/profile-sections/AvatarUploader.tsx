import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import AvatarCropDialog from "./AvatarCropDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AvatarUploaderProps {
  avatarUrl: string;
  fullName: string;
  uploading: boolean;
  onAvatarChange: (file: File) => Promise<void>;
  onAvatarRemove?: () => Promise<void>;
  userType?: "student" | "professional" | "company" | string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatarUrl,
  fullName,
  uploading,
  onAvatarChange,
  onAvatarRemove,
  userType,
}) => {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Task 5 — popup preview state
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async (croppedFile: File) => {
    await onAvatarChange(croppedFile);
    setCropDialogOpen(false);
    setSelectedImage(null);
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setSelectedImage(null);
  };

  const handleRemovePhoto = async () => {
    if (onAvatarRemove) {
      await onAvatarRemove();
    }
  };

  // Fallback background colours — semantic Tailwind tokens aligned with design system
  const getFallbackClass = () => {
    const type = userType?.toLowerCase();
    if (type === "student")      return "bg-yellow-100 text-foreground dark:bg-yellow-950";
    if (type === "professional") return "bg-orange-100 text-foreground dark:bg-orange-950";
    if (type === "company")      return "bg-green-100  text-foreground dark:bg-green-950";
    return "bg-muted text-foreground";
  };

  return (
    <div className="flex flex-col justify-start space-y-2">
      <div className="relative">
        {/* Task 5 — clicking the avatar opens a full-view popup if an image is already uploaded */}
        <Avatar
          className={`h-20 w-20 ${avatarUrl ? "cursor-pointer ring-2 ring-transparent hover:ring-primary/40 transition-all" : ""}`}
          onClick={() => avatarUrl && setPreviewOpen(true)}
        >
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className={!avatarUrl ? getFallbackClass() : ""}>
            {fullName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <label className="absolute bottom-0 left-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90" htmlFor="avatar-upload-input">
          <Camera className="h-3 w-3" />
          <input
            id="avatar-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
            aria-label="Upload profile photo"
          />
        </label>

        {/* Remove Photo button */}
        {avatarUrl && onAvatarRemove && (
          <button
            type="button"
            className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition translate-x-1/2 -translate-y-1/2"
            onClick={handleRemovePhoto}
            disabled={uploading}
            aria-label="Remove profile photo"
            title="Remove profile photo"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}

      <AvatarCropDialog
        open={cropDialogOpen}
        imageSrc={selectedImage}
        onCancel={handleCropCancel}
        onCropSave={handleCropSave}
        loading={uploading}
      />

      {/* Task 5 — full-size avatar preview dialog */}
      {avatarUrl && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent
            className="flex items-center justify-center bg-transparent border-0 shadow-none max-w-sm p-2"
            description="Full-size preview of your profile photo">
            <img
              src={avatarUrl}
              alt={fullName}
              className="rounded-full w-72 h-72 object-cover shadow-xl ring-4 ring-background"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AvatarUploader;