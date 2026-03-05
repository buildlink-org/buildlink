// stores/notificationsStore.ts
import { create } from "zustand"
import { Notification } from "@/types"

interface NotificationsState {
	notifications: Notification[]
	unreadCount: number
	addNotification: (notification: Notification) => void
	markAsRead: (id: string) => void
	markAllAsRead: () => void
	setNotifications: (notifications: Notification[]) => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
	notifications: [],
	unreadCount: 0,
	setNotifications: (notifications) => {
		const unread = notifications.filter((n) => !n.read).length
		set({ notifications, unreadCount: unread })
	},
	addNotification: (notification) => {
		set((state) => ({
			notifications: [notification, ...state.notifications],
			unreadCount: state.unreadCount + (notification.read ? 0 : 1),
		}))
	},
	markAsRead: (id) => {
		set((state) => ({
			notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
			unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
		}))
	},
	markAllAsRead: () => {
		set((state) => ({
			notifications: state.notifications.map((n) => ({ ...n, read: true })),
			unreadCount: 0,
		}))
	},
}))
