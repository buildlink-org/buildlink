
import React, { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop } from "lucide-react";
import { getCroppedImg } from "./getCroppedImg";

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onCropSave: (croppedFile: File) => void;
  loading?: boolean;
}

const ASPECT_RATIO = 1; // square for avatar

const AvatarCropDialog = ({
  open,
  imageSrc,
  onCancel,
  onCropSave,
  loading = false,
}: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = (_: any, cropped: any) => {
    setCroppedAreaPixels(cropped);
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(
      imageSrc,
      crop,
      zoom,
      ASPECT_RATIO,
      croppedAreaPixels
    );
    if (croppedBlob) {
      const croppedFile = new File(
        [croppedBlob],
        `avatar-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );
      onCropSave(croppedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent
        className="sm:max-w-[400px]"
        description="Adjust the crop and zoom of your profile photo, then save and upload">
        <DialogHeader>
          <DialogTitle>Crop Profile Photo</DialogTitle>
        </DialogHeader>
        {imageSrc && (
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-full h-60 bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT_RATIO}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="w-full flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Zoom:</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 w-full">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCropSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Crop className="h-4 w-4" />
                )}
                {loading ? "Uploading..." : "Save & Upload"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropDialog;
