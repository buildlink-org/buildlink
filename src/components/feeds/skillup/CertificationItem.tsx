import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";

interface Certification {
    id: string;
    title: string;
    provider: string;
    duration: string;
    price: number | null;
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
            <h3 className="font-medium text-gray-800 dark:text-gray-400 mb-1">{certification.title}</h3>
            <p className="text-sm text-gray-600">{certification.provider}</p>
            <p className="text-xs text-gray-500">Duration: {certification.duration}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary mb-2">{certification.price ? `KSh ${certification.price}`: 'Free'}</div>
            <Button size="sm">Apply Now</Button>
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
