import { useState } from "react";
import { Settings, Bell, Palette, Sun, Moon, KeyRound, Download, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

interface ProfileSettingsDialogProps {
  children: React.ReactNode;
}

const ProfileSettingsDialog = ({ children }: ProfileSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
  };

  const handleSaveSettings = () => {
    // Save settings logic would go here
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };


    
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
            <DialogDescription>
              Manage your account settings, privacy, and preferences
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="theme" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="theme">Colour Theme</TabsTrigger>
              <TabsTrigger value="account">Account Actions</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[60vh] overflow-y-auto">
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
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => { setOpen(false); navigate("/profile/settings"); }}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "Preparing your data",
                          description: "Your data export will be available for download shortly.",
                          duration: 4000,
                        });
                      }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download My Data
                    </Button>
                    <Separator />
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => { setOpen(false); navigate("/profile/settings"); }}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                    <p className="pt-2 text-xs text-muted-foreground text-center">
                      For full account management, visit the settings page.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

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
                      <Label htmlFor="push-notifications">
                        Push Notifications
                      </Label>
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
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default ProfileSettingsDialog;
