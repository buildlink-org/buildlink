
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfessionalBody {
  acronym: string;
  name: string;
  description: string;
  website?: string;
}

const ProfessionalBodiesCard = () => {
  const professionalBodies: ProfessionalBody[] = [
    {
      acronym: "AAK",
      name: "Architectural Association of Kenya",
      description: "Regulates architects and promotes the advancement of the architectural profession in Kenya.",
      website: "https://aak.or.ke",
    },
    {
      acronym: "IEK",
      name: "Institution of Engineers of Kenya",
      description: "The premier professional body for engineers in Kenya, promoting excellence in engineering practice.",
      website: "https://iek.or.ke",
    },
    {
      acronym: "IQSK",
      name: "Institute of Quantity Surveyors of Kenya",
      description: "Advances the quantity surveying profession and maintains professional standards.",
      website: "https://iqsk.or.ke",
    },
    {
      acronym: "KIP",
      name: "Kenya Institute of Planners",
      description: "Sets and maintains standards for urban and regional planning practice in Kenya.",
      website: "https://kip.or.ke",
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Professional Bodies
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Learning resources aligned with Kenya's built-environment professional standards and continuous education benchmarks.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {professionalBodies.map((body) => (
            <div
              key={body.acronym}
              className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="secondary" className="font-bold text-xs shrink-0 bg-primary/10 text-primary border-0">
                    {body.acronym}
                  </Badge>
                  <span className="text-xs font-semibold text-foreground truncate">{body.name}</span>
                </div>
                {body.website && (
                  <a
                    href={body.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${body.name} website`}
                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{body.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalBodiesCard;
