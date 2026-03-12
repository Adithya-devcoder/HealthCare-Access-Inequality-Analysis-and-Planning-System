import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import LocationMap from "@/components/LocationMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { hospitals, getDistance } from "@/data/mockData";
import { MapPin, Star, Phone, Bed, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hospitals = () => {
  const { latitude, longitude } = useGeolocation();
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "price">(
    "distance",
  );
  const ref = useRef<HTMLDivElement>(null);

  const lat = latitude ?? 12.8231;
  const lng = longitude ?? 80.0442;

  const sortedHospitals = hospitals
    .map((h) => ({
      ...h,
      distance: getDistance(lat, lng, h.latitude, h.longitude),
    }))
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hospital-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
      );
    }, ref);
    return () => ctx.revert();
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">
                Find <span className="text-gradient">Hospitals</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse hospitals by distance, rating, or availability
              </p>
            </div>
            <div className="flex gap-2">
              {(["distance", "rating", "price"] as const).map((s) => (
                <Button
                  key={s}
                  variant={sortBy === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(s)}
                  className={
                    sortBy === s
                      ? "hero-gradient text-primary-foreground border-0"
                      : ""
                  }
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div ref={ref} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {sortedHospitals.map((hospital) => (
                <div
                  key={hospital.hos_id}
                  className="hospital-card glass-card p-5 hover:shadow-glow transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-lg">
                          {hospital.name}
                        </h3>
                        {hospital.is_emergency && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emergency/10 text-emergency font-medium">
                            Emergency
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {hospital.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Star className="w-4 h-4 text-warning fill-warning" />{" "}
                          {hospital.rating}
                        </span>
                        <span className="text-muted-foreground">
                          {hospital.distance} km
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5" /> {hospital.total_beds}{" "}
                          beds
                        </span>
                        <span className="text-primary font-medium">
                          {hospital.price_range}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {hospital.departments.map((d) => (
                          <span
                            key={d}
                            className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Link to={`/doctors?hospital=${hospital.hos_id}`}>
                        <Button
                          size="sm"
                          className="hero-gradient text-primary-foreground border-0"
                        >
                          View Doctors
                        </Button>
                      </Link>
                      <a href={`tel:${hospital.phone}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          <Phone className="w-3.5 h-3.5 mr-1" /> Call
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-28">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Hospital Map
                </h3>
                <LocationMap className="h-[600px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
