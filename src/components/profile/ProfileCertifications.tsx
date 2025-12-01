import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string; // YYYY-MM-DD
  credentialUrl?: string;
}

interface ProfileCertificationsProps {
  profile: {
    certifications?: Certification[];
  };
}

const ProfileCertifications: FC<ProfileCertificationsProps> = ({ profile }) => {
  const list = profile.certifications ?? [];

  if (list.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No certifications added yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((c) => (
        <Card key={c.id} className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-4 p-4">
            <Award className="mt-1 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.issuer}</p>
              <p className="text-xs text-muted-foreground/80">
                Issued {new Date(c.issueDate).toLocaleDateString()}
              </p>
              {c.credentialUrl && (
                <a
                  href={c.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-primary hover:underline"
                >
                  View credential →
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProfileCertifications;
