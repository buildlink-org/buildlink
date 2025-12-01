import { Card, CardContent } from "@/components/ui/card";

const ProfileEvents = ({ profile }: { profile: any }) => {
  const events = profile?.events || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Events</h2>

        {!events.length ? (
          <p className="text-muted-foreground">No events posted.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEvents;
