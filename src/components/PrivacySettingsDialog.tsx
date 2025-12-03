import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, EyeOff, Users, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { secureProfileService } from '@/services/secureProfileService';
// import { publicProfileService } from '@/services/publicProfileService';

interface PrivacySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacySettingsDialog = ({ open, onOpenChange }: PrivacySettingsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile visibility setting
  // const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('private');
  
  // Granular privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    show_email: false,
    show_phone: false,
    show_experience: true,
    show_education: true,
    show_skills: true,
    show_social_links: true,
  });

  useEffect(() => {
    if (open && user) {
      loadSettings();
    }
  }, [open, user]);

  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load profile visibility
      // const { data: visibility } = await publicProfileService.getProfileVisibility(user.id);
      // if (visibility) {
      //   setProfileVisibility(visibility as 'public' | 'private');
      // }

      // Load privacy settings
      const { data: settings } = await secureProfileService.getPrivacySettings(user.id);
      if (settings) {
        setPrivacySettings({
          show_email: settings.show_email,
          show_phone: settings.show_phone,
          show_experience: settings.show_experience,
          show_education: settings.show_education,
          show_skills: settings.show_skills,
          show_social_links: settings.show_social_links,
        });
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load privacy settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Save profile visibility
      // await publicProfileService.updateProfileVisibility(profileVisibility);
      
      // Save privacy settings
      await secureProfileService.updatePrivacySettings(user.id, privacySettings);

      toast({
        title: 'Success',
        description: 'Privacy settings updated successfully',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save privacy settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacySetting = (key: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Visibility */}
          {/* ALL PROFILES ARE PUBLIC FOR NOW */}
          {/* <div className="space-y-3">
            <Label className="text-base font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Profile Visibility</span>
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {profileVisibility === 'public' ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm">
                    {profileVisibility === 'public' ? 'Public Profile' : 'Private Profile'}
                  </span>
                </div>
                <Switch
                  checked={profileVisibility === 'public'}
                  onCheckedChange={(checked) => 
                    setProfileVisibility(checked ? 'public' : 'private')
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {profileVisibility === 'public' 
                  ? 'Your profile is visible to other authenticated users' 
                  : 'Your profile is only visible to you and direct connections'
                }
              </p>
            </div>
          </div> */}

          <Separator />

          {/* Granular Privacy Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Information Visibility</span>
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-email" className="text-sm">Show Email</Label>
                <Switch
                  id="show-email"
                  checked={privacySettings.show_email}
                  onCheckedChange={(checked) => updatePrivacySetting('show_email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-phone" className="text-sm">Show Phone</Label>
                <Switch
                  id="show-phone"
                  checked={privacySettings.show_phone}
                  onCheckedChange={(checked) => updatePrivacySetting('show_phone', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-experience" className="text-sm">Show Work Experience</Label>
                <Switch
                  id="show-experience"
                  checked={privacySettings.show_experience}
                  onCheckedChange={(checked) => updatePrivacySetting('show_experience', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-education" className="text-sm">Show Education</Label>
                <Switch
                  id="show-education"
                  checked={privacySettings.show_education}
                  onCheckedChange={(checked) => updatePrivacySetting('show_education', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-skills" className="text-sm">Show Skills</Label>
                <Switch
                  id="show-skills"
                  checked={privacySettings.show_skills}
                  onCheckedChange={(checked) => updatePrivacySetting('show_skills', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-social" className="text-sm">Show Social Links</Label>
                <Switch
                  id="show-social"
                  checked={privacySettings.show_social_links}
                  onCheckedChange={(checked) => updatePrivacySetting('show_social_links', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};