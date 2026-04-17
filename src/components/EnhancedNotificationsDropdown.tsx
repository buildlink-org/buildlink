import { useState, useEffect } from "react"
import {
	Bell,
	Check,
	User,
	MessageCircle,
	Briefcase,
	BookOpen,
	Heart,
	MessageSquare,
	UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationService } from "@/services/notificationService"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useMessagingStore } from "@/stores/messagingStore"
import { useCommentsStore } from "@/stores/commentsStore"


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
	const navigate = useNavigate()

	const [notifications, setNotifications] = useState<any[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(false)
	const [activeCategory, setActiveCategory] = useState("all")
	const [isOpen, setIsOpen] = useState(false)

	const openConversation = useMessagingStore((state) => state.openConversation)
	const openComments = useCommentsStore.getState().openComments	
	

	const typeIcons: Record<string, JSX.Element> = {
		message: <MessageSquare className="h-5 w-5 text-primary" />,
		comment: <MessageCircle className="h-5 w-5 text-primary" />,
		like: <Heart className="h-5 w-5 text-primary" />,
		mention: <MessageSquare className="h-5 w-5 text-primary" />,
		connection: <UserPlus className="h-5 w-5 text-primary" />,
		job: <Briefcase className="h-5 w-5 text-primary" />,
		training: <BookOpen className="h-5 w-5 text-primary" />,
	}

	useEffect(() => {
		if (user) {
			loadNotifications()
			const interval = setInterval(loadNotifications, 30000)
			return () => clearInterval(interval)
		}
	}, [user])

	const loadNotifications = async () => {
		if (!user) return

		try {
			setLoading(true)
			const { data, error } = await NotificationService.getNotification(user.id)
			if (error) return

			setNotifications(data || [])
			setUnreadCount((data || []).filter((n) => !n.read).length)
		} finally {
			setLoading(false)
		}
	}

	const markAsRead = async (id: string) => {
		await NotificationService.markAsRead(id)
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
		setUnreadCount((prev) => Math.max(0, prev - 1))
	}

	const markAllAsRead = async () => {
		if (!user) return
		await NotificationService.markAllAsRead(user.id)
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
		setUnreadCount(0)
	}

	// Category mapping
	const categoryMap: Record<string, string> = {
		follows: "connection",
		comments: "comment",
		jobs: "job",
		training: "training",
	}

	const filteredNotifications = notifications
		.filter((n) => {
			if (activeCategory === "all") return true
			return n.type === categoryMap[activeCategory]
		})
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

	//Handle click routing
	const handleNotificationClick = async (n: any) => {
		if (!n.read) await markAsRead(n.id)

		switch (n.type) {
			case "connection":
				navigate(`/profile/${n.from_user?.id}`)
				break
			case "message":
				openConversation(
					n.from_user?.id,
					n.from_user?.full_name,
					n.from_user?.avatar
				)
				break
			case "comment":
		case "like": {
			const postId = n.post_id || n.entity_id || n.target_id

			if (!postId) {
				console.warn("Missing postId in notification:", n)
				return
			}

			openComments(postId)
			break
		}
			case "job":
				navigate(`/jobs/${n.job_id}`)
				break
			case "training":
				navigate(`/training/${n.training_id}`)
				break
			default:
				navigate(`/notifications`)
		}

		setIsOpen(false)
	}

	if (!user) {
		return (
			<Button variant="ghost" size="icon" disabled>
				<Bell className="h-5 w-5" />
			</Button>
		)
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-96 p-0">
				{/* Header */}
				<div className="flex justify-between items-center border-b p-4">
					<h3 className="font-semibold">Notifications</h3>
					{unreadCount > 0 && (
						<Button variant="ghost" size="sm" onClick={markAllAsRead}>
							<Check className="mr-1 h-3 w-3" />
							Mark all read
						</Button>
					)}
				</div>

				{/* Tabs with icons + labels */}
				<Tabs value={activeCategory} onValueChange={setActiveCategory}>
					<TabsList className="grid w-full grid-cols-5">
						{notificationCategories.map((cat) => {
							const Icon = cat.icon
							return (
								<TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-1 text-xs">
									<Icon className="h-3 w-3" />
									<span>{cat.label}</span>
								</TabsTrigger>
							)
						})}
					</TabsList>

					{/* Notifications */}
					<div className="max-h-96 overflow-y-auto">
						{loading ? (
							<div className="flex justify-center py-8">
								<div className="h-6 w-6 animate-spin border-b-2 border-primary rounded-full" />
							</div>
						) : filteredNotifications.length === 0 ? (
							<div className="p-8 text-center text-sm text-muted-foreground">
								No notifications yet
							</div>
						) : (
							filteredNotifications.map((n) => {
								const name =
									n.from_user?.full_name
										? n.from_user.full_name.charAt(0).toUpperCase() +
										  n.from_user.full_name.slice(1)
										: "User"

								return (
									<div
										key={n.id}
										onClick={() => handleNotificationClick(n)}
										className={`flex justify-between p-4 border-b cursor-pointer hover:bg-accent ${
											!n.read ? "bg-accent/30" : ""
										}`}
									>
										<div className="flex gap-2">
											{/* Icon */}
											<div>{typeIcons[n.type]}</div>

											{/* Avatar */}
											<Avatar className="h-8 w-8">
												<AvatarImage src={n.from_user?.avatar} />
												<AvatarFallback>{name[0]}</AvatarFallback>
											</Avatar>

											{/* Content */}
											<div>
												<p className="text-sm">
													<strong>{name}</strong> {n.content}
												</p>
												<p className="text-xs text-muted-foreground">
													{new Date(n.created_at).toLocaleDateString()}
												</p>
											</div>
										</div>

										{/* Unread dot */}
										{!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-2" />}
									</div>
								)
							})
						)}
					</div>
				</Tabs>
			</PopoverContent>
		</Popover>
	)
}

export default EnhancedNotificationsDropdown