import { Card, CardContent } from "@/components/ui/card";

const ProfileCulture = ({ profile }: { profile: any }) => {
  const culture = profile?.culture || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Life & Culture</h2>

        {!culture.length ? (
          <p className="text-muted-foreground">No culture posts yet.</p>
        ) : (
          <div className="space-y-4">
            {culture.map((item: any, index: number) => (
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

export default ProfileCulture;
