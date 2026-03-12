import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, MapPin, Stethoscope } from "lucide-react";
import LocationMap from "@/components/LocationMap";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
      )
        .fromTo(
          subtitleRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.5",
        )
        .fromTo(
          ctaRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4",
        )
        .fromTo(
          cardsRef.current?.children
            ? Array.from(cardsRef.current.children)
            : [],
          { y: 40, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
          "-=0.3",
        )
        .fromTo(
          mapRef.current,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1 },
          "-=1",
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Shield, label: "Trusted Care", value: "500+" },
    { icon: Clock, label: "24/7 Available", value: "Always" },
    { icon: MapPin, label: "Hospitals", value: "50+" },
    { icon: Stethoscope, label: "Specialists", value: "200+" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-28 pb-16 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Smart Healthcare for Everyone
              </div>

              <h1
                ref={titleRef}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight opacity-0"
              >
                Your Health,
                <br />
                <span className="text-gradient">Our Priority</span>
              </h1>

              <p
                ref={subtitleRef}
                className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed opacity-0"
              >
                Bridging healthcare access inequality for rural and semi-urban
                areas. Find hospitals, book appointments, and get emergency care
                — all in one platform.
              </p>
            </div>

            <div ref={ctaRef} className="flex flex-wrap gap-4 opacity-0">
              <Link to="/hospitals">
                <Button
                  size="lg"
                  className="hero-gradient text-primary-foreground border-0 shadow-glow text-base px-8 h-12 font-semibold"
                >
                  Find Hospitals
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/emergency">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emergency text-emergency hover:bg-emergency hover:text-emergency-foreground text-base px-8 h-12 font-semibold transition-all"
                >
                  🆘 Emergency
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div
              ref={cardsRef}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card p-4 text-center opacity-0"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold font-display text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Map */}
          <div ref={mapRef} className="opacity-0 lg:sticky lg:top-28">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Your Real-Time Location
                </h3>
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              </div>
              <LocationMap className="h-[420px] lg:h-[480px]" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: "hsl(0, 80%, 50%)" }}
                  />
                  Emergency
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: "hsl(200, 80%, 35%)" }}
                  />
                  Hospital
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: "hsl(145, 60%, 40%)" }}
                  />
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
