import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/emergency", label: "Emergency" },
    { to: "/hospitals", label: "Hospitals" },
    { to: "/doctors", label: "Doctors" },
    { to: "/appointments", label: "Appointments" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      {/* Emergency Top Bar */}
      <div className="emergency-gradient px-4 py-1.5 text-center">
        <Link
          to="/emergency"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-emergency-foreground"
        >
          <Phone className="w-3.5 h-3.5 animate-pulse" />
          Emergency? Click here or call 108 for immediate help
          <Phone className="w-3.5 h-3.5 animate-pulse" />
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold font-display text-foreground">
                Heal
              </span>
              <span className="text-lg font-bold font-display text-gradient">
                thify
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/emergency">
              <Button className="emergency-gradient text-emergency-foreground border-0 sos-pulse font-bold text-sm">
                🆘 SOS
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/emergency"
              onClick={() => setIsOpen(false)}
              className="block mt-3"
            >
              <Button className="w-full emergency-gradient text-emergency-foreground border-0 sos-pulse font-bold">
                🆘 SOS Emergency
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
