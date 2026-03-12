import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, Calendar, AlertTriangle, Shield, Activity, MapPin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Search,
    title: "Find Nearby Hospitals",
    description: "Instantly locate the nearest medical facilities with real-time distance and bed availability.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Calendar,
    title: "Instant Appointments",
    description: "Book consultations with top specialists in just a few taps. No more waiting in long queues.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: AlertTriangle,
    title: "24/7 Emergency Care",
    description: "One-tap SOS button to navigate to the nearest emergency response unit for immediate help.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Shield,
    title: "Trusted Specialists",
    description: "Access a verified network of experienced doctors across multiple specialties and departments.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: Activity,
    title: "Health Monitoring",
    description: "Keep track of your medical history and upcoming appointments in one secure dashboard.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: MapPin,
    title: "Smart Navigation",
    description: "Get precise GPS directions to any hospital or clinic within the Healthify network.",
    color: "text-cyan-500",
    bg: "bg-cyan-50",
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feature-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-4">
            Everything you need for <span className="text-gradient">Better Health</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Healthify provides comprehensive tools to bridge the gap in healthcare access, 
            ensuring quality care is available to everyone, everywhere.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card glass-card p-8 group hover:shadow-glow transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
