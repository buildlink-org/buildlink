// OtpVerificationModal.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';


interface OtpVerificationModalProps {
  email: string;
  onClose: () => void;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({ email, onClose }) => {
  const { verifyOtp, resendOtp } = useAuth();
  const { toast } = useToast();
  const [otpToken, setOtpToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await verifyOtp(email, otpToken);

    if (error) {
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid or expired code.',
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
        toast({
        title: 'Success!',
        description: 'Email confirmed. Redirecting to dashboard...',
      });

      onClose(); 
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    const { error } = await resendOtp(email);

    if (error) {
      toast({
        title: 'Resend failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Code sent',
        description: 'A new code has been sent to your email address.',
      });
    }
    setIsResending(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={otpToken}
              onChange={(e) => setOtpToken(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm"
            >
              {isResending ? 'Sending new code...' : "Didn't receive a code? Resend"}
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtpVerificationModal;
