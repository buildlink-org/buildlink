import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

interface Certification {
  name: string;
  issuer: string;
  date: string;
  credential_id?: string;
}

interface CertificationsEditDialogProps {
  children: React.ReactNode;
  currentProfile?: any;
  onProfileUpdated?: () => void;
}

const CertificationsEditDialog = ({ children, currentProfile, onProfileUpdated }: CertificationsEditDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>(currentProfile?.certifications || []);
  const [newCertification, setNewCertification] = useState<Certification>({
    name: '',
    issuer: '',
    date: '',
    credential_id: ''
  });

  const addCertification = () => {
    if (newCertification.name.trim() && newCertification.issuer.trim() && newCertification.date.trim()) {
      setCertifications([...certifications, { ...newCertification }]);
      setNewCertification({ name: '', issuer: '', date: '', credential_id: '' });
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await profileService.updateProfile(user.id, { certifications });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Certifications updated successfully!'
      });

      setOpen(false);
      onProfileUpdated?.();
    } catch (error) {
      console.error('Error updating certifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update certifications. Please try again.',
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
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        description="Add, edit, or remove your professional certifications and credentials">
        <DialogHeader>
          <DialogTitle>Edit Certifications</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 p-4 border rounded-md">
            <Label className="text-base font-semibold">Add New Certification</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cert-name">Certification Name</Label>
                <Input
                  id="cert-name"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                  placeholder="e.g., PMP Certification"
                />
              </div>
              <div>
                <Label htmlFor="issuer">Issuing Organization</Label>
                <Input
                  id="issuer"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                  placeholder="e.g., PMI"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cert-date">Issue Date</Label>
                <Input
                  id="cert-date"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                  placeholder="e.g., May 2023"
                />
              </div>
              <div>
                <Label htmlFor="credential-id">Credential ID (Optional)</Label>
                <Input
                  id="credential-id"
                  value={newCertification.credential_id}
                  onChange={(e) => setNewCertification({ ...newCertification, credential_id: e.target.value })}
                  placeholder="e.g., ABC123456"
                />
              </div>
            </div>
            <Button 
              type="button" 
              onClick={addCertification} 
              variant="outline" 
              className="w-full"
              disabled={!newCertification.name.trim() || !newCertification.issuer.trim() || !newCertification.date.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Your Certifications</Label>
            <div className="space-y-3 min-h-[100px]">
              {certifications.length > 0 ? (
                certifications.map((cert, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-gray-600">{cert.issuer}</p>
                        <p className="text-sm text-gray-500">{cert.date}</p>
                        {cert.credential_id && (
                          <p className="text-xs text-gray-500">Credential ID: {cert.credential_id}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm p-3 border rounded-md">No certifications added yet. Add some certifications above.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Certifications'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CertificationsEditDialog;
