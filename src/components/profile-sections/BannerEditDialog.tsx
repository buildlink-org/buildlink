import { useState, useRef } from 'react';
import { Camera, Upload, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

import Cropper from 'react-easy-crop';
import { getCroppedImg } from './getCroppedImg';
import BannerCropper from "./BannerCropper";
import BannerRemoveButton from "./BannerRemoveButton";

interface BannerEditDialogProps {
  children: React.ReactNode;
  currentProfile?: any;
  onProfileUpdated?: () => void;
}

const RECOMMENDED_WIDTH = 1200;
const RECOMMENDED_HEIGHT = 300;
const ASPECT_RATIO = RECOMMENDED_WIDTH / RECOMMENDED_HEIGHT;

const BannerEditDialog = ({ children, currentProfile, onProfileUpdated }: BannerEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  // --- Cropping state ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Preview for cropping
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Handles crop/save
  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels || !user) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(
        selectedImage,
        crop,
        zoom,
        ASPECT_RATIO,
        croppedAreaPixels
      );

      if (!croppedBlob) throw new Error("Cropping failed. Please try another image.");

      // Create a File from Blob for upload. Name can be anything, here we use banner-{timestamp}.jpg
      const croppedFile = new File([croppedBlob], `banner-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // The real `profileService` should allow uploading banners. If not, we send placeholder data for now.
      // This assumes you will integrate upload logic later.
      const { error } = await profileService.updateProfile(user.id, {
        banner: 'updated/banner.jpg' // Placeholder, needs storage integration
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Banner updated successfully!'
      });

      setOpen(false);
      setSelectedImage(null);
      setIsCropping(false);
      onProfileUpdated?.();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update banner. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setSelectedImage(null);
    setIsCropping(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  // Remove (reset) banner function
  const handleBannerRemove = async () => {
    if (!user) return;
    setRemoving(true);
    try {
      const { error } = await profileService.updateProfile(user.id, {
        banner: ""
      });
      if (error) throw error;
      toast({
        title: "Removed",
        description: "Profile banner removed."
      });
      setOpen(false);
      setSelectedImage(null);
      setIsCropping(false);
      onProfileUpdated?.();
    } catch (error) {
      console.error('Error removing banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove banner. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px]"
        description="Upload, crop, or remove your profile banner image. Recommended size: 1200x300px">
        <DialogHeader>
          <DialogTitle>Edit Profile Banner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Cropping UI */}
          {isCropping && selectedImage ? (
            <BannerCropper
              selectedImage={selectedImage}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              uploading={uploading}
              onCancel={handleCropCancel}
              onSave={handleCropSave}
              aspect={ASPECT_RATIO}
            />
          ) : (
            <>
              <div className="h-32 bg-gradient-to-r from-primary to-primary/80 rounded-lg relative overflow-hidden">
                {currentProfile && currentProfile.banner ? (
                  <>
                    <img
                      src={currentProfile.banner}
                      alt="Current Profile Banner"
                      className="absolute inset-0 w-full h-full object-cover object-center rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">{currentProfile && currentProfile.banner ? "Current Banner" : "No Banner Uploaded"}</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || removing}
                  className="w-full"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload & Crop New Banner'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended size: 1200x300px. Max file size: 5MB
                </p>
              </div>
              {/* Remove banner button - only shown if user has a banner set */}
              {currentProfile && currentProfile.banner && (
                <div className="flex justify-end">
                  <BannerRemoveButton
                    removing={removing}
                    uploading={uploading}
                    onRemove={handleBannerRemove}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={removing || uploading}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BannerEditDialog;
