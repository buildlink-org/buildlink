import { Card, CardContent } from "@/components/ui/card";

const ProfileSkills = ({ profile }: { profile: any }) => {
  const skills = profile?.skills || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Skills</h2>

        {!skills.length ? (
          <p className="text-muted-foreground">No skills listed.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSkills;
