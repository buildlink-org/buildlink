import { create } from "zustand"
import {
  directMessagesService,
  Message,
} from "@/services/directMessagesService"

interface MessagingState {
  recipientId: string | null
  recipientName: string | null
  recipientAvatar: string | null

  messagesByUserId: Record<string, Message[]>
  loadingStatus: Record<string, boolean>

  openConversation: (
    userId: string,
    name?: string,
    avatar?: string
  ) => void

  clearRecipient: () => void

  fetchMessages: (
    currentUserId: string,
    otherUserId: string
  ) => Promise<void>

  addMessage: (message: Message) => void

  updateMessage: (message: Message) => void

  removeMessage: (messageId: string) => void
}

export const useMessagingStore =
  create<MessagingState>((set) => ({
    
    // STATE
    recipientId: null,
    recipientName: null,
    recipientAvatar: null,

    messagesByUserId: {},

    loadingStatus: {},

    // OPEN CHAT
    openConversation: (
      userId,
      name,
      avatar
    ) =>
      set({
        recipientId: userId,
        recipientName: name,
        recipientAvatar: avatar,
      }),

    // CLEAR CHAT
    clearRecipient: () =>
      set({
        recipientId: null,
        recipientName: null,
        recipientAvatar: null,
      }),

    // FETCH MESSAGES
    fetchMessages: async (
      currentUserId,
      otherUserId
    ) => {
      set((state) => ({
        loadingStatus: {
          ...state.loadingStatus,
          [otherUserId]: true,
        },
      }))

      const { data, error } =
        await directMessagesService.getMessages(
          currentUserId,
          otherUserId
        )

      set((state) => ({
        loadingStatus: {
          ...state.loadingStatus,
          [otherUserId]: false,
        },
      }))

      if (error) {
        console.error(
          "Fetch messages error:",
          error
        )

        return
      }

      set((state) => ({
        messagesByUserId: {
          ...state.messagesByUserId,
          [otherUserId]: data || [],
        },
      }))
    },

    // ADD MESSAGE
    addMessage: (message) => {
      set((state) => {
        
        // DETERMINE CHAT KEY
        const conversationId =
          message.sender_id ===
          state.recipientId
            ? message.sender_id
            : message.recipient_id

        // EXISTING MESSAGES
        const existing =
          state.messagesByUserId[
            conversationId
          ] || []

        // PREVENT DUPLICATES
        const alreadyExists =
          existing.some(
            (msg) => msg.id === message.id
          )

        if (alreadyExists) {
          return state
        }

        return {
          messagesByUserId: {
            ...state.messagesByUserId,

            [conversationId]: [
              ...existing,
              message,
            ],
          },
        }
      })
    },

    // UPDATE MESSAGE
    updateMessage: (
      updatedMessage
    ) => {
      set((state) => {
        const updated: Record<
          string,
          Message[]
        > = {}

        for (const key in state.messagesByUserId) {
          updated[key] =
            state.messagesByUserId[key].map(
              (msg) =>
                msg.id === updatedMessage.id
                  ? {
                      ...msg,
                      ...updatedMessage,
                    }
                  : msg
            )
        }

        return {
          messagesByUserId: updated,
        }
      })
    },

    // REMOVE MESSAGE
    removeMessage: (messageId) => {
      set((state) => {
        const updated: Record<
          string,
          Message[]
        > = {}

        for (const key in state.messagesByUserId) {
          updated[key] =
            state.messagesByUserId[key].filter(
              (msg) =>
                msg.id !== messageId
            )
        }

        return {
          messagesByUserId: updated,
        }
      })
    },
  }))