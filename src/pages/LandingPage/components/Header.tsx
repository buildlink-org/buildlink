import { useState } from "react";
import { Hash, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import buildlinkLogo from "@/assets/buildlink-logo.png";
import { HashLink } from "react-router-hash-link";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={buildlinkLogo}
              alt="BuildLink Logo" 
              className="w-auto h-8 object-contain"
            />
            <span className="text-xl font-bold text-primary">BuildLink</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <HashLink smooth to="/#home" className="text-foreground hover:text-primary transition-colors"> Home</HashLink>
            <HashLink smooth to="/#features" className="text-foreground hover:text-primary transition-colors"> Features</HashLink>
            <HashLink smooth to="/#process" className="text-foreground hover:text-primary transition-colors"> Process</HashLink>
            <a href="/auth">
            <Button variant="cta" size="sm">
              Sign Up
            </Button>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t">
            <div className="flex flex-col space-y-4 pt-4">
                <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#process" className="text-foreground hover:text-primary transition-colors">
              Process
            </a>
              <div className="flex flex-col space-y-2 pt-4">
               <a href="/auth">
                <Button variant="cta" size="sm" className="w-full">
                  Sign Up
                </Button>
                </a>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
