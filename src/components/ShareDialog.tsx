import { useState } from 'react';
import { Copy, Mail, MessageCircle, Users, ExternalLink, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { postsService } from '@/services/postsService';
import { Post } from '@/types/database';

interface ShareDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: (postId: string) => void;
}

const ShareDialog = ({ post, open, onOpenChange, onShare }: ShareDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const postUrl = `${window.location.origin}/post/${post.id}`;
  const shareText = `Check out this post by ${post.profiles?.full_name || 'Unknown'}: ${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}`;
  
  const recordShare = async () => {
    if (user) {
      await postsService.sharePost(post.id, user.id);
    }
    onShare?.(post.id);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      await recordShare();
      toast({
        title: 'Link copied!',
        description: 'Post link copied to clipboard'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    }
  };

  const shareToWhatsApp = async () => {
    await recordShare();
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${postUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = async () => {
    await recordShare();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = async () => {
    await recordShare();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = async () => {
    await recordShare();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = async () => {
    await recordShare();
    const subject = encodeURIComponent(`Interesting post from ${post.profiles?.full_name || 'someone'}`);
    const body = encodeURIComponent(`${shareText}\n\nRead more: ${postUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareInternally = () => {
    // This would open a user selection dialog for internal sharing
    toast({
      title: 'Feature coming soon',
      description: 'Internal user sharing will be available soon!'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Link</label>
            <div className="flex space-x-2">
              <Input
                value={postUrl}
                readOnly
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Internal Sharing */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share with Users</label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={shareInternally}
            >
              <Users className="h-4 w-4 mr-2" />
              Send to other users
            </Button>
          </div>

          <Separator />

          {/* External Platforms */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share on Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={shareToWhatsApp}
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={shareToTwitter}
              >
                <ExternalLink className="h-4 w-4 mr-2 text-blue-400" />
                Twitter/X
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={shareToFacebook}
              >
                <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={shareToLinkedIn}
              >
                <ExternalLink className="h-4 w-4 mr-2 text-blue-700" />
                LinkedIn
              </Button>
            </div>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={shareViaEmail}
            >
              <Mail className="h-4 w-4 mr-2" />
              Share via Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;