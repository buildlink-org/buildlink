import Index from "./Index";
import PublicProfileView from "@/components/profile/PublicProfileView";

const PublicProfile: React.FC = () => {
  return (
    <Index 
      customContent={<PublicProfileView />}
      showNavigation={true}
      showFilters={false}
      initialTab="publicProfile"
      isPublicProfile={true}
    />
  );
};

export default PublicProfile;