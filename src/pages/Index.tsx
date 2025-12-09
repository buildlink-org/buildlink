import { useState, useCallback, ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import TopBar from "@/components/TopBar"
import HomeFeed from "@/components/feeds/HomeFeed"
// import MentorshipHub from "@/components/feeds/MentorshipHub";
import SkillUpFeed from "@/components/feeds/SkillUpFeed"
import PostCreate from "@/components/feeds/PostCreate"
import ProfileBoard from "@/components/feeds/ProfileBoard"
import ResponsiveNavigation from "@/components/ResponsiveNavigation"
import ContentFilters from "@/components/ContentFilters"
import { OfflineIndicator } from "@/components/OfflineIndicator"
import FloatingMessagingWidget from "@/components/DirectMessages/FloatingMessageWidget"

interface IndexProps {
	customContent?: ReactNode
	showNavigation?: boolean
	showFilters?: boolean
	initialTab?: string
	isPublicProfile?: boolean
}

const Index: React.FC<IndexProps> = ({ customContent, showNavigation = true, showFilters = true, initialTab = "home", isPublicProfile = false }) => {
	const { user } = useAuth()
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState(initialTab)
	const [activeFilter, setActiveFilter] = useState("latest")
	const [loading, setLoading] = useState(false)

	const handleTabChange = useCallback(
		(tab: string) => {
			// If we're on a public profile page and user clicks navigation, navigate to the appropriate route
			if (isPublicProfile) {
				switch (tab) {
					case "home":
						navigate("/")
						break
					// case "mentorship":
					//   navigate("/mentorship");
					//   break;
					case "post":
						navigate("/post")
						break
					case "skillup":
						navigate("/skillup")
						break
					case "profile":
						navigate("/profile")
						break
					default:
						navigate("/")
				}
				return
			}

			// Normal tab switching for non-public profile pages
			setLoading(true)
			setActiveTab(tab)
			// Reset filter when changing tabs
			if (tab === "home" || tab === "skillup") {
				setActiveFilter("latest")
			}
			// Simulate loading time for smooth transition
			setTimeout(() => setLoading(false), 300)
		},
		[isPublicProfile, navigate],
	)

	const handleLogoClick = () => {
		if (isPublicProfile) {
			navigate("/")
			return
		}
		handleTabChange("home")
		setActiveFilter("latest")
	}

	const renderActiveContent = () => {
		switch (activeTab) {
			case "home":
				return <HomeFeed activeFilter={activeFilter} />
			// case "mentorship":
			//   return <MentorshipHub />;
			case "post":
				return <PostCreate />
			case "skillup":
				return <SkillUpFeed activeFilter={activeFilter} />
			case "profile":
				return <ProfileBoard /> 
			case "publicProfile":
				return customContent || <ProfileBoard />
			default:
				return <HomeFeed activeFilter={activeFilter} />
		}
	}

	const shouldShowFilters = showFilters && (activeTab === "home" || activeTab === "skillup")

	return (
		<div className="min-h-screen bg-background">
			<TopBar
				onLogoClick={handleLogoClick}
				loading={loading}
			/>
			<OfflineIndicator />

			{/* Main Content */}
			<div className="relative top-12 mx-auto grid h-screen w-full max-w-screen-xl grid-cols-12 px-4 pb-20 md:pb-8">
				{showNavigation && (
					<div className="col-span-3 bg-white">
						<ResponsiveNavigation loading={loading} />
					</div>
				)}
				<div className={`xl:col-span-7 lg:col-span-9 col-span-12 ${showNavigation ? "md:col-start-4" : ""}`}>
					{/* Content Filters */}
					{shouldShowFilters && (
						<div className="mb-4">
							<ContentFilters
								activeFilter={activeFilter}
								onFilterChange={setActiveFilter}
								filterType={activeTab}
							/>
						</div>
					)}

					{/* Content Area */}
					<div className={`transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}>{renderActiveContent()}</div>
				</div>
			</div>
			{user && <FloatingMessagingWidget />}
		</div>
	)
}

export default Index
