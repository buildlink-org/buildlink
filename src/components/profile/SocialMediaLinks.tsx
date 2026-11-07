import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  Facebook,
  Globe,
  Github,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react';

interface SocialMediaLinksProps {
  links: Record<string, string>;
  editable?: boolean;
  onEdit?: () => void;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ 
  links, 
  editable = false, 
  onEdit 
}) => {
  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'x':
        return <span aria-hidden="true" className="text-sm font-semibold">X</span>;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'tiktok':
        return <span aria-hidden="true" className="text-base font-semibold">♪</span>;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const formatPlatformName = (platform: string) => {
    if (platform === 'x' || platform === 'twitter') return 'X';
    if (platform === 'website') return 'Personal website';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const socialLinks = Object.entries(links).filter(([_, url]) => url);

  if (socialLinks.length === 0 && !editable) {
    return null;
  }

  return (
    <div className="space-y-3">
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {socialLinks.map(([platform, url]) => (
            <Button
              key={platform}
              variant="outline"
              size="sm"
              asChild
              className="h-8"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {getIcon(platform)}
                <span className="text-xs">{formatPlatformName(platform)}</span>
              </a>
            </Button>
          ))}
        </div>
      )}
      
      {editable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {socialLinks.length > 0 ? 'Edit social links' : 'Add social links'}
        </Button>
      )}
    </div>
  );
};

export default SocialMediaLinks;