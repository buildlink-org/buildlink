import { Badge } from '@/components/ui/badge';
import { GraduationCap, Building2, User, Users } from 'lucide-react';

interface AccountTypeBadgeProps {
  userType: string;
  className?: string;
}

const AccountTypeBadge = ({ userType, className = '' }: AccountTypeBadgeProps) => {
  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case 'student':
        return {
          icon: GraduationCap,
          label: 'Student',
          variant: 'default' as const,
          description: '🎓 Emerging talent, learning & seeking opportunities'
        };
      // case 'graduate':
      //   return {
      //     icon: User,
      //     label: 'Graduate',
      //     variant: 'secondary' as const,
      //     description: '🧑‍🎓 Fresh graduate, early-career stage'
      //   };
      case 'professional':
        return {
          icon: Users,
          label: 'Professional',
          variant: 'outline' as const,
          description: '🏗️ Practicing professional with accreditation/experience'
        };
      case 'company':
        return {
          icon: Building2,
          label: 'Company',
          variant: 'destructive' as const,
          description: '🏢 Firms, contractors, consultancies, suppliers'
        };
      default:
        return {
          icon: User,
          label: type,
          variant: 'default' as const,
          description: ''
        };
    }
  };

  const config = getTypeConfig(userType);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default AccountTypeBadge;