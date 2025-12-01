import { Card, CardContent } from "@/components/ui/card";

const ProfilePeople = ({ profile }: { profile: any }) => {
  const people = profile?.employees || [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">People</h2>

        {!people.length ? (
          <p className="text-muted-foreground">No team members listed.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {people.map((person: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-medium">{person.name}</p>
                <p className="text-sm text-muted-foreground">{person.role}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePeople;
