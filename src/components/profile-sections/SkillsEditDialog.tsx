import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X, Plus, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { useToast } from "@/hooks/use-toast";
import {
  Skill,
  convertAndSanitizeSkills,
} from "@/lib/skillUtils";

interface SkillsEditDialogProps {
  children: React.ReactNode;
  currentProfile?: any;
  onProfileUpdated?: () => void;
}

const SkillsEditDialog = ({
  children,
  currentProfile,
  onProfileUpdated,
}: SkillsEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Convert legacy string skills and sanitize malformed skill objects
  const [skills, setSkills] = useState<Skill[]>(
    convertAndSanitizeSkills(currentProfile?.skills || [])
  );
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !skills.find(
        (skill) => skill.name.toLowerCase() === newSkill.trim().toLowerCase()
      )
    ) {
      setSkills([...skills, { name: newSkill.trim() }]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill.name !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const targetId = currentProfile?.id || user?.id;
      if (!targetId) throw new Error("No user found");

      // Store as simple string array for clean DB model
      const skillNames = skills.map((s) => s.name.trim()).filter(Boolean);

      const { error } = await profileService.updateProfile(targetId, {
        skills: skillNames,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Skills updated successfully!" });

      setOpen(false);
      onProfileUpdated?.();
    } catch (error) {
      console.error("Error updating skills:", error);
      toast({
        title: "Error",
        description: "Failed to update skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setSkills(convertAndSanitizeSkills(currentProfile?.skills || []));
        }
        setOpen(isOpen);
      }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        description="Add or remove skills that showcase your expertise and specialization">
        <DialogHeader>
          <DialogTitle>Edit Skills & Specialization</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Add New Skill</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g., AutoCAD, Project Management"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">
              Your Skills ({skills.length})
            </Label>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border animate-fade-in">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {skill.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                          onClick={() => removeSkill(skill.name)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>
                    No skills added yet. Add some skills above to showcase your
                    expertise.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={addSkill} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Skills"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsEditDialog;