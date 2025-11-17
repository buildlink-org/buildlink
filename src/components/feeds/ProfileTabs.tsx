import { UserProfile } from "@/types"
import { Card, CardContent } from "../ui/card"

interface ProfileTabsProps {
	activeTab: string
	setActiveTab: (tab: string) => void
	postsCount: number
	profile: UserProfile
}

const ProfileTabs = ({ activeTab, setActiveTab, postsCount, profile }: ProfileTabsProps) => (
	<Card className="border-0 shadow-sm">
		<CardContent className="p-0">
			<div className="flex border-b">
				<button
					onClick={() => setActiveTab("about")}
					className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "about" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
					About
				</button>
				{profile.user_type !== "company" && (
					<button
						onClick={() => setActiveTab("Connection")}
						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "Connection" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
						Connections ({postsCount})
					</button>
				)}

				{profile.user_type === "company" && (
					<button
						onClick={() => setActiveTab("People")}
						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "People" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
						People ({postsCount})
					</button>
				)}
				<button
					onClick={() => setActiveTab("activity")}
					className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "activity" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
					Activity ({postsCount})
				</button>
				{profile.user_type === "company" && (
					<button
						onClick={() => setActiveTab("activity")}
						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "Events" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
						Events
					</button>
				)}
			</div>
		</CardContent>
	</Card>
)

export default ProfileTabs
