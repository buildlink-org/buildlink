import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Building2, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50"></div>
      </div>

      <div className="container mx-auto px-6 pb-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 px-4 animate-fade-in-up">
            Connecting Kenya's{" "}
            <span className="bg-hero-gradient bg-clip-text text-transparent">
              Built Environment
            </span>
            , Digitally.
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover professionals, showcase projects, and explore opportunities in one centralized platform for architects, engineers, and construction professionals across Kenya.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <a href="/auth">
              <Button variant="cta" size="lg" className="text-lg px-8 py-6">
                Sign Up For Free
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </a>

          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-center space-x-3">
              <Users className="text-primary" size={30} />
              <span className="text-lg text-foreground">Growing Community</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Building2 className="text-primary" size={30} />
              <span className="text-lg text-foreground">Project Showcase</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <MapPin className="text-primary" size={30} />
              <span className="text-lg text-foreground">Kenya-wide Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="md:block hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
