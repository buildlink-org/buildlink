import { create } from 'zustand';
import { directMessagesService, Message } from '@/services/directMessagesService'; // Assuming you define Message interface in service file

// Define the shape of our store state
interface MessagingState {
  // UI State for selected conversation
  recipientId: string | null;
  recipientName: string | null;
  recipientAvatar: string | null;

  // Data State for actual messages (indexed by otherUserId)
  messagesByUserId: Record<string, Message[]>;
  loadingStatus: Record<string, boolean>; // To track loading per conversation

  // Actions
  openConversation: (userId: string, name?: string, avatar?: string) => void;
  clearRecipient: () => void;
  fetchMessages: (currentUserId: string, otherUserId: string) => Promise<void>;
  addMessage: (message: Message) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  // Initial UI state
  recipientId: null,
  recipientName: null,
  recipientAvatar: null,
  
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
}));
