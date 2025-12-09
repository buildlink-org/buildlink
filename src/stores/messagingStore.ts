import { create } from 'zustand';

// Create a store to manage messaging state globally
export const useMessagingStore = create<{
  openConversation: (userId: string, name?: string, avatar?: string) => void;
  recipientId: string | null;
  recipientName: string | null;
  recipientAvatar: string | null;
  clearRecipient: () => void;
}>((set) => ({
  recipientId: null,
  recipientName: null,
  recipientAvatar: null,
  openConversation: (userId, name, avatar) =>
    set({ recipientId: userId, recipientName: name, recipientAvatar: avatar }),
  clearRecipient: () =>
    set({ recipientId: null, recipientName: null, recipientAvatar: null }),
}));