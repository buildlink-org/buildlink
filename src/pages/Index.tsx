import { useState, useCallback, ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import TopBar from "@/components/TopBar"
import CorePageGrid from "@/components/CorePageGrid"
import HomeFeed from "@/components/feeds/HomeFeed"
import SkillUpFeed from "@/components/feeds/SkillUpFeed"
import PostCreate from "@/components/feeds/PostCreate"
import ProfileBoard from "@/components/feeds/ProfileBoard"
import ResponsiveNavigation from "@/components/ResponsiveNavigation"
import ContentFilters from "@/components/ContentFilters"
import { OfflineIndicator } from "@/components/OfflineIndicator"
import FloatingMessagingWidget from "@/components/DirectMessages/FloatingMessageWidget"
import SuggestedConnections from "@/components/profile/SuggestedConnections"

interface IndexProps {
customContent?: ReactNode
showNavigation?: boolean
showFilters?: boolean
hideSkillUpFilters?: boolean
initialTab?: string
isPublicProfile?: boolean
}

const Index: React.FC<IndexProps> = ({ customContent, showNavigation = true, showFilters = true, hideSkillUpFilters = false, initialTab = "home", isPublicProfile = false }) => {
const { user } = useAuth()
const navigate = useNavigate()
const [activeTab, setActiveTab] = useState(initialTab)
const [activeFilter, setActiveFilter] = useState("latest")
const [loading, setLoading] = useState(false)

const hasHomeSuggestions = activeTab === "home" && !!user

const handleTabChange = useCallback(
(tab: string) => {
// If we're on a public profile page and user clicks navigation, navigate to the appropriate route
if (isPublicProfile) {
switch (tab) {
case "home":
navigate("/")
break
case "post":
navigate("/post")
break
case "skillup":
navigate("/resource-hub")
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
case "post":
return <PostCreate />
case "skillup":
return <SkillUpFeed />
case "profile":
return <ProfileBoard />
case "publicProfile":
return customContent || <ProfileBoard />
default:
return <HomeFeed activeFilter={activeFilter} />
}
}

const shouldShowFilters =
showFilters &&
(activeTab === "home" || (activeTab === "skillup" && !hideSkillUpFilters))

return (
<div className="min-h-screen bg-background">
<TopBar
onLogoClick={handleLogoClick}
loading={loading}
/>
<OfflineIndicator />

{/* Main Content — explicit header offset replaces top-12 positioning */}
<CorePageGrid navigation={showNavigation ? <ResponsiveNavigation loading={loading} /> : undefined}>
<div className={`${hasHomeSuggestions ? "lg:grid lg:grid-cols-12 lg:items-start lg:gap-4" : ""}`}>
<main className={`core-vertical-grid min-w-0 ${hasHomeSuggestions ? "lg:col-span-8" : ""}`}>
{/* Content Filters */}
{shouldShowFilters && (
<div>
<ContentFilters
activeFilter={activeFilter}
onFilterChange={setActiveFilter}
filterType={activeTab}
/>
</div>
)}

{/* Content Area */}
<div className={`core-vertical-grid min-w-0 transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}>{renderActiveContent()}</div>
</main>

{hasHomeSuggestions && user && (
<aside className="hidden min-w-0 lg:col-span-4 lg:block">
<div className="sticky top-16">
<SuggestedConnections profileId={user.id} />
</div>
</aside>
)}
</div>
</CorePageGrid>

{user && <FloatingMessagingWidget />}
</div>
)
}

export default Index
