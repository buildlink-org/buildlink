import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileAbout from "./ProfileAbout";
import ProfileActivity from "./ProfileActivity";

import ProfilePortfolio from "../profile/ProfilePortfolio";
import ProfileEducation from "../profile/ProfileEducation";
import ProfileExperience from "../profile/ProfileExperience";
import ProfileSkills from "../profile/ProfileSkills";
import ProfileCertifications from "../profile/ProfileCertifications";
import ProfileJobs from "../profile/ProfileJobs";
import ProfilePeople from "../profile/ProfilePeople";
import ProfileProducts from "../profile/ProfileProducts";
import ProfileEvents from "../profile/ProfileEvents";
import ProfileCulture from "../profile/ProfileCulture";

import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import ProfileCompletionIndicator from "@/components/profile/ProfileCompletionIndicator";
import { BookOpen, Users } from "lucide-react";

const ProfileBoard = () => {
  const [activeTab, setActiveTab] = useState("about");
  const {
    profile,
    userPosts,
    loading,
    uploading,
    handleProfileUpdate,
    handleAvatarChange,
    handleAvatarRemove,
  } = useProfile();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-600">
          Profile not found
        </h3>
        <p className="text-gray-500">Unable to load profile data</p>
      </div>
    );
  }

  // Map activeTab to the component to render dynamically
  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <ProfileAbout
            profile={profile}
            handleProfileUpdate={handleProfileUpdate}
          />
        );

      case "activity":
        return <ProfileActivity userPosts={userPosts} />;

      case "portfolio":
        return <ProfilePortfolio profile={profile} />;
      case "education":
        return <ProfileEducation profile={profile} />;
      case "experience":
        return <ProfileExperience profile={profile} />;
      case "skills":
        return <ProfileSkills profile={profile} />;
      case "certifications":
        return <ProfileCertifications profile={profile} />;

      // company sections
      case "jobs":
        return <ProfileJobs profile={profile} />;
      case "people":
        return <ProfilePeople profile={profile} />;
      case "products":
        return <ProfileProducts profile={profile} />;
      case "events":
        return <ProfileEvents profile={profile} />;
      case "culture":
        return <ProfileCulture profile={profile} />;
      default:
        return <div>Section not available</div>;
    }
  };

  return (
    <div className="space-y-4 p-6 md:space-y-6 md:px-0 max-w-5xl mx-auto">
      <ProfileHeader
        profile={profile}
        uploading={uploading}
        userPostsCount={userPosts.length}
        handleAvatarChange={handleAvatarChange}
        handleAvatarRemove={handleAvatarRemove}
        handleProfileUpdate={handleProfileUpdate}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Items</p>
                <p className="text-4xl font-bold">
                  {profile.portfolio?.length || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-4xl font-bold">0</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <ProfileCompletionIndicator
              score={profile?.profile_completion_score || 0}
              showDetails
            />
          </CardContent>
        </Card>
      </div>

      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        postsCount={userPosts.length}
        profile={profile}
      />

      {/* <div className="px-2 md:px-0">
        {activeTab === "about" ? (
          <ProfileAbout
            profile={profile}
            handleProfileUpdate={handleProfileUpdate}
          />
        ) : (
          <ProfileActivity userPosts={userPosts} />
        )}
      </div> */}
      <div className="px-2 md:px-0">{renderTabContent()}</div>
    </div>
  );
};

export default ProfileBoard;
