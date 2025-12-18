import { create } from 'zustand';
import { directMessagesService, Message } from '@/services/directMessagesService';
import { supabase } from "@/integrations/supabase/client";


// Define the shape of our store state
interface MessagingState {
  // UI State for selected conversation
  recipientId: string | null;
  recipientName: string | null;
  recipientAvatar: string | null;
  totalUnreadCount: number;

  // Data State for actual messages (indexed by otherUserId)
  messagesByUserId: Record<string, Message[]>;
  loadingStatus: Record<string, boolean>; // To track loading per conversation

  // Actions
  openConversation: (userId: string, name?: string, avatar?: string) => void;
  clearRecipient: () => void;
  fetchMessages: (currentUserId: string, otherUserId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  subscribeToMessages: (userId: string) => () => void;
  markConversationAsRead: (currentUserId: string, otherUserId: string) => Promise<void>;
  fetchTotalUnreadCount: (userId: string) => Promise<void>;
  calculateUnreadConversationCount: () => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  // Initial UI state
  recipientId: null,
  recipientName: null,
  recipientAvatar: null,
  totalUnreadCount: 0,
  
  // Initial Data state
  messagesByUserId: {},
  loadingStatus: {},

  // --- UI Actions ---
  openConversation: (userId, name, avatar) =>
    set({ recipientId: userId, recipientName: name, recipientAvatar: avatar }),
  
  clearRecipient: () =>
    set({ recipientId: null, recipientName: null, recipientAvatar: null }),

  // --- Data Actions ---

  fetchMessages: async (currentUserId, otherUserId) => {
    // Only fetch if not already loading and not already fetched (optional optimization)
    if (get().loadingStatus[otherUserId]) return;

    set(state => ({
        loadingStatus: { ...state.loadingStatus, [otherUserId]: true }
    }));

    const { data, error } = await directMessagesService.getMessages(
      currentUserId,
      otherUserId
    );

    set(state => ({
      loadingStatus: { ...state.loadingStatus, [otherUserId]: false }
    }));

    if (error) {
      console.error(`Failed to fetch messages for ${otherUserId}:`, error);
      // Handle error (maybe add an error state if needed)
    } else {
      // Store the messages organized by the other user's ID
      set(state => ({
        messagesByUserId: {
          ...state.messagesByUserId,
          [otherUserId]: data || []
        }
      }));
    }
  },

  addMessage: (message) => {
    const relevantUserId = message.sender_id === get().recipientId 
        ? message.sender_id 
        : message.recipient_id;

    if (!relevantUserId) return;

    set(state => ({
        messagesByUserId: {
            ...state.messagesByUserId,
            [relevantUserId]: [...(state.messagesByUserId[relevantUserId] || []), message]
        }
    }));
  },

  calculateUnreadConversationCount: () => {
    const { messagesByUserId } = get();
    const unreadConversationIds = Object.values(messagesByUserId).filter(messages => {
        // Check if any message from this specific user is unread by the current user
        return messages.some(m => !m.read && m.recipient_id === m.sender_id);
    }).length;
    // Set the state with the count of unique conversations
    set({ totalUnreadCount: unreadConversationIds });
  },


   // Mark all messages in a specific conversation as read
    markConversationAsRead: async (currentUserId, otherUserId) => {
        await directMessagesService.markMessagesAsRead(currentUserId, otherUserId);

        // Update local store to mark messages as read
        set(state => ({
            messagesByUserId: {
              ...state.messagesByUserId,
              [otherUserId]: (state.messagesByUserId[otherUserId] || []).map(m => ({ ...m, read: true }))
            }
          }));
        
        // get().fetchTotalUnreadCount(currentUserId);
        get().calculateUnreadConversationCount();
    },

    // Fetch the total unread count for the badge
    fetchTotalUnreadCount: async (userId) => {
        const { data, error } = await directMessagesService.getTotalUnreadCount(userId);
        if (data !== null) {
            set({ totalUnreadCount: data });
        }
    },

    // Real-time subscription
    subscribeToMessages: (currentUserId: string) => {
        const channel = supabase
            .channel(`messages_for_user_${currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `recipient_id=eq.${currentUserId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    console.log('Real-time new message received:', newMessage);
                    
                    // 1. Add the message to the specific conversation in the store
                    get().addMessage(newMessage);

                    // 2. Increment global unread count instantly
                    // set(state => ({ totalUnreadCount: state.totalUnreadCount + 1 }));
                    get().calculateUnreadConversationCount();

                    // 3. If the user is currently looking at this conversation, mark it as read immediately
                    if (get().recipientId === newMessage.sender_id) {
                        get().markConversationAsRead(currentUserId, newMessage.sender_id);
                    }
                }
            )
            .subscribe();

        // Return the unsubscribe function
        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
