
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SignInFormProps {
  showOtpModal: (email: string) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({showOtpModal}) => {
  const { signIn, resetPassword, resendOtp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message === 'Email not confirmed') {

        toast({
          title: 'Email not verified',
          description: 'Please verify your email. An OTP has been sent to you.',
          variant: 'destructive',
        })
        
        // Resend OTP
        resendOtp(email);

        // Open modal
        showOtpModal(email);

      } else {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={isResetting}
              onClick={() => {
                const emailInput = document.getElementById('signin-email') as HTMLInputElement;
                const email = emailInput?.value;
                
                if (!email) {
                  toast({
                    title: 'Email required',
                    description: 'Please enter your email address to reset your password.',
                    variant: 'destructive',
                  });
                  return;
                }
                
                setIsResetting(true);
                resetPassword(email).then(({ error }) => {
                  if (error) {
                    toast({
                      title: 'Reset failed',
                      description: error.message,
                      variant: 'destructive',
                    });
                  } else {
                    toast({
                      title: 'Reset link sent',
                      description: 'Check your email for password reset instructions.',
                    });
                  }
                  setIsResetting(false);
                });
              }}
            >
              {isResetting ? 'Sending...' : 'Forgot password?'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignInForm;
