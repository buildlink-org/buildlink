import ProfileAbout from "@/components/feeds/ProfileAbout"
import ProfileActivity from "@/components/feeds/ProfileActivity"
import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from "@/types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"

const AboutActivitySection = ({ profile, userPosts, handleProfileUpdate, publicProfile }: { profile: UserProfile; userPosts: any[]; handleProfileUpdate?: () => void; publicProfile?: boolean }) => {
	const userType = profile?.user_type?.toLowerCase() || "student"

	// Get account-type-specific colors matching ProfileHeader
	const getColorConfig = () => {
		if (userType === "student") {
			return {
				bgColor: "bg-yellow-100",
				borderColor: "border-yellow-50",
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-[#FFCBA4]",
				borderColor: "border-[#FFCBA4]",
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-green-200",
				borderColor: "border-green-200",
			}
		}
		// Default fallback
		return {
			bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
			borderColor: "border-blue-200",
		}
	}

	const colorConfig = getColorConfig()

	return (
		<Card className="border border-border bg-card shadow-sm">
			<CardContent className="p-0">
				<Tabs
					defaultValue="about"
					className={`${colorConfig.bgColor} w-full rounded-lg`}>
					<div className="border-b border-border">
						<TabsList className="flex h-auto w-full border-0 bg-transparent p-0">
							<TabsTrigger
								value="about"
								className={`flex-1 rounded-tl-lg border border-b-0 border-transparent bg-transparent bg-white px-6 py-3 text-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground`}>
								About
							</TabsTrigger>
							<TabsTrigger
								value="activity"
								className="flex-1 border border-b-0 border-transparent bg-transparent bg-white px-6 py-3 text-foreground/80 data-[state=active]:bg-transparent data-[state=active]:text-foreground">
								Activity
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent
						value="about"
						className="mt-0 p-4">
						<ProfileAbout
							profile={profile}
							publicProfile={publicProfile}
							handleProfileUpdate={handleProfileUpdate}
						/>
					</TabsContent>
					<TabsContent
						value="activity"
						className="mt-0 p-4">
						<ProfileActivity
							userPosts={userPosts}
							noCard={true}
						/>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}

export default AboutActivitySection
