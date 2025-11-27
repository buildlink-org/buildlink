import { Card, CardContent } from "@/components/ui/card";

const ProfileEducation = ({ profile }: { profile: any }) => {
  const education = profile?.education || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Education</h2>

        {!education.length ? (
          <p className="text-muted-foreground">No education records.</p>
        ) : (
          <div className="space-y-4">
            {education.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium">{item.school}</p>
                <p className="text-sm">
                  {item.degree} — {item.field}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.start_year} - {item.end_year || "Present"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEducation;
