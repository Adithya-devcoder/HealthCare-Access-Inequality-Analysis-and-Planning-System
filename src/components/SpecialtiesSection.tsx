import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { specialties } from "@/data/mockData";

gsap.registerPlugin(ScrollTrigger);

const SpecialtiesSection = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".spec-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display text-foreground">
            Browse by <span className="text-gradient">Specialty</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Find the right specialist for your needs
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {specialties.map((spec) => (
            <div
              key={spec.spec_id}
              className="spec-card glass-card p-5 text-center cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-glow"
            >
              <span className="text-3xl">{spec.icon}</span>
              <p className="mt-2 text-sm font-medium text-foreground">
                {spec.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;
