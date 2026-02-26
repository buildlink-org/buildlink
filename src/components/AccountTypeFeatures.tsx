import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Feature {
  feature_name: string;
  description: string;
  is_premium: boolean;
}

interface AccountTypeFeaturesProps {
  userType: string;
  className?: string;
}

const AccountTypeFeatures = ({ userType, className = '' }: AccountTypeFeaturesProps) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const { data, error } = await supabase
          .from('account_features')
          .select('feature_name, description, is_premium')
          .eq('user_type', userType.toLowerCase());

        if (error) throw error;
        setFeatures(data || []);
      } catch (error) {
        console.error('Error fetching account features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [userType]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-lg bg-muted" />;
  }

  const getTypeTitle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'student':
        return '🎓 Student Account Features';
      // case 'graduate':
      //   return '🧑‍🎓 Graduate Account Features';
      case 'professional':
        return '🏗️ Professional Account Features';
      case 'company':
        return '🏢 Company Account Features';
      default:
        return 'Account Features';
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type.toLowerCase()) {
      case 'student':
        return 'Emerging talent, learning & seeking opportunities';
      // case 'graduate':
      //   return 'Fresh graduate, early-career stage';
      case 'professional':
        return 'Practicing professional with accreditation/experience';
      case 'company':
        return 'Firms, contractors, consultancies, suppliers';
      default:
        return '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTypeTitle(userType)}
        </CardTitle>
        <CardDescription>
          {getTypeDescription(userType)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <div className="mt-0.5 flex-shrink-0">
                {feature.is_premium ? (
                  <Crown className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {feature.feature_name.replace(/_/g, ' ')}
                  </span>
                  {feature.is_premium && (
                    <Badge variant="outline" className="text-xs">
                      <Star className="mr-1 h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTypeFeatures;