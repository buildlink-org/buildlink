import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute = ({ children } : PublicRouteProps) => {

    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to ="/feed" replace />;
    }

    return <>
    {children}
    </>
};

export default PublicRoute;