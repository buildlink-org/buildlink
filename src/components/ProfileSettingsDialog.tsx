import { useState } from "react";
import { Settings, User, Shield, Bell, Palette } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ProfileEditForm from "./ProfileEditForm";
import { PrivacySettingsDialog } from "./PrivacySettingsDialog";
import { useToast } from "@/hooks/use-toast";

interface ProfileSettingsDialogProps {
  children: React.ReactNode;
}

const ProfileSettingsDialog = ({ children }: ProfileSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const { toast } = useToast();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");

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

          <Tabs defaultValue="profile" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {/* <TabsTrigger value="privacy">Privacy</TabsTrigger> */}
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and professional details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        setOpen(false);
                        setShowProfileEdit(true);
                      }}
                      className="w-full">
                      Edit Profile Details
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
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
                      <Label htmlFor="profile-visibility">
                        Profile Visibility
                      </Label>
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
                      onClick={() => {
                        setOpen(false);
                        setShowPrivacySettings(true);
                      }}
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

      {/* Sub-dialogs */}
      <ProfileEditForm
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        onSave={() => {
          setShowProfileEdit(false);
          toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated!",
          });
        }}
      />

      <PrivacySettingsDialog
        open={showPrivacySettings}
        onOpenChange={setShowPrivacySettings}
      />
    </>
  );
};

export default ProfileSettingsDialog;
