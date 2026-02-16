import { useState, useEffect } from "react";
import { Settings, Bell, Palette, ArrowLeft, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import TopBar from "@/components/TopBar";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Load user's current settings if needed
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      // Save settings logic
      // await profileService.updateProfile(user.id, {
      //   profile_visibility: profileVisibility,
      // });

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    navigate("/feed");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar onLogoClick={handleGoBack} />
        <div className="mx-auto max-w-4xl p-6 pt-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded bg-muted"></div>
            <div className="h-96 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar onLogoClick={handleGoBack} />

      <div className="mx-auto max-w-4xl p-6 pt-12">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home Feed
          </Button>

          <div className="mb-2 flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings, privacy, and preferences
          </p>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="theme">Colour Theme</TabsTrigger>
            <TabsTrigger value="account">Account Actions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Colour Theme
                </CardTitle>
                <CardDescription>
                  Choose between light and dark mode for your interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === "light" ? (
                      <Sun className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Moon className="h-5 w-5 text-blue-400" />
                    )}
                    <div>
                      <Label htmlFor="theme-toggle" className="text-base font-medium">
                        {theme === "light" ? "Light Mode" : "Dark Mode"}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {theme === "light"
                          ? "Bright interface for daytime use"
                          : "Dark interface for reduced eye strain"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="theme-toggle"
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => handleThemeChange(checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account settings and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control who can see your profile and contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    value={profileVisibility}
                    onValueChange={setProfileVisibility}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="connections">
                        Connections Only
                      </SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowPrivacySettings(true)}
                  className="w-full">
                  Advanced Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Notification Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New Messages</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Connection Requests</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Post Likes</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Comments</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={handleGoBack}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </div>
        </Tabs>

      </div>
    </div>
  );
};

export default ProfileSettings;
