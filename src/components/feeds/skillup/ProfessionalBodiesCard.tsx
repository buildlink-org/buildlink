
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface ProfessionalBody {
  name: string;
  verified: boolean;
}

const ProfessionalBodiesCard = () => {
  const professionalBodies: ProfessionalBody[] = [
    { name: "Architectural Association of Kenya (AAK)", verified: true },
    { name: "Institution of Engineers of Kenya (IEK)", verified: true },
    { name: "Institute of Quantity Surveyors of Kenya (IQSK)", verified: true },
    { name: "Kenya Institute of Planners (KIP)", verified: true }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Verified Professional Bodies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {professionalBodies.map((body, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-foreground">{body.name}</span>
              {body.verified && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalBodiesCard;
