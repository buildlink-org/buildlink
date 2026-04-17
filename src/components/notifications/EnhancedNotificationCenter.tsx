import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Settings, CheckCheck } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationService } from "@/services/notificationService"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import NotificationPreferences from "./NotificationPreferences"
import { useCommentsStore } from "@/stores/commentsStore"

interface Notification {
	id: string
	type: string
	category: string
	priority: string
	content: string
	read: boolean
	created_at: string
	post_id?: string 
	from_user?: {
		full_name: string
		avatar: string
	}
}

const EnhancedNotificationCenter: React.FC = () => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [loading, setLoading] = useState(true)
	const [activeCategory, setActiveCategory] = useState("all")
	const [showPreferences, setShowPreferences] = useState(false)
	const openComments = useCommentsStore((state) => state.openComments)

	useEffect(() => {
		if (user) {
			loadNotifications()
			setupRealtimeSubscription()
		}
	}, [user])

	const loadNotifications = async () => {
		if (!user) return
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

	const setupRealtimeSubscription = () => {
		if (!user) return

		const channel = supabase
			.channel("notifications")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: `user_id=eq.${user.id}`,
				},
				(payload) => {
					const newNotification = payload.new as Notification
					setNotifications((prev) => [newNotification, ...prev])

					// Show toast for high priority notifications
					if (newNotification.priority === "high") {
						toast({
							title: "New Notification",
							description: newNotification.content,
						})
					}
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
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
			console.error("Error marking all as read:", error)
			toast({
				title: "Error",
				description: "Failed to mark notifications as read",
				variant: "destructive",
			})
		}
	}

	const filteredNotifications = notifications.filter((notification) => {
		if (activeCategory === "all") return true
		if (activeCategory === "unread") return !notification.read
		return notification.category === activeCategory
	})

	const getCategoryCount = (category: string) => {
		if (category === "all") return notifications.length
		if (category === "unread") return notifications.filter((n) => !n.read).length
		return notifications.filter((n) => n.category === category).length
	}

	const categories = [
		{ key: "all", label: "All", count: getCategoryCount("all") },
		{ key: "unread", label: "Unread", count: getCategoryCount("unread") },
		{ key: "general", label: "General", count: getCategoryCount("general") },
		{ key: "posts", label: "Posts", count: getCategoryCount("posts") },
		{ key: "connections", label: "Connections", count: getCategoryCount("connections") },
		{ key: "mentorship", label: "Mentorship", count: getCategoryCount("mentorship") },
	]

	if (showPreferences) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Button
						variant="ghost"
						onClick={() => setShowPreferences(false)}
						className="text-sm">
						← Back to Notifications
					</Button>
				</div>
				<NotificationPreferences />
			</div>
		)
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
					</CardTitle>
					<div className="flex gap-2">
						{getCategoryCount("unread") > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={markAllAsRead}>
								<CheckCheck className="mr-2 h-4 w-4" />
								Mark all read
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowPreferences(true)}>
							<Settings className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Tabs
					value={activeCategory}
					onValueChange={setActiveCategory}>
					<TabsList className="mb-4 grid grid-cols-6">
						{categories.map((category) => (
							<TabsTrigger
								key={category.key}
								value={category.key}
								className="text-xs">
								{category.label}
								{category.count > 0 && (
									<Badge
										variant="secondary"
										className="ml-1 text-xs">
										{category.count}
									</Badge>
								)}
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent
						value={activeCategory}
						className="space-y-3">
						{loading ? (
							<div className="flex justify-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
							</div>
						) : filteredNotifications.length > 0 ? (
							filteredNotifications.map((notification) => (
								<div
									key={notification.id}
									className={`p-3 rounded-lg border cursor-pointer transition-colors ${notification.read ? "bg-background border-border" : "bg-accent border-accent-foreground/20"}`}
									onClick={async () => {
										if (!notification.read) {
											await markAsRead(notification.id)
										}
									}}
								>

									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="mb-1 flex items-center gap-2">
												<Badge
													variant={notification.priority === "high" ? "destructive" : "secondary"}
													className="text-xs">
													{notification.category}
												</Badge>
												{notification.priority === "high" && (
													<Badge
														variant="destructive"
														className="text-xs">
														High Priority
													</Badge>
												)}
											</div>
											<p className="text-sm">{notification.content}</p>
											<p className="mt-1 text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
										</div>
										{!notification.read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
									</div>
								</div>
							))
						) : (
							<div className="py-8 text-center">
								<Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
								<h3 className="mb-2 text-lg font-semibold text-muted-foreground">No notifications</h3>
								<p className="text-muted-foreground">{activeCategory === "unread" ? "You're all caught up!" : `No ${activeCategory === "all" ? "" : activeCategory + " "}notifications found.`}</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}

export default EnhancedNotificationCenter
