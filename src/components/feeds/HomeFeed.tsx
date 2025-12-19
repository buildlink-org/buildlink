import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { profileService } from "@/services/profileService"
import { useToast } from "@/hooks/use-toast"
import CreatePostDialog from "@/components/CreatePostDialog"
import CommentsDialog from "@/components/CommentsDialog"
import RepostDialog from "@/components/RepostDialog"
import EnhancedSearchDialog from "@/components/EnhancedSearchDialog"
import ProfileEditForm from "@/components/ProfileEditForm"
import NotificationsList from "@/components/NotificationsList"
import EmptyState from "@/components/EmptyStates"
import PostCard from "@/components/PostCard"
import { useQuery } from "@tanstack/react-query"
import { SkeletonFeed, SkeletonPostCard } from "../ui/enhanced-skeleton"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { useDataSaver } from "@/contexts/DataSaverContext"
import { UserProfile as UserProfileType } from "@/types"
import UserProfile from "../UserProfile"

interface HomeFeedProps {
	activeFilter: string
}

const HomeFeed = ({ activeFilter }: HomeFeedProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const { dataSaverMode } = useDataSaver() // Now using the safe hook with fallbacks
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
	const [commentsDialog, setCommentsDialog] = useState<{
		isOpen: boolean
		postId: string
	}>({ isOpen: false, postId: "" })
	const [repostDialog, setRepostDialog] = useState<{
		isOpen: boolean
		post: any
	}>({ isOpen: false, post: null })
	const [searchDialog, setSearchDialog] = useState(false)
	const [profileEditDialog, setProfileEditDialog] = useState(false)
	const [showNotifications, setShowNotifications] = useState(false)

	// Use infinite scroll hook
	const {
		posts,
		loading: postsLoading,
		initialLoading,
		hasMore,
		error: postsError,
		postInteractions,
		refresh,
		observerRef,
		updatePostInteraction,
		updatePostCounts,
	} = useInfiniteScroll({
		category: activeFilter,
		limit: dataSaverMode ? 5 : 10, // Smaller batches in data saver mode
		onError: (error) => {
			toast({
				title: "Error",
				description: "Failed to load posts",
				variant: "destructive",
			})
		},
	})

	// SINGLE useQuery declaration with debugging
	const { data: statsData, isLoading: isLoadingStats } = useQuery({
		queryKey: ["profileStats"],
		queryFn: profileService.getStats,
		staleTime: 5 * 60 * 1000, // 5 minutes
		onSuccess: (data) => {
			console.log("Stats data received:", data)
			console.log("Professionals count:", data?.data?.professionalsCount)
			console.log("Companies count:", data?.data?.companiesCount)
		},
		onError: (error) => {
			console.error("Error fetching stats:", error)
		},
	})

	const handleLike = useCallback(
		async (postId: string) => {
			if (!user) {
				toast({
					title: "Authentication required",
					description: "Please sign in to like posts",
					variant: "destructive",
				})
				return
			}

			try {
				const { error, action } = await postsService.likePost(postId, user.id)

				if (error) {
					toast({
						title: "Error",
						description: "Failed to update like",
						variant: "destructive",
					})
					return
				}

				// Update interactions and counts using the hook functions
				updatePostInteraction(postId, { liked: action === "liked" })
				updatePostCounts(postId, {
					likes_count: action === "liked" ? (posts.find((p) => p.id === postId)?.likes_count || 0) + 1 : Math.max(0, (posts.find((p) => p.id === postId)?.likes_count || 0) - 1),
				})

				toast({
					title: "Success",
					description: action === "liked" ? "Post liked!" : "Post unliked!",
				})
			} catch (error) {
				console.error("Error handling like:", error)
			}
		},
		[user, toast, updatePostInteraction, updatePostCounts, posts],
	)

	const handleComment = (postId: string) => {
		setCommentsDialog({ isOpen: true, postId })
	}

	const handleRepost = (post: any) => {
		if (!user) {
			toast({
				title: "Authentication required",
				description: "Please sign in to repost",
				variant: "destructive",
			})
			return
		}
		setRepostDialog({ isOpen: true, post })
	}

	const handleShare = async (postId: string) => {
		try {
			const { data, error } = await postsService.sharePost(postId)

			if (error) throw error

			if (navigator.share) {
				await navigator.share({
					title: data.title,
					text: data.text,
					url: data.url,
				})
			} else {
				await navigator.clipboard.writeText(data.url)
				toast({
					title: "Success",
					description: "Post URL copied to clipboard!",
				})
			}
		} catch (error) {
			console.error("Error sharing post:", error)
			toast({
				title: "Error",
				description: "Failed to share post",
				variant: "destructive",
			})
		}
	}

	const handleUserClick = (userprofile: UserProfileType) => {
		setSelectedUserId(userprofile?.id)
	}

	const handleCreatePost = useCallback(() => {
		console.log("Post created, refreshing feed...")
		refresh()
	}, [refresh])

	const handlePostUpdated = useCallback(() => {
		console.log("Post updated, refreshing feed...")
		refresh()
	}, [refresh])

	const handlePostDeleted = useCallback(() => {
		console.log("Post deleted, refreshing feed...")
		refresh()
	}, [refresh])

	const handleRepostComplete = useCallback(() => {
		refresh()
	}, [refresh])

	if (initialLoading) {
		return (
			<div className="space-y-6">
				<div className="rounded-lg bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
					<div className="mb-4 flex items-start justify-between">
						<div>
							<h2 className="mb-2 text-2xl font-bold">Welcome to BuildLink Kenya</h2>
							<p className="text-primary-foreground/90">Connect with professionals, discover opportunities, and grow your career in Kenya's construction industry.</p>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold">
								{isLoadingStats ? (
									<div className="mx-auto h-8 w-24 animate-pulse rounded bg-white/20" />
								) : (
									statsData?.data?.studentsCount?.toLocaleString() ?? "0" // Fixed: added toLocaleString
								)}
							</div>
							<div className="text-sm text-primary-foreground/80">Students</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold">
								{isLoadingStats ? (
									<div className="mx-auto h-8 w-24 animate-pulse rounded bg-white/20" />
								) : (
									statsData?.data?.professionalsCount?.toLocaleString() ?? "0" // Fixed: added toLocaleString
								)}
							</div>
							<div className="text-sm text-primary-foreground/80">Professionals</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold">
								{isLoadingStats ? (
									<div className="mx-auto h-8 w-24 animate-pulse rounded bg-white/20" />
								) : (
									statsData?.data?.companiesCount?.toLocaleString() ?? "0" // Fixed: added toLocaleString
								)}
							</div>
							<div className="text-sm text-primary-foreground/80">Companies</div>
						</div>
					</div>
				</div>

				<SkeletonFeed count={dataSaverMode ? 3 : 5} />
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Stats Banner */}
			<div className="rounded-lg bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
				<div className="mb-4 flex items-start justify-between">
					<div>
						<h2 className="mb-2 text-2xl font-bold">Welcome to BuildLink Kenya</h2>
						<p className="text-primary-foreground/90">Connect with professionals, discover opportunities, and grow your career in Kenya's construction industry.</p>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold">{isLoadingStats ? <div className="mx-auto h-8 w-24 animate-pulse rounded bg-white/20" /> : statsData?.data?.studentsCount?.toLocaleString() ?? "0"}</div>
						<div className="text-sm text-primary-foreground/80">Students</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold">{isLoadingStats ? <div className="mx-auto h-8 w-24 animate-pulse rounded bg-white/20" /> : statsData?.data?.professionalsCount?.toLocaleString() ?? "0"}</div>
						<div className="text-sm text-primary-foreground/80">Professionals</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold">{isLoadingStats ? <div className="mx-auto h-8 w-24 animate-pulse rounded bg-white/20" /> : statsData?.data?.companiesCount?.toLocaleString() ?? "0"}</div>
						<div className="text-sm text-primary-foreground/80">Companies</div>
					</div>
				</div>
			</div>

			{/* Notifications Panel */}
			{showNotifications && user && (
				<div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
					<NotificationsList />
				</div>
			)}

			{/* Create Post Section */}
			{user && (
				<div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
					<CreatePostDialog onPostCreated={handleCreatePost} />
				</div>
			)}

			{/* Filter Results Info */}
			{activeFilter !== "latest" && (
				<div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
					<p className="text-sm text-muted-foreground">
						Showing {posts.length} {activeFilter} posts
					</p>
				</div>
			)}

			{/* Posts Feed */}
			<div className="space-y-4">
				{posts.length > 0 ? (
					<>
						{posts.map((post, index) => (
							<PostCard
								key={post.id}
								post={post}
								isLiked={postInteractions[post.id]?.liked || false}
								onLike={() => handleLike(post.id)}
								onComment={() => handleComment(post.id)}
								onPostUpdated={handlePostUpdated}
								onPostDeleted={handlePostDeleted}
								dataSaver={dataSaverMode}
								priority={index < 2} // First 2 posts get priority loading
							/>
						))}

						{/* Infinite scroll trigger */}
						{hasMore && (
							<div
								ref={observerRef}
								className="flex justify-center py-8">
								{postsLoading ? <SkeletonPostCard /> : <div className="text-sm text-muted-foreground">Loading more posts...</div>}
							</div>
						)}

						{!hasMore && posts.length > 0 && (
							<div className="py-8 text-center text-muted-foreground">
								<p className="text-sm">You've reached the end! 🎉</p>
								<p className="mt-1 text-xs">Check back later for new posts</p>
							</div>
						)}
					</>
				) : (
					<EmptyState
						type="posts"
						onAction={user ? handleCreatePost : undefined}
					/>
				)}
			</div>

			{/* Dialogs */}
			{selectedUserId && (
				<UserProfile
					userId={selectedUserId}
					onClose={() => setSelectedUserId(null)}
				/>
			)}

			<CommentsDialog
				isOpen={commentsDialog.isOpen}
				onClose={() => setCommentsDialog({ isOpen: false, postId: "" })}
				postId={commentsDialog.postId}
			/>

			<RepostDialog
				isOpen={repostDialog.isOpen}
				onClose={() => setRepostDialog({ isOpen: false, post: null })}
				post={repostDialog.post}
				onRepost={handleRepostComplete}
			/>

			<EnhancedSearchDialog
				isOpen={searchDialog}
				onClose={() => setSearchDialog(false)}
			/>

			<ProfileEditForm
				isOpen={profileEditDialog}
				onClose={() => setProfileEditDialog(false)}
				onSave={() => {
					// Refresh user data if needed
					toast({
						title: "Profile Updated",
						description: "Your profile has been successfully updated!",
					})
				}}
			/>
		</div>
	)
}

export default HomeFeed
