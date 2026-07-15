import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import ProfileFormFields from "./profile-sections/ProfileFormFields";

interface ProfileEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ProfileEditForm = ({ isOpen, onClose, onSave }: ProfileEditFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    profession: '',
    organization: '',
    title: '',
    education_level: '',
    avatar: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await profileService.getProfile(user.id);
      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          profession: data.profession || '',
          organization: data.organization || '',
          title: data.title || '',
          education_level: data.education_level || '',
          avatar: data.avatar || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await profileService.updateProfile(user.id, profile);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Profile updated successfully!'
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-md"
          description="Update your profile details including name, profession, organization, and title">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Form Fields */}
            <ProfileFormFields
              profile={profile}
              onChange={handleInputChange}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileEditForm;
