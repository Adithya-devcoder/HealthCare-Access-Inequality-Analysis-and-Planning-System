import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SpecialtiesSection from "@/components/SpecialtiesSection";
import FeaturesSection from "@/components/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SpecialtiesSection />
      <FeaturesSection />
      <footer className="py-10 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Healthify. Bridging healthcare access for all.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
