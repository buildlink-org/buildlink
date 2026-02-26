import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

interface AboutEditDialogProps {
  children: React.ReactNode;
  currentProfile?: any;
  onProfileUpdated?: () => void;
}

const AboutEditDialog = ({ children, currentProfile, onProfileUpdated }: AboutEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bio, setBio] = useState<string>(currentProfile?.bio || '');
  const maxLength = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (bio.trim().length === 0) {
      toast({
        title: 'Error',
        description: 'About section cannot be empty.',
        variant: 'destructive'
      });
      return;
    }

    if (bio.length > maxLength) {
      toast({
        title: 'Error',
        description: `About section must be ${maxLength} characters or less.`,
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await profileService.updateProfile(user.id, { bio: bio.trim() });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'About section updated successfully!'
      });

      setOpen(false);
      onProfileUpdated?.();
    } catch (error) {
      console.error('Error updating about section:', error);
      toast({
        title: 'Error',
        description: 'Failed to update about section. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset to current profile bio when opening
      setBio(currentProfile?.bio || '');
    }
  };

  const remainingChars = maxLength - bio.length;
  const isOverLimit = bio.length > maxLength;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit About Section</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Summary</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a compelling summary about your professional background, expertise, and career goals. Share your passions, key achievements, and what drives you in your career..."
              rows={8}
              className={`resize-none ${isOverLimit ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Express yourself authentically - your story matters
              </p>
              <p className={`text-xs ${isOverLimit ? 'text-red-500' : remainingChars <= 50 ? 'text-yellow-600' : 'text-gray-500'}`}>
                {remainingChars} characters remaining
              </p>
            </div>
            {isOverLimit && (
              <p className="text-xs text-red-500">
                Please reduce your text by {bio.length - maxLength} characters
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isOverLimit || bio.trim().length === 0}
            >
              {isLoading ? 'Updating...' : 'Update About'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AboutEditDialog;
