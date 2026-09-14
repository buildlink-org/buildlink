import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Settings, CheckCheck } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
	NotificationService,
	groupNotifications,
	getNotificationCategory,
	type GroupedNotification,
	type Notification,
} from "@/services/notificationService"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import NotificationPreferences from "./NotificationPreferences"
import { useCommentsStore } from "@/stores/commentsStore"
import { useMessagingStore } from "@/stores/messagingStore"

const EnhancedNotificationCenter: React.FC = () => {
	const { user } = useAuth()
	const { toast } = useToast()
	const navigate = useNavigate()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [page, setPage] = useState(0)
	const [activeCategory, setActiveCategory] = useState("all")
	const [showPreferences, setShowPreferences] = useState(false)
	const openComments = useCommentsStore((state) => state.openComments)
	const openConversation = useMessagingStore((state) => state.openConversation)
	const PAGE_SIZE = 20

	useEffect(() => {
		if (user) {
			setPage(0)
			setNotifications([])
			setHasMore(true)
			loadNotifications(0)
			setupRealtimeSubscription()
		}
	}, [user])

	const loadNotifications = async (pageNum: number = 0) => {
		if (!user) return
		const isInitial = pageNum === 0
		try {
			if (isInitial) setLoading(true)
			else setLoadingMore(true)

			const offset = pageNum * PAGE_SIZE
			const { data, error } = await NotificationService.getNotificationsPaginated(user.id, PAGE_SIZE, offset)
			if (error) throw error

			const normalizedData = (data || []).map((n: any) => ({
				...n,
				category: getNotificationCategory(n),
			}))

			if (isInitial) {
				setNotifications(normalizedData)
			} else {
				setNotifications((prev) => [...prev, ...normalizedData])
			}
			setHasMore(normalizedData.length === PAGE_SIZE)
		} catch (error) {
			console.error("Error loading notifications:", error)
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}

	const loadMore = () => {
		const nextPage = page + 1
		setPage(nextPage)
		loadNotifications(nextPage)
	}

	const setupRealtimeSubscription = () => {
		if (!user) return

		const channel = supabase
			.channel("notifications-center")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: `user_id=eq.${user.id}`,
				},
				async (payload) => {
					const rawNotification = payload.new as any
					const hydrated = await NotificationService.hydrateNotification(rawNotification)

					setNotifications((prev) => [hydrated, ...prev])

					toast({
						title: "New Notification",
						description: hydrated.content,
					})

					NotificationService.sendBrowserPushNotification("BuildLink Notification", {
						body: hydrated.content,
						tag: hydrated.id,
					})
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
		return getNotificationCategory(notification) === activeCategory
	})

	const groupedNotifications = useMemo(() => groupNotifications(filteredNotifications), [filteredNotifications])

	const getCategoryCount = (category: string) => {
		if (category === "all") return notifications.length
		if (category === "unread") return notifications.filter((n) => !n.read).length
		return notifications.filter((n) => getNotificationCategory(n) === category).length
	}

	const handleNotificationClick = async (n: any) => {
		if (!n.read) await markAsRead(n.id)

		const postId = n.post_id || n.entity_id || n.target_id || n.data?.post_id || n.data?.entity_id
		const userId = n.from_user?.id || n.user_id

		switch (n.type) {
			case "connection":
			case "follow":
			case "profile":
				if (userId) navigate(`/profile/${userId}`)
				else navigate(`/profile`)
				break

			case "message":
				openConversation(
					n.from_user?.id,
					n.from_user?.full_name,
					n.from_user?.avatar,
				)
				break

			case "comment":
			case "like":
			case "mention":
			case "post":
				if (postId) {
					openComments(postId)
				}
				navigate(`/feed`)
				break

			case "job":
			case "training":
				navigate(`/resource-hub`)
				break

			default:
				if (postId) {
					openComments(postId)
				}
				navigate(`/feed`)
		}
	}

	const categories = [
		{ key: "all", label: "All", count: getCategoryCount("all") },
		{ key: "unread", label: "Unread", count: getCategoryCount("unread") },
		{ key: "posts", label: "Posts", count: getCategoryCount("posts") },
		{ key: "connections", label: "Connections", count: getCategoryCount("connections") },
		{ key: "jobs", label: "Jobs", count: getCategoryCount("jobs") },
		{ key: "mentorship", label: "Mentorship", count: getCategoryCount("mentorship") },
		{ key: "general", label: "General", count: getCategoryCount("general") },
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
					<TabsList className="mb-4 grid grid-cols-7">
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
						) : groupedNotifications.length > 0 ? (
							<>
								{groupedNotifications.map((notification) => {
									const senderName = notification.from_user?.full_name || "User"
									const contentStartsWithName = notification.content
										?.toLowerCase()
										.startsWith(senderName.toLowerCase())

									return (
										<div
											key={notification.id}
											className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
												notification.read ? "bg-background border-border" : "bg-accent/30 border-accent-foreground/20 font-medium"
											}`}
											onClick={() => handleNotificationClick(notification)}
										>
											<div className="flex items-start gap-3 justify-between">
												<Avatar className="h-9 w-9 flex-shrink-0 mt-1">
													<AvatarImage src={notification.from_user?.avatar} />
													<AvatarFallback>{senderName[0]?.toUpperCase() || "U"}</AvatarFallback>
												</Avatar>

												<div className="flex-1">
													<div className="mb-1 flex items-center gap-2 flex-wrap">
														<Badge
															variant={notification.priority === "high" ? "destructive" : "secondary"}
															className="text-xs capitalize">
															{getNotificationCategory(notification)}
														</Badge>
														{notification.priority === "high" && (
															<Badge
																variant="destructive"
																className="text-xs">
																High Priority
															</Badge>
														)}
														{notification.groupCount && notification.groupCount > 1 && (
															<Badge
																variant="outline"
																className="text-xs">
																+{notification.groupCount - 1} more
															</Badge>
														)}
													</div>

													<p className="text-sm">
														{!contentStartsWithName && notification.from_user?.full_name && (
															<strong className="mr-1">{notification.from_user.full_name}</strong>
														)}
														{notification.content}
													</p>
													<p className="mt-1 text-xs text-muted-foreground">
														{new Date(notification.created_at).toLocaleString(undefined, {
															dateStyle: "medium",
															timeStyle: "short",
														})}
													</p>
												</div>

												{!notification.read && (
													<div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
												)}
											</div>
										</div>
									)
								})}
								{hasMore && (
									<div className="flex justify-center pt-2">
										<Button
											variant="outline"
											size="sm"
											onClick={loadMore}
											disabled={loadingMore}>
											{loadingMore ? (
												<>
													<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
													Loading...
												</>
											) : (
												"Load more"
											)}
										</Button>
									</div>
								)}
							</>
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

