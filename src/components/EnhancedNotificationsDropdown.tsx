import { useState, useEffect } from "react"
import { Bell, Check, User, MessageCircle, Briefcase, BookOpen, Heart, MessageSquare, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationService } from "@/services/notificationService"
import { useToast } from "@/hooks/use-toast"
import { useNotificationsStore } from "@/stores/notificationStore"

const notificationCategories = [
	{ id: "all", label: "All", icon: Bell },
	{ id: "follows", label: "Follows", icon: User },
	{ id: "comments", label: "Comments", icon: MessageCircle },
	{ id: "jobs", label: "Jobs", icon: Briefcase },
	{ id: "training", label: "Training", icon: BookOpen },
]

const EnhancedNotificationsDropdown = () => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [notifications, setNotifications] = useState<any[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(false)
	const [activeCategory, setActiveCategory] = useState("all")
	const [isOpen, setIsOpen] = useState(false)

	const typeIcons: Record<string, JSX.Element> = {
		message: <MessageSquare className="mr-1 inline h-5 w-5 text-primary" />,
		comment: <MessageCircle className="mr-1 inline h-5 w-5 text-primary" />,
		like: <Heart className="mr-1 inline h-5 w-5 text-primary" />,
		mention: <MessageSquare className="mr-1 inline h-5 w-5 text-primary" />,
		connection: <UserPlus className="mr-1 inline h-5 w-5 text-primary" />,
		reminder: <Bell className="mr-1 inline h-5 w-5 text-primary" />,
	}

	const notification = useNotificationsStore((state) => state.notifications)
	const unreadCounts = useNotificationsStore((state) => state.unreadCount)

	useEffect(() => {
		if (user) {
			loadNotifications()
			// Set up real-time subscription for notifications
			const interval = setInterval(loadNotifications, 30000) // Poll every 30 seconds
			return () => clearInterval(interval)
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

	const getFilteredNotifications = () => {
		// Map plural categories to the exact notification types
		const categoryMap = {
			comments: "comment",
			messages: "message",
			likes: "like",
			mentions: "mention",
		}

		// Determine the type to filter
		const type = categoryMap[activeCategory] || activeCategory

		// Filter and sort notifications
		return notifications
			.filter((notification) => {
				if (activeCategory === "all") return true // return all
				return notification.type === type // match type
			})
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
	}

	const filteredNotifications = getFilteredNotifications()

	const getCategoryUnreadCount = (category: string) => {
		if (category === "all") return unreadCount
		return notifications.filter((n) => !n.read && n.type === category).length
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
	console.log({ notification, notifications })

	return (
		<Popover
			open={isOpen}
			onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
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
			</PopoverTrigger>

			<PopoverContent
				align="end"
				className="w-96 p-0">
				<div className="flex items-center justify-between border-b p-4">
					<h3 className="font-semibold">Notifications</h3>
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

				<Tabs
					value={activeCategory}
					onValueChange={setActiveCategory}
					className="w-full">
					<TabsList className="grid h-9 w-full grid-cols-5">
						{notificationCategories.map((category) => {
							const Icon = category.icon
							const categoryUnreadCount = getCategoryUnreadCount(category.id)

							return (
								<TabsTrigger
									key={category.id}
									value={category.id}
									className="relative px-2 py-1 text-xs">
									<Icon className="mr-1 h-3 w-3" />
									<span className="hidden sm:inline">{category.label}</span>
									{categoryUnreadCount > 0 && (
										<Badge
											variant="secondary"
											className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0 text-xs">
											{categoryUnreadCount > 9 ? "9+" : categoryUnreadCount}
										</Badge>
									)}
								</TabsTrigger>
							)
						})}
					</TabsList>

					<div className="max-h-96 overflow-y-auto">
						{loading ? (
							<div className="flex justify-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
							</div>
						) : filteredNotifications.length === 0 ? (
							<div className="p-8 text-center text-sm text-muted-foreground">No {activeCategory !== "all" ? activeCategory : ""} notifications yet</div>
						) : (
							filteredNotifications.map((notification) => (
								<div
									key={notification.id}
									className={`flex p-4 border-b cursor-pointer hover:bg-accent  transition-colors  ${!notification.read ? "bg-accent/30" : ""}`}
									onClick={() => !notification.read && markAsRead(notification.id)}>
									<h3 className="flex items-center px-2 font-bold italic text-primary">{typeIcons[notification.type] || null}</h3>
									<div className="w-full flex-1 items-start space-x-3">
										<div className="flex gap-2">
											{notification.from_user && (
												<Avatar className="h-8 w-8">
													<AvatarImage src={notification.from_user.avatar} />
													<AvatarFallback>{notification.from_user.full_name?.charAt(0) || "U"}</AvatarFallback>
												</Avatar>
											)}
											<h4>{notification.from_user.full_name}</h4>
										</div>

										<div className="flex min-w-0 items-center justify-between">
											<p className="text-sm">{notification.content}</p>
											<p className="mt-1 text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleDateString()}</p>
										</div>
										{!notification.read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div>}
									</div>
								</div>
							))
						)}
					</div>
				</Tabs>
			</PopoverContent>
		</Popover>
	)
}

export default EnhancedNotificationsDropdown
