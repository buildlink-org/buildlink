# BUILDLINK FIXES.

## 1.Authentication.

-Problem: The 'Sign up for Free' button leads to their account if they have logged out.

-An already logged in user should not see the landing page.

-The button should only show to new users yet to create their account and users who properly logged out only.

-Landing page should be visible only to the above as well.

-Expected outcome: Button to lead to the 'Sign up' window, the button only defaults to 'log in' when a user with an account has not properly logged out.

**Fix:**

-Looking at 'ProtectedRoute.tsx', what it does:

1. If still loading, show a spinner, wait.
2. If no user, redirect to '/auth'.
3. If user exists, show the page.

-What we need for the landing page is this:

1. If still loading, show a spinner, wait.
2. If user exists, redirect to '/feed'
3. If no user, show the landing page.

-The file was made mirroring the ProtectedRoute file.

    import { Navigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';

    interface PublicRouteProps {
        children: React.ReactNode;
    }

    const PublicRoute = ({ children }: PublicRouteProps ) => {

        const { user, loading } = useAuth();

        if(loading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
            );
            <!-- the loading check is important as it takes a while for supabase to resolve tokens -->
        }
        if (user){
            return <Navigate to ="/feed" replace />;
        }
        <!-- if this is a user, redirect directly to feed -->

        return <>
        {children}
        </>
    };

    export default PublicRoute;

-Then fix up our routes in 'AppRoutes.tsx'

    <Route path="/" element={
      <PublicRoute>
      <LandingPage />
      </PublicRoute>
      } />

-This will fix all errors.

**Problem:**
link the right processes (sign up & sign in) with the respective buttons on the landing page

**Fix:**

-Use of useParams hook, which will allow us access to dynamic values from URL In react router.

-Currently this is what we have:

    <TabsContent value="signin">
    //authpage.tsx

     <a href="/auth">
     //herosection.tsx


-We will use useParams to:

1. Extracts parameters directly from the URL
2. Enables dynamic routing and data display
3. Commonly used to fetch or show user-specific content

Code:

    const [searchParams] = useSearchParams();

    const tab = searchParams.get("tab");

    defaultValue = tab || "signin"


