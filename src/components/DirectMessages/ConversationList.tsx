import React, { useEffect, useState } from 'react';
import { directMessagesService, Message } from '@/services/directMessagesService';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { useMessagingStore } from '@/stores/messagingStore';

interface UserListItem {
  id: string;
  name?: string;
  avatar?: string;
}

interface ConversationsListProps {
  onSelectUser: (user: UserListItem) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  onSelectUser,
}) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

    // Get all messages from the store
  const messagesByUserId = useMessagingStore(state => state.messagesByUserId);
  const fetchMessagesFromStore = useMessagingStore(state => state.fetchMessages);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await directMessagesService.getConversations(
        user.id
      );

      if (error || !data || !Array.isArray(data)) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Fetch profile info for each user
      const promises = data.map(async (c: any) => {
        const otherUserId = c.other_user_id || c.user_id || c.id || c;
        if (!otherUserId || otherUserId === user.id) return null;

        try {
          const { data: profile } = await profileService.getProfile(otherUserId);
          if (profile) {
            return {
              id: otherUserId,
              name: profile.full_name,
              avatar: profile.avatar,
            };
          }
        } catch (e) {
          // ignore error
        }

        return {
          id: otherUserId,
          name: 'Unknown User',
          avatar: undefined,
        };
      });

      const results = await Promise.all(promises);
      const uniqueUsers = results.filter(Boolean) as UserListItem[];
      setUsers(uniqueUsers);
      setLoading(false);

      // Fetch messages for each user
      uniqueUsers.forEach(u => {
        if (user && u.id) {
          fetchMessagesFromStore(user.id, u.id);
        }
      });
    };

    fetchConversations();
  }, [user]);

  // Get last message from each conversation
  const getLastMessageSnippet = (otherUserId: string): string => {
    const conversationMessages = messagesByUserId[otherUserId];
    if (!conversationMessages || conversationMessages.length === 0) {
      return "Click to open conversation"; 
    }
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    // Determine if "You" sent it or "Them"
    const prefix = lastMessage.sender_id === user?.id ? 'You: ' : '';

    // Truncate message content for snippet view
    const contentSnippet = lastMessage.content.length > 40 
        ? lastMessage.content.substring(0, 40) + '...' 
        : lastMessage.content;
        
    return prefix + contentSnippet;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start a conversation by visiting your connection's profile
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="">
        {users.map((u, index) => (
          <div key={u.id}>
          <button
            onClick={() => onSelectUser(u)}
            className="w-full px-4 py-2 flex items-center gap-2 text-left"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={u.avatar} alt={u.name} />
              <AvatarFallback>
                {u.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{u.name || 'Unknown User'}</p>
              <p className="text-xs text-muted-foreground">{getLastMessageSnippet(u.id)}</p>
            </div>
          </button>
          { /* message list seperator */}
          {index < users.length - 1 && (
                    <div className="px-4">
                        <hr className="bg-[#a51e06] opacity-20 h-[2px]" />
                    </div>
                )}
            </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConversationsList;