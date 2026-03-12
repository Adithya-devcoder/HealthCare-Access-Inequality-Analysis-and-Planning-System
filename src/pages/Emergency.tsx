import { useEffect, useRef } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import LocationMap from "@/components/LocationMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { hospitals, getDistance } from "@/data/mockData";
import { Phone, Navigation, AlertTriangle, Clock, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";

const Emergency = () => {
  const { latitude, longitude } = useGeolocation();
  const ref = useRef<HTMLDivElement>(null);

  const lat = latitude ?? 12.8231;
  const lng = longitude ?? 80.0442;

  const emergencyHospitals = hospitals
    .filter((h) => h.is_emergency)
    .map((h) => ({
      ...h,
      distance: getDistance(lat, lng, h.latitude, h.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".emergency-card",
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.15 },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const handleNavigate = (hospital: (typeof emergencyHospitals)[0]) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
    window.open(url, "_blank");
  };

  const handleSOS = () => {
    if (emergencyHospitals.length > 0) {
      handleNavigate(emergencyHospitals[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* SOS Header */}
          <div className="text-center mb-10">
            <button
              onClick={handleSOS}
              className="w-32 h-32 rounded-full emergency-gradient text-emergency-foreground text-2xl font-bold sos-pulse mx-auto flex items-center justify-center shadow-emergency transition-transform hover:scale-110 cursor-pointer"
            >
              🆘 SOS
            </button>
            <h1 className="mt-6 text-3xl font-bold font-display text-foreground">
              Emergency <span className="text-emergency">Response</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tap SOS to navigate to the nearest emergency hospital instantly
            </p>
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 mt-4 text-emergency font-semibold hover:underline"
            >
              <Phone className="w-4 h-4" /> Call 108 - National Emergency
            </a>
          </div>

          <div ref={ref} className="grid lg:grid-cols-2 gap-8">
            {/* Hospital List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold font-display text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emergency" />
                Nearest Emergency Hospitals
              </h2>
              {emergencyHospitals.map((hospital, i) => (
                <div
                  key={hospital.hos_id}
                  className={`emergency-card glass-card p-5 border-l-4 ${i === 0 ? "border-l-emergency" : "border-l-primary"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {hospital.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {hospital.address}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-foreground font-medium">
                          <Navigation className="w-3.5 h-3.5 text-primary" />
                          {hospital.distance} km
                        </span>
                        <span className="flex items-center gap-1 text-foreground">
                          <Bed className="w-3.5 h-3.5 text-success" />
                          {hospital.emergency_beds} beds
                        </span>
                        <span className="flex items-center gap-1 text-foreground">
                          <Clock className="w-3.5 h-3.5 text-warning" />~
                          {Math.round(hospital.distance * 2)} min
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleNavigate(hospital)}
                      size="sm"
                      className={
                        i === 0
                          ? "emergency-gradient text-emergency-foreground border-0"
                          : "hero-gradient text-primary-foreground border-0"
                      }
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div>
              <h2 className="text-lg font-semibold font-display text-foreground mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emergency animate-pulse" />
                Emergency Map
              </h2>
              <LocationMap className="h-[500px]" showEmergencyOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
