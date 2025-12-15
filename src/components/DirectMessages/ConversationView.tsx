import React, { useEffect, useRef, useState } from 'react';
import { directMessagesService, Message } from '@/services/directMessagesService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessagingStore } from '@/stores/messagingStore';
import { formatTimestamp } from '@/lib/utils';


interface ConversationViewProps {
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
}

type ConversationItem = 
  | ({ type: 'message' } & Message)
  | { type: 'separator'; id: string; dateLabel: string };

  // Process messages and add date separators
  const addDateSeparators = (messages: Message[]): ConversationItem[] => {
  const items: ConversationItem[] = [];
  let lastDate: string | null = null;

  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  sortedMessages.forEach((msg, index) => {
    const messageDate = new Date(msg.created_at);
    const dateKey = messageDate.toISOString().split('T')[0];

    if (dateKey !== lastDate) {
      items.push({
        type: 'separator',
        id: `sep-${dateKey}-${index}`,
        dateLabel: formatTimestamp(msg.created_at, false),
      });
      lastDate = dateKey;
    }

    items.push({ ...msg, type: 'message' });
  });

  return items;
};

const ConversationView: React.FC<ConversationViewProps> = ({
  otherUserId,
  otherUserName,
  otherUserAvatar,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
   const messages = useMessagingStore(state => state.messagesByUserId[otherUserId] || []);
  const loading = useMessagingStore(state => state.loadingStatus[otherUserId] || false);
  const fetchMessages = useMessagingStore(state => state.fetchMessages);
  const addMessageToStore = useMessagingStore(state => state.addMessage);

  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationItems = React.useMemo(() => addDateSeparators(messages), [messages]);


  useEffect(() => {
    if (!user || !otherUserId) return;

        fetchMessages(user.id, otherUserId);


    // Real-time subscription here
//    const channel = supabase
//     .channel('messages')
//     .on(
//       'postgres_changes',
//       {
//         event: 'INSERT',
//         schema: 'public',
//         table: 'direct_messages',
//         filter: `recipient_id=eq.${user.id}`,
//       },
//       (payload) => {
//         if (payload.new.sender_id === otherUserId) {
//           setMessages((msgs) => [...msgs, payload.new as Message]);
//         }
//       }
//     )
//     .subscribe();

//   return () => {
//     supabase.removeChannel(channel);
//   };
  }, [user, otherUserId, fetchMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!user || !content.trim() || sending) return;

    setSending(true);
    const newMessageData = {
      sender_id: user.id,
      recipient_id: otherUserId,
      content: content.trim(),
    };

    const { data, error } = await directMessagesService.sendMessage(newMessageData);

    if (error) {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      addMessageToStore(data);
      setContent('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 py-4 px-2">
        <div className="space-y-4">
          {messages.length === 0 && conversationItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Say hi! 👋</p>
            </div>
          ) : (
            conversationItems.map((item) => {
              // render the seperator
               if (item.type === 'separator') {
                return (
                  <div key={item.id} className="flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full shadow-sm">
                      {item.dateLabel}
                    </span>
                  </div>
                );
              }
              const msg = item;
              const isOwnMessage = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={isOwnMessage ? user?.user_metadata?.avatar : otherUserAvatar}
                    />
                    <AvatarFallback>
                      {isOwnMessage
                        ? user?.user_metadata?.full_name?.[0] || 'Y'
                        : otherUserName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-4 py-2',
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={cn(
                        'text-[9px] mt-[-1px]',
                        isOwnMessage
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="resize-none min-h-[60px]"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            size="icon"
            className="self-end item-center"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;