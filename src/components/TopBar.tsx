import { Search, BarChart3, Settings, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import UserProfileButton from "@/components/UserProfileButton";
import SearchDialog from "@/components/SearchDialog";
import EnhancedNotificationsDropdown from "@/components/EnhancedNotificationsDropdown";
import SearchDropdown from "./SearchDropdown";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";
import logo from "@/assets/buildlink-logo.png";

interface TopBarProps {
  onLogoClick: () => void;
  onMenuClick?: () => void;
  loading?: boolean;
}

const TopBar = ({
  onLogoClick,
  onMenuClick,
  loading,
}: TopBarProps) => {
  const { isAdmin } = useIsAdmin();
  const location = useLocation();

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-between md:px-8 px-4 max-w-7xl mx-auto">
        {/* Left side - Menu + Logo */}
        <div className="flex items-center space-x-3">
          <div
            className="flex items-center cursor-pointer"
            onClick={onLogoClick}>
            <img src={logo} alt="BuildLink Logo" className="h-6 w-6 mr-2" />
            <span className="font-semibold text-lg">
              BuildLink
            </span>
          </div>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>

        {/* Center - Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2 lg:mx-4">
          <SearchDropdown />
        </div>

        {/*<div className="hidden sm:flex flex-1 max-w-md mx-2 lg:mx-4">
          <SearchDialog>
            <div className="relative w-full cursor-pointer">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search posts, mentors, courses..."
                className="pl-10 w-full cursor-pointer"
                readOnly
              />
            </div>
          </SearchDialog>
        </div>  /*}

        {/* Right side actions */}
        <div className="flex items-center space-x-1">
          <SearchDialog>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </SearchDialog>

          {isAdmin && (
            <>
              <Link to="/admin-analytics">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Analytics"
                  className={cn(
                    location.pathname === "/admin-analytics" &&
                      "bg-accent text-accent-foreground"
                  )}>
                  <BarChart3 className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/admin-resources">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Admin Panel"
                  className={cn(
                    location.pathname === "/admin-resources" && "bg-accent text-accent-foreground"
                  )}>
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
          <EnhancedNotificationsDropdown />
          <UserProfileButton />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
