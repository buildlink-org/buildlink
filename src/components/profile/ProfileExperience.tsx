import { Card, CardContent } from "@/components/ui/card";

const ProfileExperience = ({ profile }: { profile: any }) => {
  const experience = profile?.experience || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Experience</h2>

        {!experience.length ? (
          <p className="text-muted-foreground">No experience added.</p>
        ) : (
          <div className="space-y-4">
            {experience.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium">{item.role}</p>
                <p className="text-sm text-muted-foreground">{item.company}</p>
                <p className="text-xs text-muted-foreground">
                  {item.start_date} - {item.end_date || "Present"}
                </p>
                <p className="text-sm mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileExperience;
