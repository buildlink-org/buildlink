import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { signUpSchema } from '@/lib/validationSchemas';
import { z } from 'zod';

interface SignUpFormProps {
  showOtpModal: (email: string) => void
}

const SignUpForm: React.FC<SignUpFormProps> = ({showOtpModal}) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        fullName: formData.get('fullName') as string,
        userType: formData.get('userType') as string,
        profession: formData.get('profession') as string,
      };

      // Validate input data
      const validatedData = signUpSchema.parse(rawData);
      const userEmail =  validatedData.email;

      const { error } = await signUp(validatedData.email, validatedData.password, {
        full_name: validatedData.fullName,
        user_type: validatedData.userType,
        profession: validatedData.profession
      });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });

        showOtpModal(userEmail);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Join our learning community today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-usertype">Account Type</Label>
            <Select name="userType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-profession">Profession</Label>
            <Select name="profession" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your profession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="architecture">Architecture</SelectItem>
                <SelectItem value="interior-design">Interior Design</SelectItem>
                <SelectItem value="quantity-surveying">Quantity Surveying</SelectItem>
                <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                <SelectItem value="mep-engineering">MEP Engineering</SelectItem>
                <SelectItem value="project-management">Project Management</SelectItem>
                <SelectItem value="project-finance">Project Finance</SelectItem>
                <SelectItem value="construction-supplies">Construction & Supplies</SelectItem>
                <SelectItem value="health-safety">Health & Safety</SelectItem>
                <SelectItem value="real-estate-development">Real Estate Development</SelectItem>
                <SelectItem value="urban-planning">Urban Planning</SelectItem>
                <SelectItem value="governance-policy">Governance & Policy</SelectItem>
                <SelectItem value="advocacy-awareness">Advocacy & Awareness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
