import ProfileAbout from "@/components/feeds/ProfileAbout"
import ProfileActivity from "@/components/feeds/ProfileActivity"
import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from "@/types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"

const AboutActivitySection = ({ profile, userPosts, handleProfileUpdate, publicProfile }: { profile: UserProfile; userPosts: any[]; handleProfileUpdate?: () => void; publicProfile?: boolean }) => {
	const userType = profile?.user_type?.toLowerCase() || "student"

	// Colours mirror ProfileHeader — using semantic Tailwind tokens only
	const getColorConfig = () => {
		if (userType === "student") {
			return {
				bgColor: "bg-[#fde68a] dark:bg-yellow-950/60",
				borderColor: "border-[#fde68a] dark:border-yellow-800/50",
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-[#fed7aa] dark:bg-orange-950/60",
				borderColor: "border-[#fed7aa] dark:border-orange-800/50",
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-green-100 dark:bg-green-950/60",
				borderColor: "border-green-200 dark:border-green-800/50",
			}
		}
		return {
			bgColor: "bg-muted",
			borderColor: "border-border",
		}
	}

	const colorConfig = getColorConfig()

	return (
		<Card className={`border ${colorConfig.borderColor} ${colorConfig.bgColor} shadow-sm overflow-hidden`}>
			<CardContent className="p-0">
				<Tabs
				defaultValue="about"
				className="w-full rounded-lg">
				<div className="border-b border-border">
					<TabsList className="flex h-auto w-full border-0 bg-transparent p-0">
					<TabsTrigger
						value="about"
						className="flex-1 rounded-none bg-muted/50 px-6 py-3.5 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
						About
					</TabsTrigger>
					<TabsTrigger
						value="activity"
						className="flex-1 rounded-none bg-muted/50 px-6 py-3.5 text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
						Activity
					</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="about" className="mt-0 p-4 sm:p-5">
					<ProfileAbout
					profile={profile}
					publicProfile={publicProfile}
					handleProfileUpdate={handleProfileUpdate}
					/>
				</TabsContent>
				<TabsContent value="activity" className="mt-0 p-4 sm:p-5">
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