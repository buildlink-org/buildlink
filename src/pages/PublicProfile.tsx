import Index from "./Index";
import PublicProfileView from "@/components/profile/PublicProfileView";

const PublicProfile: React.FC = () => {
  return (
    <Index 
      customContent={
        <div className="mx-auto py-8">
          <PublicProfileView />
        </div>
      }
      showNavigation={true}
      showFilters={false}
      initialTab="publicProfile"
      isPublicProfile={true}
    />
  );
};

export default PublicProfile;