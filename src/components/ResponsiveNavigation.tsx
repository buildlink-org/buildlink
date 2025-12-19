import { Home, Plus, BookOpen, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Mail, Linkedin, X, Instagram } from "lucide-react";

interface ResponsiveNavigationProps {
  loading?: boolean;
}

const ResponsiveNavigation = ({ loading }: ResponsiveNavigationProps) => {
  const location = useLocation();

  const navigationItems = [
    { id: "home", title: "Home Feed", icon: Home, path: "/feed" },
    // { id: "mentorship", title: "Mentorship", icon: Users, path: "/mentorship" },
    { id: "post", title: "Create", icon: Plus, path: "/create-post" },
    {
      id: "skillup",
      title: "Resource Hub",
      icon: BookOpen,
      path: "/resource-hub",
    },
    { id: "profile", title: "Profile Board", icon: User, path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="md:block hidden fixed md:w-30 lg:w-60 xl:w-72 h-full">
        <nav className="p-4 space-y-2 h-full overflow-y-auto text-foreground">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 w-full p-3 rounded-md text-left transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  active
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-foreground/90",
                  loading && "opacity-50 cursor-not-allowed"
                )}>
                <Icon size={20} />
                <span>{item.title}</span>
                {loading && active && (
                  <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
              </Link>
            );
          })}

          <div className="fixed bottom-4">
            {/* Quick Links */}
            <div className="flex flex-row justify-start space-x-6">
              <a
                href="/privacy-policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a
                href="/terms-of-service.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>

            {/* Contact Icons */}
            <div className="flex justify-start space-x-4 mt-4 text-foreground/80">
              <a
                title="Email"
                href="mailto:info@buildlink.co.ke"
                className="text-foreground/60 hover:text-primary transition-colors">
                <Mail size={20} />
              </a>
              <a
                title="Linkedin"
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
              <a
                title="Twitter"
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors">
                <X size={20} />
              </a>
              <a
                title="Instagram"
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden block fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around pt-2 pb-1 max-w-6xl mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex flex-col items-center min-w-[60px] transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                  loading && "opacity-50 cursor-not-allowed"
                )}>
                <Icon
                  className={cn(
                    "h-6 w-6 mb-1",
                    item.id === "post" &&
                      active &&
                      "bg-primary text-primary-foreground rounded-full p-1 h-8 w-8"
                  )}
                />
                <span className="text-xs font-medium">{item.title}</span>
                {loading && active && (
                  <div className="absolute -top-1 -right-1 animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ResponsiveNavigation;
