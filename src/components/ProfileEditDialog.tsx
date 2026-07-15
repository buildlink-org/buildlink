import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditDialogProps {
  children: React.ReactNode;
  currentProfile?: any;
  onProfileUpdated?: () => void;
}

const ProfileEditDialog = ({ children, currentProfile, onProfileUpdated }: ProfileEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentProfile?.full_name || '',
    profession: currentProfile?.profession || '',
    organization: currentProfile?.organization || '',
    title: currentProfile?.title || '',
    education_level: currentProfile?.education_level || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await profileService.updateProfile(user.id, formData);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully!'
      });

      setOpen(false);
      onProfileUpdated?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent
        className="sm:max-w-[500px]"
        description="Update your name, profession, job title, organization, and education level">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              placeholder="e.g., Civil Engineer, Architect"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Senior Engineer, Project Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              placeholder="Your company or organization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education_level">Education Level</Label>
            <Select
              value={formData.education_level}
              onValueChange={(value) => handleInputChange('education_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
