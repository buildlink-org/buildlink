// components/NotificationsListener.tsx
import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { initNotificationsListener, notificationsService } from "@/services/notificationsService"
import { useNotificationsStore } from "@/stores/notificationStore"

export const NotificationsListener = () => {
	const { user } = useAuth()
	const setNotifications = useNotificationsStore((state) => state.setNotifications)

	useEffect(() => {
		if (!user) return

		// Load initial notifications from Supabase
		const loadInitial = async () => {
			const { data } = await notificationsService.getNotifications(user.id)
			if (data) setNotifications(data)
		}

		loadInitial()

		// Setup real-time listener
		const cleanup = initNotificationsListener(user.id)
		return () => cleanup()
	}, [user, setNotifications])

	return null // this component just sets up the listener
}
