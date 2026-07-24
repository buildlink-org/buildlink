import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

interface Language {
  name: string;
  proficiency: string;
}

interface LanguagesEditDialogProps {
  children: React.ReactNode;
  currentProfile?: any;
  onProfileUpdated?: () => void;
}

const LanguagesEditDialog = ({ children, currentProfile, onProfileUpdated }: LanguagesEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>(currentProfile?.languages || []);
  const [newLanguage, setNewLanguage] = useState({ name: '', proficiency: '' });

  const proficiencyLevels = [
    'Native',
    'Fluent',
    'Advanced',
    'Intermediate',
    'Basic'
  ];

  const addLanguage = () => {
    if (newLanguage.name.trim() && newLanguage.proficiency && 
        !languages.find(lang => lang.name.toLowerCase() === newLanguage.name.toLowerCase())) {
      setLanguages([...languages, { ...newLanguage, name: newLanguage.name.trim() }]);
      setNewLanguage({ name: '', proficiency: '' });
    }
  };

  const removeLanguage = (languageToRemove: Language) => {
    setLanguages(languages.filter(lang => lang.name !== languageToRemove.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await profileService.updateProfile(user.id, { languages });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Languages updated successfully!'
      });

      setOpen(false);
      onProfileUpdated?.();
    } catch (error) {
      console.error('Error updating languages:', error);
      toast({
        title: 'Error',
        description: 'Failed to update languages. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent
        className="sm:max-w-[500px]"
        description="Add or remove languages you speak and select your proficiency level">
        <DialogHeader>
          <DialogTitle>Edit Languages</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Add Language</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newLanguage.name}
                onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                placeholder="Language name"
              />
              <Select
                value={newLanguage.proficiency}
                onValueChange={(value) => setNewLanguage({ ...newLanguage, proficiency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Proficiency" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="button" 
              onClick={addLanguage} 
              variant="outline" 
              className="w-full"
              disabled={!newLanguage.name.trim() || !newLanguage.proficiency}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Your Languages</Label>
            <div className="space-y-2 min-h-[100px] p-3 border border-border rounded-md bg-card/50">
              {languages.length > 0 ? (
                languages.map((language, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div>
                      <span className="font-medium text-foreground">{language.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({language.proficiency})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(language)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No languages added yet. Add some languages above.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Languages'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LanguagesEditDialog;
