import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Award, Star, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerificationBadge {
  type: string;
  label: string;
  description: string;
  verified_at: string;
}

interface VerificationBadgesProps {
  badges: VerificationBadge[];
}

const VerificationBadges: React.FC<VerificationBadgesProps> = ({ badges }) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'identity':
        return <Shield className="h-3 w-3" />;
      case 'email':
        return <CheckCircle className="h-3 w-3" />;
      case 'professional':
        return <Award className="h-3 w-3" />;
      case 'expert':
        return <Star className="h-3 w-3" />;
      case 'mentor':
        return <Users className="h-3 w-3" />;
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'identity':
        return 'default';
      case 'email':
        return 'secondary';
      case 'professional':
        return 'outline';
      case 'expert':
        return 'default';
      case 'mentor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {badges.map((badge, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Badge 
                variant={getBadgeVariant(badge.type) as any}
                className="text-md cursor-help"
              >
                {getBadgeIcon(badge.type)}
                {/* <span className="ml-1">{badge.label}</span> */}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <p className="text-xs text-muted-foreground">
                  Verified on {new Date(badge.verified_at).toLocaleDateString()}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default VerificationBadges;