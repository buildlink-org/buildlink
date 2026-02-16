import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, Shield, UserCheck } from "lucide-react"
import { profileService } from "@/services/profileService"
import { useState, useEffect } from "react"
import { PrivacySettingsDialog } from "./PrivacySettingsDialog"
import { useNavigate } from "react-router-dom"
import { UserProfile } from "@/types"
import { useIsAdmin } from "@/hooks/useIsAdmin"

const UserProfileButton = () => {
	const { user, signOut } = useAuth()
	const navigate = useNavigate()
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [showPrivacySettings, setShowPrivacySettings] = useState(false)

	useEffect(() => {

		if (user) {
			loadProfile()
		}
	}, [user])

	const loadProfile = async () => {
		if (!user) return

		try {
			const { data, error } = await profileService.getProfile(user.id)
			if (error) throw error
			setProfile(data)
		} catch (error) {
			console.error("Error loading profile:", error)
		}
	}

	if (!user) return (
		<a href="/auth">
			<Button
				variant="cta"
				size="sm">
				Log In
			</Button>
		</a>
	)

	const handleSignOut = async () => {
		await signOut()
	}

	const handleSettingsClick = () => {
		navigate("/profile/settings")
	}

	const handleProfileClick = () => {
		if (user) {
			navigate(`/profile/${user.id}`)
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-10 w-10 rounded-full">
					<Avatar className="h-10 w-10">
						<AvatarImage src={profile?.avatar} />
						<AvatarFallback>
							{profile?.full_name
								?.split(" ")
								.map((n: string) => n[0])
								.join("") || "U"}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-56">
				<div className="flex flex-col space-y-1 p-2">
					<p className="text-sm font-medium">{profile?.full_name || "User"}</p>
					<p className="text-xs text-gray-500">{user.email}</p>
					{profile?.profession && <p className="text-xs text-gray-500">{profile.profession}</p>}
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleProfileClick}>
					<UserCheck className="mr-2 h-4 w-4" />
					Profile
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleSettingsClick}>
					<Settings className="mr-2 h-4 w-4" />
					Profile Settings
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setShowPrivacySettings(true)}>
					<Shield className="mr-2 h-4 w-4" />
					Privacy Settings
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOut className="mr-2 h-4 w-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>

			<PrivacySettingsDialog
				open={showPrivacySettings}
				onOpenChange={setShowPrivacySettings}
			/>
		</DropdownMenu>
	)
}

export default UserProfileButton
