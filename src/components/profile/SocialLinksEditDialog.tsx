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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

interface SocialLinksEditDialogProps {
  currentLinks: Record<string, string>;
  onLinksUpdated: () => void;
  trigger?: React.ReactNode;
}

const platformOptions = [
  { key: 'linkedin', label: 'LinkedIn', mark: 'in', color: 'bg-[#0a66c2]' },
  { key: 'x', label: 'X', mark: 'X', color: 'bg-black' },
  { key: 'instagram', label: 'Instagram', mark: '◎', color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
  { key: 'tiktok', label: 'TikTok', mark: '♪', color: 'bg-black' },
  { key: 'facebook', label: 'Facebook', mark: 'f', color: 'bg-[#1877f2]' },
  { key: 'website', label: 'Personal website', mark: '↗', color: 'bg-muted text-foreground' },
];

const normalizeLinks = (links: Record<string, string>) => {
  const normalized = { ...links };
  if (normalized.twitter && !normalized.x) {
    normalized.x = normalized.twitter;
  }
  delete normalized.twitter;
  return normalized;
};

const SocialLinksEditDialog: React.FC<SocialLinksEditDialogProps> = ({
  currentLinks,
  onLinksUpdated,
  trigger
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState(() => normalizeLinks(currentLinks));
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [saving, setSaving] = useState(false);

  const availablePlatforms = platformOptions.filter(({ key }) => !(key in links));

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setLinks(normalizeLinks(currentLinks));
      setSelectedPlatform('');
    }
  };

  const addPlatform = (platform: string) => {
    setLinks((prev) => ({ ...prev, [platform]: '' }));
    setSelectedPlatform('');
  };

  const updateLink = (platform: string, url: string) => {
    setLinks((prev) => ({ ...prev, [platform]: url }));
  };

  const removeLink = (platform: string) => {
    setLinks((prev) => {
      const nextLinks = { ...prev };
      delete nextLinks[platform];
      return nextLinks;
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Link className="mr-2 h-4 w-4" />
            Edit Social Links
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-md"
        description="Select a social platform, then add its link">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Social Links
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social-platform">Add a social link</Label>
            <Select
              value={selectedPlatform}
              onValueChange={addPlatform}
              disabled={availablePlatforms.length === 0}
            >
              <SelectTrigger id="social-platform">
                <SelectValue placeholder="Choose a platform" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((platform) => (
                  <SelectItem key={platform.key} value={platform.key}>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`text-xs font-semibold text-white ${platform.color}`}>
                          {platform.mark}
                        </AvatarFallback>
                      </Avatar>
                      {platform.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {platformOptions
            .filter(({ key }) => key in links)
            .map((platform) => (
              <div key={platform.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`social-link-${platform.key}`} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className={`text-xs font-semibold text-white ${platform.color}`}>
                        {platform.mark}
                      </AvatarFallback>
                    </Avatar>
                    {platform.label}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(platform.key)}
                    aria-label={`Remove ${platform.label} link`}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input
                  id={`social-link-${platform.key}`}
                  type="url"
                  required
                  placeholder="https://"
                  value={links[platform.key] || ''}
                  onChange={(event) => updateLink(platform.key, event.target.value)}
                  className="text-sm"
                />
              </div>
            ))}

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLinksEditDialog;
