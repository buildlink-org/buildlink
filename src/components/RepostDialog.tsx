import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Repeat2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { postsService } from '@/services/postsService';
import { useToast } from '@/hooks/use-toast';

interface RepostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onRepost: (action: 'reposted' | 'unreposted') => void;
}

const RepostDialog = ({ isOpen, onClose, post, onRepost }: RepostDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRepost = async () => {
    if (!user || !post) return;

    setSubmitting(true);
    try {
      const { error, action } = await postsService.repostPost(
        post.id, 
        user.id, 
        comment.trim() || undefined
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: action === 'reposted' ? 'Post reposted!' : 'Repost removed!',
      });

      onRepost(action);
      onClose();
      setComment('');
    } catch (error) {
      console.error('Error reposting:', error);
      toast({
        title: 'Error',
        description: 'Failed to repost',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render if post is null
  if (!post) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Repeat2 className="h-5 w-5" />
            <span>Repost</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add comment section */}
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment to your repost (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Original post preview */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.profiles?.avatar} />
                <AvatarFallback>
                  {post.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">
                {post.profiles?.full_name || 'Anonymous User'}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {post.content && post.content.length > 150 
                ? `${post.content.substring(0, 150)}...` 
                : post.content || 'No content'
              }
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleRepost}
              disabled={submitting}
            >
              {submitting ? 'Reposting...' : 'Repost'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepostDialog;
