import { Card, CardContent } from "@/components/ui/card";

const ProfilePortfolio = ({ profile }: { profile: any }) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Portfolio</h2>

        {!profile?.portfolio?.length ? (
          <p className="text-muted-foreground">No portfolio items yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.portfolio.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePortfolio;
