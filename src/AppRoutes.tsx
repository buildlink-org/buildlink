
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import PublicRoute from "./components/auth/PublicRoute";
import LandingPage from "./pages/LandingPage";

const Home = lazy(() => import("./pages/Home"));
const ResourceHub = lazy(() => import("./pages/ResourceHub"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./components/auth/AuthPage"));
const AdminResourcesPage = lazy(() => import("@/pages/AdminResources"));
const AdminAnalyticsPage = lazy(() => import("@/pages/AdminAnalytics"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={
        <PublicRoute>
        <LandingPage />
        </PublicRoute>
        } />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resource-hub"
        element={
          <ProtectedRoute>
            <ResourceHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-resources"
        element={
          <AdminRoute>
            <AdminResourcesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin-analytics"
        element={
          <AdminRoute>
            <AdminAnalyticsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/profile/:profileId"
        element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <SearchResultsPage />
        }
      />



      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
