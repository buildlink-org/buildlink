import { UserProfile } from "@/types";
import { Card, CardContent } from "../ui/card";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  postsCount: number;
  profile: UserProfile;
}

const TABS_BY_ROLE: Record<string, { key: string; label: string }[]> = {
  student: [
    { key: "about", label: "About" },
    { key: "activity", label: `Activity` },
    { key: "portfolio", label: "Portfolio" },
    { key: "education", label: "Education" },
    { key: "experience", label: "Experience" },
    { key: "connections", label: "Connections" },
  ],

  professional: [
    { key: "about", label: "About" },
    { key: "activity", label: `Activity` },
    { key: "portfolio", label: "Portfolio" },
    { key: "skills", label: "Skills" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
    { key: "certifications", label: "Certifications" },
    { key: "connections", label: "Connections" },
  ],

  company: [
    { key: "about", label: "About" },
    { key: "activity", label: "Activity" },
    { key: "jobs", label: "Jobs / Roles" },
    { key: "people", label: "People" },
    { key: "products", label: "Products / Services" },
    { key: "events", label: "Events" },
    { key: "culture", label: "Life / Culture" },
  ],
};

const ProfileTabs = ({
  activeTab,
  setActiveTab,
  postsCount,
  profile,
}: ProfileTabsProps) => {
  const role = profile.user_type?.toLowerCase() || "student";
  const tabs = TABS_BY_ROLE[role] || TABS_BY_ROLE.student;

  //   return (
  // 	<Card className="border-0 shadow-sm">
  // 		<CardContent className="p-0">
  // 			<div className="flex border-b overflow-x-auto">
  // 				{tabs.map((tab) => (
  // 				<button
  // 				    key={tab.key}
  // 					onClick={() => setActiveTab("about")}
  // 					className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "about" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
  // 					About
  // 				</button>
  // 				{profile.user_type !== "company" && (
  // 					<button
  // 						onClick={() => setActiveTab("Connection")}
  // 						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "Connection" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
  // 						Connections ({postsCount})
  // 					</button>
  // 				)}

  // 				{profile.user_type === "company" && (
  // 					<button
  // 						onClick={() => setActiveTab("People")}
  // 						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "People" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
  // 						People ({postsCount})
  // 					</button>
  // 				)}
  // 				<button
  // 					onClick={() => setActiveTab("activity")}
  // 					className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "activity" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
  // 					Activity ({postsCount})
  // 				</button>
  // 				{profile.user_type === "company" && (
  // 					<button
  // 						onClick={() => setActiveTab("activity")}
  // 						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "Events" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-600 hover:text-gray-800"}`}>
  // 						Events
  // 					</button>
  // 				)}
  // 			</div>
  // 		</CardContent>
  // 	</Card>
  // )

  // export default ProfileTabs

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex border-b overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            // Auto-append counts only for specific tabs
            const labelWithCount = [
              "connections",
              "people",
              "activity",
            ].includes(tab.key)
              ? `${tab.label} (${postsCount})`
              : tab.label;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {labelWithCount}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTabs;
