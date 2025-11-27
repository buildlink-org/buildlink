import { Card, CardContent } from "@/components/ui/card";

const ProfileJobs = ({ profile }: { profile: any }) => {
  const jobs = profile?.jobs || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Jobs & Open Roles</h2>

        {!jobs.length ? (
          <p className="text-muted-foreground">No open roles posted.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.location}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileJobs;
