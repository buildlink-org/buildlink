import ProfileAbout from "@/components/feeds/ProfileAbout"
import ProfileActivity from "@/components/feeds/ProfileActivity"
import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from "@/types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"

const AboutActivitySection = ({ profile, userPosts, handleProfileUpdate, publicProfile }: { profile: UserProfile; userPosts: Record<string, unknown>[]; handleProfileUpdate?: () => void; publicProfile?: boolean }) => {
	const userType = profile?.user_type?.toLowerCase() || "student"

	const getColorConfig = () => {
		if (userType === "student") {
			return {
				bgColor: "bg-student-100 dark:bg-student-900/50",
				borderColor: "border-student-200 dark:border-student-800",
				activeTabColor: "data-[state=active]:bg-[#fde68a] dark:data-[state=active]:bg-yellow-900",
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-professional-100 dark:bg-professional-900/50",
				borderColor: "border-professional-200 dark:border-professional-800",
				activeTabColor: "data-[state=active]:bg-[#fed7aa] dark:data-[state=active]:bg-orange-900",
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-company-100 dark:bg-company-900/50",
				borderColor: "border-company-200 dark:border-company-800",
				activeTabColor: "data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900",
			}
		}
		return {
			bgColor: "bg-muted",
			borderColor: "border-border",
			activeTabColor: "data-[state=active]:bg-muted",
		}
	}

	const colorConfig = getColorConfig()
	const tabClassName = `h-full flex-1 rounded-none border-b-2 border-transparent px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground ${colorConfig.activeTabColor} bg-white dark:bg-slate-950`

	return (
		<Card className={`border ${colorConfig.borderColor} ${colorConfig.bgColor} shadow-sm overflow-hidden`}>
			<CardContent className="p-0">
				<Tabs
				defaultValue="about"
				className="w-full rounded-lg">
				<div className="border-b border-border">
					<TabsList className="flex h-11 w-full border-0 bg-transparent p-0">
					<TabsTrigger
						value="about"
						className={tabClassName}>
						Bio
					</TabsTrigger>
					<TabsTrigger
						value="activity"
						className={tabClassName}>
						Activity
					</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="about" className="mt-0 min-h-56 p-4 sm:p-5">
					<ProfileAbout
					profile={profile}
					publicProfile={publicProfile}
					handleProfileUpdate={handleProfileUpdate}
					/>
				</TabsContent>
				<TabsContent value="activity" className="mt-0 min-h-56 p-4 sm:p-5">
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