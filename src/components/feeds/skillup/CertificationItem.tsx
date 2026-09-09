import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";

interface Certification {
    id: string;
    title: string;
    provider: string;
    duration: string;
    price: number | null;
    link?: string;
}

interface CertificationItemProps {
    certification: Certification;
}

const CertificationItem = ({ certification }: CertificationItemProps) => {
  return (
    <Card key={certification.id} className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">{certification.title}</h3>
            <p className="text-sm text-muted-foreground">{certification.provider}</p>
            <p className="text-xs text-muted-foreground">Duration: {certification.duration}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary mb-2">{certification.price ? `KSh ${certification.price}`: 'Free'}</div>
            <Button size="sm" asChild>
              <a href={certification.link || "#"} target="_blank" rel="noopener noreferrer">
                Apply Now
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <ResourceReviewForm resourceId={certification.id} />
          <ResourceReviewsList resourceId={certification.id} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationItem;
