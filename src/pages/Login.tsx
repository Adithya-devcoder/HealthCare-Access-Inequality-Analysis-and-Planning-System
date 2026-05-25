import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { hospitals } from "@/data/mockData";
import { Heart, User, Building2, ArrowRight, Shield, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".login-hero",
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo(
        ".role-card",
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 0.3 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (selectedRole && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 30, opacity: 0, height: 0 },
        { y: 0, opacity: 1, height: "auto", duration: 0.5, ease: "power3.out" }
      );
    }
  }, [selectedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedRole) return;

    setIsLoading(true);

    setTimeout(() => {
      login({
        name,
        email,
        role: selectedRole,
        hospitalId: selectedRole === "hospital" ? selectedHospital : undefined,
      });

      if (selectedRole === "hospital") {
        navigate("/hospital-dashboard");
      } else {
        navigate("/");
      }
    }, 800);
  };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-[10%] w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-[10%] w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Logo & Header */}
        <div className="login-hero text-center mb-10 opacity-0">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center shadow-glow">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-display">
            <span className="text-foreground">Heal</span>
            <span className="text-gradient">thify</span>
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-md mx-auto">
            Smart Healthcare Access Platform — Login to continue
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
          {/* General User Card */}
          <button
            onClick={() => setSelectedRole("general")}
            className={`role-card opacity-0 group relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
              selectedRole === "general"
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border/50 glass-card hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
              selectedRole === "general"
                ? "hero-gradient shadow-glow"
                : "bg-primary/10 group-hover:bg-primary/20"
            }`}>
              <User className={`w-8 h-8 ${selectedRole === "general" ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <h3 className="text-xl font-bold font-display text-foreground mb-2">General User</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access emergency services, find nearby hospitals, book appointments with doctors
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-success" />
              <span>SOS Emergency</span>
              <span className="text-border">•</span>
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
              <span>Book Appointments</span>
            </div>
            {selectedRole === "general" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full hero-gradient flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Hospital User Card */}
          <button
            onClick={() => setSelectedRole("hospital")}
            className={`role-card opacity-0 group relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
              selectedRole === "hospital"
                ? "border-emergency bg-emergency/5 shadow-emergency"
                : "border-border/50 glass-card hover:border-emergency/50 hover:shadow-md"
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
              selectedRole === "hospital"
                ? "emergency-gradient shadow-emergency"
                : "bg-emergency/10 group-hover:bg-emergency/20"
            }`}>
              <Building2 className={`w-8 h-8 ${selectedRole === "hospital" ? "text-emergency-foreground" : "text-emergency"}`} />
            </div>
            <h3 className="text-xl font-bold font-display text-foreground mb-2">Hospital Staff</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Receive emergency alerts, track patient locations, dispatch ambulances in real-time
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-emergency" />
              <span>Emergency Alerts</span>
              <span className="text-border">•</span>
              <Building2 className="w-3.5 h-3.5 text-emergency" />
              <span>Ambulance Dispatch</span>
            </div>
            {selectedRole === "hospital" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full emergency-gradient flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Login Form */}
        {selectedRole && (
          <div ref={formRef} className="w-full max-w-md opacity-0">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-xl font-bold font-display text-foreground mb-1">
                {selectedRole === "general" ? "Welcome, User" : "Hospital Login"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {selectedRole === "general"
                  ? "Enter your details to access emergency & healthcare services"
                  : "Enter your details to access the hospital dashboard"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={selectedRole === "general" ? "Enter your full name" : "Enter staff name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 h-11 bg-background/50"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11 bg-background/50"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 h-11 bg-background/50"
                    required
                  />
                </div>

                {selectedRole === "hospital" && (
                  <div>
                    <Label htmlFor="hospital" className="text-sm font-medium text-foreground">
                      Select Your Hospital
                    </Label>
                    <select
                      id="hospital"
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(Number(e.target.value))}
                      className="mt-1.5 w-full h-11 rounded-md border border-input bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {hospitals.map((h) => (
                        <option key={h.hos_id} value={h.hos_id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !name || !email}
                  className={`w-full h-12 text-base font-semibold border-0 mt-2 ${
                    selectedRole === "hospital"
                      ? "emergency-gradient text-emergency-foreground"
                      : "hero-gradient text-primary-foreground shadow-glow"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {selectedRole === "general" ? "Continue as User" : "Login to Dashboard"}
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
