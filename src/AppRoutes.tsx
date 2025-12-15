
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import Mentorship from "./pages/Mentorship";
import ResourceHub from "./pages/ResourceHub";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminResourcesPage from "@/pages/AdminResources";
import AdminAnalyticsPage from "@/pages/AdminAnalytics";
import AdminRoute from "@/components/auth/AdminRoute";
import PublicProfile from "@/pages/PublicProfile";
import ProfileSettings from "@/pages/ProfileSettings";
import LandingPage from "./pages/LandingPage";
import SearchResultsPage from "./pages/SearchResultsPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route 
      path="/feed" 
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } 
    />
    {/* <Route 
      path="/mentorship" 
      element={
        <ProtectedRoute>
          <Mentorship />
        </ProtectedRoute>
      } 
    /> */}
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
);

export default AppRoutes;
