import { create } from "zustand"
import { directMessagesService, Message } from "@/services/directMessagesService"

interface MessagingState {
  recipientId: string | null
  recipientName: string | null
  recipientAvatar: string | null

  messagesByUserId: Record<string, Message[]>
  loadingStatus: Record<string, boolean>

  openConversation: (userId: string, name?: string, avatar?: string) => void
  clearRecipient: () => void
  fetchMessages: (currentUserId: string, otherUserId: string) => Promise<void>

  addMessage: (message: Message) => void
  updateMessage: (message: Message) => void
  removeMessage: (messageId: string) => void
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  // -------- STATE --------
  recipientId: null,
  recipientName: null,
  recipientAvatar: null,

  messagesByUserId: {},
  loadingStatus: {},

  // -------- UI --------
  openConversation: (userId, name, avatar) =>
    set({
      recipientId: userId,
      recipientName: name,
      recipientAvatar: avatar,
    }),

  clearRecipient: () =>
    set({
      recipientId: null,
      recipientName: null,
      recipientAvatar: null,
    }),

  // -------- FETCH --------
  fetchMessages: async (currentUserId, otherUserId) => {
    if (get().loadingStatus[otherUserId]) return

    set((state) => ({
      loadingStatus: { ...state.loadingStatus, [otherUserId]: true },
    }))

    const { data, error } = await directMessagesService.getMessages(
      currentUserId,
      otherUserId
    )

    set((state) => ({
      loadingStatus: { ...state.loadingStatus, [otherUserId]: false },
    }))

    if (error) {
      console.error("Fetch messages error:", error)
      return
    }

    set((state) => ({
      messagesByUserId: {
        ...state.messagesByUserId,
        [otherUserId]: data || [],
      },
    }))
  },

  // -------- ADD (SMART + SAFE) --------
  addMessage: (message) => {
    const { recipientId } = get()
    if (!recipientId) return

    // determine correct conversation key
    const conversationId =
      message.sender_id === recipientId
        ? message.sender_id
        : message.recipient_id

    set((state) => ({
      messagesByUserId: {
        ...state.messagesByUserId,
        [conversationId]: [
          ...(state.messagesByUserId[conversationId] || []),
          message,
        ],
      },
    }))
  },

  // -------- UPDATE --------
  updateMessage: (updatedMessage) => {
    set((state) => {
      const updated: Record<string, Message[]> = {}

      for (const key in state.messagesByUserId) {
        updated[key] = state.messagesByUserId[key].map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      }

      return { messagesByUserId: updated }
    })
  },

  // -------- DELETE --------
  removeMessage: (messageId) => {
    set((state) => {
      const updated: Record<string, Message[]> = {}

      for (const key in state.messagesByUserId) {
        updated[key] = state.messagesByUserId[key].filter(
          (msg) => msg.id !== messageId
        )
      }

      return { messagesByUserId: updated }
    })
  },
}))