import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import { doctors, hospitals, specialties } from "@/data/mockData";
import { Star, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const hospitalFilter = searchParams.get("hospital");
  const [specFilter, setSpecFilter] = useState<string>("all");
  const ref = useRef<HTMLDivElement>(null);

  const filteredDoctors = doctors.filter((d) => {
    if (hospitalFilter && !d.hospital_ids.includes(Number(hospitalFilter)))
      return false;
    if (specFilter !== "all" && d.specialty !== specFilter) return false;
    return true;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".doctor-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
      );
    }, ref);
    return () => ctx.revert();
  }, [specFilter, hospitalFilter]);

  const getHospitalNames = (ids: number[]) =>
    ids
      .map((id) => hospitals.find((h) => h.hos_id === id)?.name)
      .filter(Boolean)
      .join(", ");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-display text-foreground">
              Our <span className="text-gradient">Doctors</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Find the right specialist for your needs
            </p>
          </div>

          {/* Specialty Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={specFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSpecFilter("all")}
              className={
                specFilter === "all"
                  ? "hero-gradient text-primary-foreground border-0"
                  : ""
              }
            >
              All
            </Button>
            {specialties.map((s) => (
              <Button
                key={s.spec_id}
                variant={specFilter === s.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSpecFilter(s.name)}
                className={
                  specFilter === s.name
                    ? "hero-gradient text-primary-foreground border-0"
                    : ""
                }
              >
                {s.icon} {s.name}
              </Button>
            ))}
          </div>

          <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.doc_id}
                className="doctor-card glass-card p-6 hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full hero-gradient flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {doc.name.split(" ").pop()?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      {doc.specialty}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span>{doc.rating} rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">
                      {getHospitalNames(doc.hospital_ids)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {doc.available_slots.length} slots available today
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {doc.available_slots.slice(0, 4).map((slot) => (
                    <span
                      key={slot}
                      className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium"
                    >
                      {slot}
                    </span>
                  ))}
                  {doc.available_slots.length > 4 && (
                    <span className="text-xs px-2 py-1 text-muted-foreground">
                      +{doc.available_slots.length - 4} more
                    </span>
                  )}
                </div>

                <Link to={`/appointments?doctor=${doc.doc_id}`}>
                  <Button className="w-full hero-gradient text-primary-foreground border-0">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">
                  No doctors found for the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
