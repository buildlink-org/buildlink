import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ProfileCompletionIndicatorProps {
  score: number;
  showDetails?: boolean;
}

const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({
  score,
  showDetails = false,
}) => {
  const getCompletionStatus = (score: number) => {
    if (score >= 80)
      return {
        label: "Complete",
        variant: "default" as const,
        icon: CheckCircle,
      };
    if (score >= 60)
      return {
        label: "Good",
        variant: "secondary" as const,
        icon: CheckCircle,
      };
    if (score >= 40)
      return { label: "Fair", variant: "outline" as const, icon: AlertCircle };
    return {
      label: "Incomplete",
      variant: "destructive" as const,
      icon: AlertCircle,
    };
  };

  const getColorClass = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-sky-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-secondary";
  };

  const status = getCompletionStatus(score);
  const Icon = status.icon;

  return (
    <div className="space-y-2.5">
      <div className="w-full text-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Profile Completion</span>
            <Badge variant={status.variant} className="text-xs">
              <Icon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <span className="text-lg font-bold text-foreground">{score}%</span>
        </div>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getColorClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {showDetails && score < 100 && (
        <div className="text-xs text-muted-foreground">
          Add more information to improve your profile visibility and connections.
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionIndicator;
