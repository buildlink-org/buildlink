import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useRoleRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const role = user?.user_metadata?.user_type;

    if (!user) return;

    switch (role) {
      case "student":
        navigate("/student-dashboard");
        break;
      case "professional":
        navigate("/pro-dashboard");
        break;
      case "company":
        navigate("/company-dashboard");
        break;
      default:
        navigate("/complete-profile");
    }
  }, [user, loading, navigate]);
};
