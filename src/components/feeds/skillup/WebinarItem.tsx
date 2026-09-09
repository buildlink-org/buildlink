import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";

interface Webinar {
    id: string;
    title: string;
    provider: string;
    link?: string;
}

interface WebinarItemProps {
    webinar: Webinar;
}

const WebinarItem = ({ webinar }: WebinarItemProps) => {
  return (
    <Card key={webinar.id} className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">{webinar.title}</h3>
            <p className="text-sm text-muted-foreground">{webinar.provider}</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <a href={webinar.link || "#"} target="_blank" rel="noopener noreferrer">
              Register Free
            </a>
          </Button>
        </div>
        <div className="mt-3">
          <ResourceReviewForm resourceId={webinar.id} />
          <ResourceReviewsList resourceId={webinar.id} />
        </div>
      </CardContent>
    </Card>
  );
};

export default WebinarItem;
