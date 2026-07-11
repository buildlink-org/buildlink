import { create } from "zustand"
import { RealtimeChannel } from "@supabase/supabase-js"
import {
  directMessagesService,
  Message,
} from "@/services/directMessagesService"
import { supabase } from "@/integrations/supabase/client"

interface MessagingState {
  // Current user
  currentUserId: string | null

  // Active conversation recipient
  recipientId: string | null
  recipientName: string | null
  recipientAvatar: string | null

  // Messages keyed by the other user's ID
  messagesByUserId: Record<string, Message[]>
  loadingStatus: Record<string, boolean>

  // Unread counts keyed by the other user's ID
  unreadCounts: Record<string, number>

  // Internal real-time channel reference
  _realtimeChannel: RealtimeChannel | null

  // Actions
  setCurrentUser: (userId: string) => void

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

  fetchOlderMessages: (
    currentUserId: string,
    otherUserId: string
  ) => Promise<void>

  addMessage: (message: Message) => void

  updateMessage: (message: Message) => void

  removeMessage: (messageId: string) => void

  markConversationRead: (otherUserId: string) => void

  subscribeToMessages: () => void

  unsubscribeFromMessages: () => void
}

export const useMessagingStore =
  create<MessagingState>((set, get) => ({
    
    // ─── STATE ───────────────────────────────────────
    currentUserId: null,
    recipientId: null,
    recipientName: null,
    recipientAvatar: null,
    messagesByUserId: {},
    loadingStatus: {},
    unreadCounts: {},
    _realtimeChannel: null,

    // ─── SET CURRENT USER ────────────────────────────
    setCurrentUser: (userId) => {
      set({ currentUserId: userId })
    },

    // ─── OPEN CHAT ───────────────────────────────────
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

    // ─── CLEAR CHAT ──────────────────────────────────
    clearRecipient: () =>
      set({
        recipientId: null,
        recipientName: null,
        recipientAvatar: null,
      }),

    // ─── FETCH MESSAGES ──────────────────────────────
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

    // ─── FETCH OLDER MESSAGES ────────────────────────
    fetchOlderMessages: async (
      currentUserId,
      otherUserId
    ) => {
      const state = get()
      const existing =
        state.messagesByUserId[otherUserId] || []
      if (existing.length === 0) return

      const oldest =
        existing[0].created_at

      const { data, error } =
        await directMessagesService.getOlderMessages(
          currentUserId,
          otherUserId,
          oldest
        )

      if (error) {
        console.error(
          "Fetch older messages error:",
          error
        )
        return
      }

      if (!data || data.length === 0) return

      // data comes in descending order, reverse to ascending
      const olderMessages = data.reverse()

      set((state) => ({
        messagesByUserId: {
          ...state.messagesByUserId,
          [otherUserId]: [
            ...olderMessages,
            ...(state.messagesByUserId[
              otherUserId
            ] || []),
          ],
        },
      }))
    },

    // ─── ADD MESSAGE ─────────────────────────────────
    addMessage: (message) => {
      set((state) => {
        const currentUserId = state.currentUserId
        if (!currentUserId) return state

        // Determine the conversation key: the other user's ID
        const conversationId =
          message.sender_id === currentUserId
            ? message.recipient_id
            : message.sender_id

        if (!conversationId) return state

        const existing =
          state.messagesByUserId[
            conversationId
          ] || []

        // Prevent duplicates
        const alreadyExists =
          existing.some(
            (msg) => msg.id === message.id
          )

        if (alreadyExists) {
          return state
        }

        // If the message is from someone else and we're not viewing that conversation, increment unread
        const isFromOther =
          message.sender_id !== currentUserId
        const isViewingOther =
          state.recipientId === conversationId

        const unreadDelta =
          isFromOther && !isViewingOther ? 1 : 0

        return {
          messagesByUserId: {
            ...state.messagesByUserId,
            [conversationId]: [
              ...existing,
              message,
            ],
          },
          unreadCounts: unreadDelta
            ? {
                ...state.unreadCounts,
                [conversationId]:
                  (state.unreadCounts[
                    conversationId
                  ] || 0) + 1,
              }
            : state.unreadCounts,
        }
      })
    },

    // ─── UPDATE MESSAGE ──────────────────────────────
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

    // ─── REMOVE MESSAGE ──────────────────────────────
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

    // ─── MARK CONVERSATION READ ──────────────────────
    markConversationRead: (otherUserId) => {
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [otherUserId]: 0,
        },
      }))
    },

    // ─── REAL-TIME SUBSCRIPTION ──────────────────────
    subscribeToMessages: () => {
      const state = get()
      if (!state.currentUserId) return
      if (state._realtimeChannel) return // already subscribed

      const channel = supabase
        .channel("direct_messages_realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `recipient_id=eq.${state.currentUserId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message
            get().addMessage(newMessage)
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `sender_id=eq.${state.currentUserId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message
            get().addMessage(newMessage)
          }
        )
        .subscribe()

      set({ _realtimeChannel: channel })
    },

    // ─── UNSUBSCRIBE ─────────────────────────────────
    unsubscribeFromMessages: () => {
      const state = get()
      if (state._realtimeChannel) {
        supabase.removeChannel(state._realtimeChannel)
        set({ _realtimeChannel: null })
      }
    },
  }))