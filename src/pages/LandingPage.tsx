import { useEffect } from "react";
import Header from "./LandingPage/components/Header";
import HeroSection from "./LandingPage/components/HeroSection";
import AboutSection from "./LandingPage/components/AboutSection";
import FeaturesSection from "./LandingPage/components/FeaturesSection";
import HowItWorksSection from "./LandingPage/components/HowItWorksSection";
import CTASection from "./LandingPage/components/CTASection";
import Footer from "./LandingPage/components/Footer";


const LandingPage = () => {
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("dark");

    return () => {
      if (hadDark) root.classList.add("dark");
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 [color-scheme:light]">
      <Header />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;