import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Building2, Calendar, Users, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { profileService } from "@/services/profileService"
import { useState, useEffect } from "react"

interface UserProfileProps {
	userId?: string
	onClose: () => void
}

const UserProfile = ({ userId, onClose }: UserProfileProps) => {
	const { user } = useAuth()
	const [profile, setProfile] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadProfile()
	}, [userId])

	const loadProfile = async () => {
		if (!userId && !user) return

		try {
			const targetId = userId || user?.id
			if (!targetId) return

			const { data, error } = await profileService.getProfile(targetId)
			if (error) throw error

			setProfile(data)
		} catch (error) {
			console.error("Error loading profile:", error)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
				<Card className="w-full max-w-md">
					<CardContent className="p-6 text-center">
						<div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
						<p className="mt-2 text-gray-600">Loading profile...</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!profile) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
				<Card className="w-full max-w-md">
					<CardContent className="p-6 text-center">
						<p className="text-gray-600">Profile not found</p>
						<Button
							onClick={onClose}
							className="mt-4">
							Close
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="max-h-[80vh] w-full max-w-md overflow-y-auto">
				<CardContent className="p-6">
					<div className="mb-4 flex items-start justify-between">
						<div className="flex items-center space-x-4">
							<Avatar className="h-16 w-16">
								<AvatarImage src={profile.avatar} />
								<AvatarFallback>
									{profile.full_name
										?.split(" ")
										.map((n: string) => n[0])
										.join("") || "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<h2 className="text-xl font-bold text-gray-900">{profile.full_name || "User"}</h2>
								<p className="text-gray-600">{profile.profession || "Professional"}</p>
								<p className="text-sm text-gray-500">{profile.organization || "Organization"}</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}>
							×
						</Button>
					</div>

					<div className="mb-6 space-y-3">
						<div className="flex items-center text-sm text-gray-600">
							<Building2 className="mr-2 h-4 w-4" />
							{profile.title || "No title specified"}
						</div>
						{profile.education_level && (
							<div className="flex items-center text-sm text-gray-600">
								<Calendar className="mr-2 h-4 w-4" />
								{profile.education_level}
							</div>
						)}
					</div>

					<div className="flex space-x-2">
						<Button className="flex-1">
							<Users className="mr-1 h-4 w-4" />
							Connect
						</Button>
						<Button
							variant="outline"
							className="flex-1">
							<MessageCircle className="mr-1 h-4 w-4" />
							Message
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default UserProfile
