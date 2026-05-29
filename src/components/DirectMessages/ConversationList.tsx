import React, { useEffect, useState } from 'react';
import { directMessagesService, Message } from '@/services/directMessagesService';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { useMessagingStore } from '@/stores/messagingStore';
import { formatTimestamp } from '@/lib/utils';

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

  // CATEGORY TAB
  const [activeTab, setActiveTab] = useState<
    'general' | 'interests' | 'submissions'
  >('general');

  // STORE
  const messagesByUserId = useMessagingStore(
    (state) => state.messagesByUserId
  );

  const fetchMessagesFromStore = useMessagingStore(
    (state) => state.fetchMessages
  );

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      setLoading(true);

      const { data, error } =
        await directMessagesService.getConversations(
          user.id
        );

      if (
        error ||
        !data ||
        !Array.isArray(data)
      ) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // FETCH PROFILE FOR EACH USER
      const promises = data.map(async (c: any) => {
        const otherUserId =
          c.other_user_id ||
          c.user_id ||
          c.id ||
          c;

        if (
          !otherUserId ||
          otherUserId === user.id
        )
          return null;

        try {
          const { data: profile } =
            await profileService.getProfile(
              otherUserId
            );

          if (profile) {
            return {
              id: otherUserId,
              name: profile.full_name,
              avatar: profile.avatar,

              // OPTIONAL CATEGORY
              category:
                c.category || 'general',
            };
          }
        } catch (e) {}

        return {
          id: otherUserId,
          name: 'Unknown User',
          avatar: undefined,
          category: 'general',
        };
      });

      const results = await Promise.all(promises);

      const uniqueUsers =
        results.filter(Boolean) as UserListItem[];

      setUsers(uniqueUsers);

      setLoading(false);

      // PREFETCH MESSAGES
      uniqueUsers.forEach((u) => {
        if (user && u.id) {
          fetchMessagesFromStore(
            user.id,
            u.id
          );
        }
      });
    };

    fetchConversations();
  }, [user]);

  // LAST MESSAGE
  const getLastMessageSnippet = (
    otherUserId: string
  ): string => {
    const conversationMessages =
      messagesByUserId[otherUserId];

    if (
      !conversationMessages ||
      conversationMessages.length === 0
    ) {
      return 'Click to open conversation';
    }

    const lastMessage =
      conversationMessages[
        conversationMessages.length - 1
      ];

    const prefix =
      lastMessage.sender_id === user?.id
        ? 'You: '
        : '';

    const contentSnippet =
      lastMessage.content.length > 40
        ? lastMessage.content.substring(0, 40) +
          '...'
        : lastMessage.content;

    return prefix + contentSnippet;
  };

  // LAST TIMESTAMP
  const getLastMessageTimestamp = (
    otherUserId: string
  ): string | null => {
    const conversationMessages =
      messagesByUserId[otherUserId];

    if (
      !conversationMessages ||
      conversationMessages.length === 0
    ) {
      return null;
    }

    const lastMessage =
      conversationMessages[
        conversationMessages.length - 1
      ];

    return formatTimestamp(
      lastMessage.created_at,
      false
    );
  };

  // FILTER USERS
  const filteredUsers = users.filter(
    (u: any) =>
      (u.category || 'general') === activeTab
  );

  return (
    <div className="flex h-full flex-col bg-background">

      {/* HEADER */}
      <div className="border-b bg-card px-4 py-3">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Inbox
          </h2>

          <span className="text-xs text-muted-foreground">
            {filteredUsers.length} chats
          </span>
        </div>

        {/* CATEGORY TABS */}
        <div className="mt-4 grid grid-cols-3 gap-2">

          <button
            onClick={() =>
              setActiveTab('interests')
            }
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              activeTab === 'interests'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Interests
          </button>

          <button
            onClick={() =>
              setActiveTab('general')
            }
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              activeTab === 'general'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            General
          </button>

          <button
            onClick={() =>
              setActiveTab('submissions')
            }
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              activeTab === 'submissions'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Submissions
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border bg-card p-3"
            >
              <Skeleton className="h-12 w-12 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (

        // EMPTY STATE
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />

          <h3 className="mb-2 text-lg font-semibold">
            No conversations yet
          </h3>

          <p className="max-w-sm text-sm text-muted-foreground">
            Your messages will appear here.
          </p>
        </div>
      ) : (

        // CONVERSATIONS
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">

            {filteredUsers.map((u) => {

              const timestamp =
                getLastMessageTimestamp(u.id);

              const lastMessage =
                getLastMessageSnippet(u.id);

              return (
                <button
                  key={u.id}
                  onClick={() =>
                    onSelectUser(u)
                  }
                  className="group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:bg-muted/40"
                >

                  {/* AVATAR */}
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage
                      src={u.avatar}
                      alt={u.name}
                    />

                    <AvatarFallback>
                      {u.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* MESSAGE BODY */}
                  <div className="min-w-0 flex-1">

                    {/* TOP */}
                    <div className="flex items-start justify-between gap-2">

                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {u.name ||
                          'Unknown User'}
                      </h3>

                      {timestamp && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {timestamp}
                        </span>
                      )}
                    </div>

                    {/* LAST MESSAGE */}
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ConversationsList;