import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationService } from "@/services/notificationService"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

const NotificationsList = () => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [notifications, setNotifications] = useState<any[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (user) {
			loadNotifications()
		}
	}, [user])

	const loadNotifications = async () => {
		if (!user) return

		setLoading(true)
		try {
			const { data, error } = await NotificationService.getNotification(user.id)
			if (error) throw error
			setNotifications(data || [])
		} catch (error) {
			console.error("Error loading notifications:", error)
		} finally {
			setLoading(false)
		}
	}

	const markAsRead = async (notificationId: string) => {
		try {
			const { error } = await NotificationService.markAsRead(notificationId)
			if (error) throw error

			setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
		} catch (error) {
			console.error("Error marking notification as read:", error)
		}
	}

	const markAllAsRead = async () => {
		if (!user) return

		try {
			const { error } = await NotificationService.markAllAsRead(user.id)
			if (error) throw error

			setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
			toast({
				title: "Success",
				description: "All notifications marked as read",
			})
		} catch (error) {
			console.error("Error marking all notifications as read:", error)
			toast({
				title: "Error",
				description: "Failed to mark notifications as read",
				variant: "destructive",
			})
		}
	}

	const unreadCount = notifications.filter((notif) => !notif.read).length

	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Bell className="h-5 w-5" />
					<h3 className="font-semibold">Notifications</h3>
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="text-xs">
							{unreadCount}
						</Badge>
					)}
				</div>
				{unreadCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={markAllAsRead}>
						<CheckCheck className="h-4 w-4 mr-2" />
						Mark all read
					</Button>
				)}
			</div>

			<div className="space-y-2">
				{notifications.length > 0 ? (
					notifications.map((notification) => (
						<div
							key={notification.id}
							className={`p-3 rounded-lg border cursor-pointer transition-colors ${notification.read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"}`}
							onClick={() => !notification.read && markAsRead(notification.id)}>
							<div className="flex items-start space-x-3">
								{notification.from_user && (
									<Avatar className="h-8 w-8">
										<AvatarImage src={notification.from_user.avatar} />
										<AvatarFallback>{notification.from_user.full_name?.charAt(0) || "U"}</AvatarFallback>
									</Avatar>
								)}
								<div className="flex-1 min-w-0">
									<p className="text-sm text-gray-800">{notification.content}</p>
									<p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(notification.created_at))} ago</p>
								</div>
								{!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>}
							</div>
						</div>
					))
				) : (
					<div className="text-center py-8">
						<Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications</h3>
						<p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default NotificationsList
