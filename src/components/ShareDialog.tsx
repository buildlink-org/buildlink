import { useState, useEffect, useRef } from 'react';
import { Copy, Mail, MessageCircle, Users, ExternalLink, Check, Send, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { postsService } from '@/services/postsService';
import { NotificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/database';

interface ShareDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: (postId: string) => void;
}

interface UserSearchResult {
  id: string;
  full_name: string;
  avatar?: string;
}

const ShareDialog = ({ post, open, onOpenChange, onShare }: ShareDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Internal sharing state
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [sharing, setSharing] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const postUrl = `${window.location.origin}/post/${post.id}`;
  const shareText = `Check out this post by ${post.profiles?.full_name || 'Unknown'}: ${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}`;

  /**
   * Record a share in the post_shares table (increments shares_count via trigger).
   * Only records if the user is authenticated. The platform parameter tracks
   * where the share was made (internal, link, whatsapp, twitter, etc.).
   */
  const recordShare = async (platform: string = 'internal') => {
    if (user) {
      await postsService.sharePost(post.id, user.id, platform);
    }
    onShare?.(post.id);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      await recordShare('link');
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
    await recordShare('whatsapp');
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${postUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = async () => {
    await recordShare('twitter');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = async () => {
    await recordShare('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = async () => {
    await recordShare('linkedin');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = async () => {
    await recordShare('email');
    const subject = encodeURIComponent(`Interesting post from ${post.profiles?.full_name || 'someone'}`);
    const body = encodeURIComponent(`${shareText}\n\nRead more: ${postUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!searchWrapperRef.current?.contains(e.target as Node)) {
        setShowUserSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced user search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      fetchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchUsers = async (search: string) => {
    if (!user) return;
    setSearchLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar')
        .ilike('full_name', `%${search}%`)
        .neq('id', user.id)
        .limit(10);

      if (data) {
        // Filter out already-selected users
        const filtered = data.filter(
          (u) => !selectedUsers.some((s) => s.id === u.id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = (selectedUser: UserSearchResult) => {
    setSelectedUsers((prev) => [...prev, selectedUser]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  /**
   * Share the post internally with selected users.
   * Creates a notification for each recipient (best-effort, non-blocking).
   * The share succeeds even if notification creation fails.
   */
  const handleShareInternally = async () => {
    if (!user || selectedUsers.length === 0) return;

    setSharing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Record the share (increments shares_count via trigger)
      await postsService.sharePost(post.id, user.id, 'internal');

      // Create a notification for each recipient (best-effort, non-blocking)
      const sharerName = user.user_metadata?.full_name || 'Someone';
      const notificationContent = `${sharerName} shared a post with you: "${post.content.slice(0, 60)}${post.content.length > 60 ? '...' : ''}"`;
      const notificationLink = `/post/${post.id}`;

      for (const recipient of selectedUsers) {
        try {
          const { error } = await NotificationService.createNotification({
            user_id: recipient.id,
            type: 'share',
            content: notificationContent,
            from_user_id: user.id,
            link: notificationLink,
          });

          if (error) {
            // Notification failed, but the share itself succeeded
            console.warn('[ShareDialog] Notification failed for recipient:', recipient.id, error.message);
            failCount++;
          } else {
            successCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        onShare?.(post.id);
        toast({
          title: 'Post shared!',
          description: `Shared with ${successCount} ${successCount === 1 ? 'user' : 'users'}${
            failCount > 0 ? ` (${failCount} failed)` : ''
          }`,
        });
        // Reset state and close
        setSelectedUsers([]);
        setSearchQuery('');
        setShowUserSearch(false);
        onOpenChange(false);
      } else {
        toast({
          title: 'Sharing failed',
          description: 'Could not share the post with selected users. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share post internally',
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };

  const toggleUserSearch = () => {
    setShowUserSearch(!showUserSearch);
    if (showUserSearch) {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        description="Share this post via link, email, social platforms, or with other users">
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

            {/* Selected users chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {selectedUser.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {selectedUser.full_name}
                    </span>
                    <button
                      onClick={() => handleRemoveUser(selectedUser.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* User search */}
            {showUserSearch ? (
              <div ref={searchWrapperRef} className="relative space-y-2">
                <Input
                  placeholder="Search users by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />

                {searchLoading && (
                  <div className="flex justify-center p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!searchLoading && searchQuery && searchResults.length === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">
                    No users found
                  </p>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectUser(result)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={result.avatar || ''} />
                          <AvatarFallback>
                            {result.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{result.full_name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Share button */}
                {selectedUsers.length > 0 && (
                  <Button
                    onClick={handleShareInternally}
                    disabled={sharing}
                    className="w-full"
                  >
                    {sharing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Share with {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={toggleUserSearch}
              >
                <Users className="h-4 w-4 mr-2" />
                Send to other users
              </Button>
            )}
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