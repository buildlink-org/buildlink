import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link, Linkedin, Twitter, Github, Globe, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

interface SocialLinksEditDialogProps {
  currentLinks: Record<string, string>;
  onLinksUpdated: () => void;
  trigger?: React.ReactNode;
}

const SocialLinksEditDialog: React.FC<SocialLinksEditDialogProps> = ({
  currentLinks,
  onLinksUpdated,
  trigger
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState(currentLinks);
  const [saving, setSaving] = useState(false);

  const platformOptions = [
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' }
  ];

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await profileService.updateProfile(user.id, {
        social_links: links
      });

      if (error) throw error;

      onLinksUpdated();
      setOpen(false);
      toast({
        title: 'Success',
        description: 'Social media links updated successfully!'
      });
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: 'Error',
        description: 'Failed to save social media links',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (platform: string, url: string) => {
    setLinks(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  const removeLink = (platform: string) => {
    setLinks(prev => {
      const newLinks = { ...prev };
      delete newLinks[platform];
      return newLinks;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Link className="h-4 w-4 mr-2" />
            Edit Social Links
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent
        className="max-w-md"
        description="Add or update your LinkedIn, Twitter, GitHub, and website links">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Social Media Links
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {platformOptions.map((platform) => {
            const Icon = platform.icon;
            const hasLink = links[platform.key];
            
            return (
              <div key={platform.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {platform.label}
                  </Label>
                  {hasLink && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(platform.key)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder={platform.placeholder}
                  value={links[platform.key] || ''}
                  onChange={(e) => updateLink(platform.key, e.target.value)}
                  className="text-sm"
                />
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLinksEditDialog;