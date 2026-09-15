import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationPreferencesService } from '@/services/notificationPreferencesService';
import { NotificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface PreferenceItem {
  category: string;
  label: string;
  description: string;
  email_enabled: boolean;
  push_enabled: boolean;
}

const NotificationPreferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<PreferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(window.Notification.permission);
    } else {
      setPushPermission('unsupported');
    }

    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handleRequestPushPermission = async () => {
    const perm = await NotificationService.requestBrowserPushPermission();
    if (perm !== 'unsupported') {
      setPushPermission(perm);
      if (perm === 'granted') {
        toast({
          title: 'Push Notifications Enabled',
          description: 'You will now receive desktop real-time notifications.',
        });
      } else {
        toast({
          title: 'Push Permission Denied',
          description: 'Browser push notifications were blocked or dismissed.',
          variant: 'destructive',
        });
      }
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await notificationPreferencesService.getPreferences(user.id);
      
      if (error) throw error;

      const categories = [
        { category: 'general', label: 'General', description: 'System announcements and updates' },
        { category: 'posts', label: 'Posts & Activity', description: 'Likes, comments, and post interactions' },
        { category: 'connections', label: 'Connections', description: 'New connections and requests' },
        { category: 'mentorship', label: 'Mentorship', description: 'Mentorship requests and session updates' },
        { category: 'system', label: 'System', description: 'Security alerts and account changes' }
      ];

      const preferencesMap = (data || []).reduce((acc: any, pref: any) => {
        acc[pref.category] = pref;
        return acc;
      }, {});

      const defaults = await notificationPreferencesService.getDefaultPreferences();

      const formattedPreferences = categories.map(cat => ({
        ...cat,
        email_enabled: preferencesMap[cat.category]?.email_enabled ?? defaults[cat.category as keyof typeof defaults]?.email_enabled ?? true,
        push_enabled: preferencesMap[cat.category]?.push_enabled ?? defaults[cat.category as keyof typeof defaults]?.push_enabled ?? true
      }));

      setPreferences(formattedPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (category: string, type: 'email' | 'push', enabled: boolean) => {
    if (!user) return;

    const currentPref = preferences.find(p => p.category === category);
    if (!currentPref) return;

    const emailEnabled = type === 'email' ? enabled : currentPref.email_enabled;
    const pushEnabled = type === 'push' ? enabled : currentPref.push_enabled;

    try {
      const { error } = await notificationPreferencesService.updatePreference(
        user.id,
        category,
        emailEnabled,
        pushEnabled
      );

      if (error) throw error;

      setPreferences(prev =>
        prev.map(p =>
          p.category === category
            ? {
                ...p,
                email_enabled: emailEnabled,
                push_enabled: pushEnabled
              }
            : p
        )
      );

      toast({
        title: 'Success',
        description: 'Notification preferences updated'
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preference',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Push Permission Banner */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center space-x-3">
            {pushPermission === 'granted' ? (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-medium">Browser Real-time Push Notifications</p>
              <p className="text-xs text-muted-foreground">
                Status: <span className="capitalize font-semibold">{pushPermission}</span>
              </p>
            </div>
          </div>
          {pushPermission !== 'granted' && pushPermission !== 'unsupported' && (
            <Button size="sm" variant="outline" onClick={handleRequestPushPermission}>
              Enable Browser Push
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
          <div>Category</div>
          <div className="flex items-center justify-center">
            <Mail className="h-4 w-4 mr-1" />
            Email
          </div>
          <div className="flex items-center justify-center">
            <Smartphone className="h-4 w-4 mr-1" />
            Push
          </div>
        </div>
        <Separator />
        
        {preferences.map((pref, index) => (
          <div key={pref.category}>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <Label className="text-sm font-medium">{pref.label}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {pref.description}
                </p>
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={pref.email_enabled}
                  onCheckedChange={(checked) =>
                    updatePreference(pref.category, 'email', checked)
                  }
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={pref.push_enabled}
                  onCheckedChange={(checked) =>
                    updatePreference(pref.category, 'push', checked)
                  }
                />
              </div>
            </div>
            {index < preferences.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;