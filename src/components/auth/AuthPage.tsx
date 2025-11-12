
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import OtpVerificationModal from './OTPVerifyModal';

const AuthPage = () => {
  const { user, loading } = useAuth();

  // Open OTP verification modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  // const closeOtpModal = () => setIsOtpModalOpen(false);

  // opening modal from child components
  const showOtpModal = (email: string) => {
    setOtpEmail(email);
    setIsOtpModalOpen(true);
  };

  // close modal
  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
    setOtpEmail('')
  };

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/feed" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm showOtpModal={showOtpModal} />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm showOtpModal={showOtpModal} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      // otp verification modal
      {isOtpModalOpen && (
        <OtpVerificationModal
        email={otpEmail}
        onClose={closeOtpModal} />
      )}
    </>
  );
};

export default AuthPage;
