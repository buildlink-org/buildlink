import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationService } from "@/services/notificationService"
import { useToast } from "@/hooks/use-toast"

const NotificationsDropdown = () => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [notifications, setNotifications] = useState<any[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (user) {
			loadNotifications()
		}
	}, [user])

	const loadNotifications = async () => {
		if (!user) return

		try {
			setLoading(true)
			const { data, error } = await NotificationService.getNotification(user.id)

			if (error) {
				console.error("Error loading notifications:", error)
				return
			}

			setNotifications(data || [])
			setUnreadCount((data || []).filter((n) => !n.read).length)
		} catch (error) {
			console.error("Error loading notifications:", error)
		} finally {
			setLoading(false)
		}
	}

	const markAsRead = async (notificationId: string) => {
		try {
			const { error } = await NotificationService.markAsRead(notificationId)

			if (error) {
				toast({
					title: "Error",
					description: "Failed to mark notification as read",
					variant: "destructive",
				})
				return
			}

			setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
			setUnreadCount((prev) => Math.max(0, prev - 1))
		} catch (error) {
			console.error("Error marking notification as read:", error)
		}
	}

	const markAllAsRead = async () => {
		if (!user) return

		try {
			const { error } = await NotificationService.markAllAsRead(user.id)

			if (error) {
				toast({
					title: "Error",
					description: "Failed to mark all notifications as read",
					variant: "destructive",
				})
				return
			}

			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
			setUnreadCount(0)

			toast({
				title: "Success",
				description: "All notifications marked as read",
			})
		} catch (error) {
			console.error("Error marking all notifications as read:", error)
		}
	}

	if (!user) {
		return (
			<Button
				variant="ghost"
				size="icon"
				disabled>
				<Bell className="h-5 w-5" />
			</Button>
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="w-80">
				<div className="flex items-center justify-between p-3">
					<DropdownMenuLabel className="p-0 font-semibold">Notifications</DropdownMenuLabel>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={markAllAsRead}
							className="h-6 text-xs">
							<Check className="mr-1 h-3 w-3" />
							Mark all read
						</Button>
					)}
				</div>

				<DropdownMenuSeparator />

				<div className="max-h-96 overflow-y-auto">
					{loading ? (
						<div className="flex justify-center py-4">
							<div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
						</div>
					) : notifications.length === 0 ? (
						<div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
					) : (
						notifications.map((notification) => (
							<DropdownMenuItem
								key={notification.id}
								className={`p-3 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
								onClick={() => !notification.read && markAsRead(notification.id)}>
								<div className="flex w-full items-start space-x-3">
									{notification.from_user && (
										<Avatar className="h-8 w-8">
											<AvatarImage src={notification.from_user.avatar} />
											<AvatarFallback>{notification.from_user.full_name?.charAt(0) || "U"}</AvatarFallback>
										</Avatar>
									)}
									<div className="min-w-0 flex-1">
										<p className="text-sm text-gray-900">{notification.content}</p>
										<p className="mt-1 text-xs text-gray-500">{new Date(notification.created_at).toLocaleDateString()}</p>
									</div>
									{!notification.read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>}
								</div>
							</DropdownMenuItem>
						))
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default NotificationsDropdown
