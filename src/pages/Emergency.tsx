import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import LocationMap from "@/components/LocationMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/contexts/AuthContext";
import { useEmergency } from "@/contexts/EmergencyContext";
import { hospitals, getDistance } from "@/data/mockData";
import { Phone, Navigation, AlertTriangle, Clock, Bed, Siren, CheckCircle, Ambulance, XCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Emergency = () => {
  const { latitude, longitude } = useGeolocation();
  const { user } = useAuth();
  const { alerts, addAlert } = useEmergency();
  const ref = useRef<HTMLDivElement>(null);
  const [alertSent, setAlertSent] = useState(false);
  const [alertSending, setAlertSending] = useState(false);
  const [sentAlertId, setSentAlertId] = useState<string | null>(null);

  const lat = latitude ?? 12.8231;
  const lng = longitude ?? 80.0442;

  const emergencyHospitals = hospitals
    .filter((h) => h.is_emergency)
    .map((h) => ({
      ...h,
      distance: getDistance(lat, lng, h.latitude, h.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  // Track the sent alert in real-time (to show status updates from hospital)
  const sentAlert = sentAlertId ? alerts.find((a) => a.id === sentAlertId) : null;

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

  const handle108 = () => {
    if (alertSending || alertSent) return;

    const nearestHospital = emergencyHospitals[0];
    if (!nearestHospital) return;

    setAlertSending(true);

    setTimeout(() => {
      const alertId = `emergency_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const alert = {
        id: alertId,
        userName: user?.name || "Anonymous User",
        userPhone: user?.email || "Unknown",
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
        status: "active" as const,
        nearestHospitalId: nearestHospital.hos_id,
        declinedByHospitals: [] as number[],
      };

      addAlert(alert);
      setAlertSending(false);
      setAlertSent(true);
      setSentAlertId(alertId);
    }, 1500);
  };

  // Get the current assigned hospital name
  const getCurrentAssignedHospital = () => {
    if (!sentAlert) return emergencyHospitals[0]?.name || "nearest hospital";
    const h = hospitals.find((h) => h.hos_id === sentAlert.nearestHospitalId);
    return h?.name || "nearest hospital";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* SOS & 108 Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-8 mb-6">
              {/* SOS Button */}
              <div className="text-center">
                <button
                  onClick={handleSOS}
                  className="w-32 h-32 rounded-full emergency-gradient text-emergency-foreground text-2xl font-bold sos-pulse mx-auto flex items-center justify-center shadow-emergency transition-transform hover:scale-110 cursor-pointer"
                >
                  🆘 SOS
                </button>
                <p className="mt-3 text-sm text-muted-foreground font-medium">
                  Navigate to nearest hospital
                </p>
              </div>

              {/* 108 Button */}
              <div className="text-center">
                <button
                  onClick={handle108}
                  disabled={alertSending || alertSent}
                  className={`w-32 h-32 rounded-full text-white text-xl font-bold mx-auto flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border-4 ${
                    alertSent
                      ? sentAlert?.status === "dispatched"
                        ? "bg-primary border-primary/30 scale-105"
                        : sentAlert?.status === "acknowledged"
                        ? "bg-success border-success/30 scale-105"
                        : sentAlert?.status === "declined"
                        ? "bg-destructive border-destructive/30 scale-105"
                        : "bg-warning border-warning/30 scale-105 animate-pulse"
                      : alertSending
                      ? "bg-warning border-warning/30 animate-pulse"
                      : "bg-gradient-to-br from-red-600 via-red-500 to-orange-500 border-red-300/30 hover:scale-110 shadow-emergency sos-pulse"
                  }`}
                >
                  {alertSent ? (
                    sentAlert?.status === "dispatched" ? (
                      <>
                        <Ambulance className="w-8 h-8 mb-1" />
                        <span className="text-xs">Dispatched!</span>
                      </>
                    ) : sentAlert?.status === "acknowledged" ? (
                      <>
                        <CheckCircle className="w-8 h-8 mb-1" />
                        <span className="text-xs">Accepted!</span>
                      </>
                    ) : sentAlert?.status === "declined" ? (
                      <>
                        <XCircle className="w-8 h-8 mb-1" />
                        <span className="text-xs">Declined</span>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                        <span className="text-xs">Waiting...</span>
                      </>
                    )
                  ) : alertSending ? (
                    <>
                      <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                      <span className="text-sm">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Siren className="w-8 h-8 mb-1" />
                      <span className="text-2xl font-black">108</span>
                    </>
                  )}
                </button>
                <p className="mt-3 text-sm text-muted-foreground font-medium">
                  {!alertSent
                    ? "Share location with hospital"
                    : sentAlert?.status === "dispatched"
                    ? "🚑 Ambulance on the way!"
                    : sentAlert?.status === "acknowledged"
                    ? "✅ Hospital accepted!"
                    : sentAlert?.status === "declined"
                    ? "❌ All hospitals declined"
                    : "⏳ Waiting for hospital response..."}
                </p>
              </div>
            </div>

            <h1 className="mt-2 text-3xl font-bold font-display text-foreground">
              Emergency <span className="text-emergency">Response</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tap <strong>SOS</strong> to navigate to the nearest hospital • Tap <strong>108</strong> to alert the hospital & share your live location
            </p>

            {/* ===== LIVE STATUS UPDATES ===== */}
            {alertSent && sentAlert && (
              <div className="mt-6 mx-auto max-w-2xl space-y-3">
                {/* Status: Waiting for response */}
                {sentAlert.status === "active" && (
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 text-warning animate-pulse">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-warning/30 border-t-warning rounded-full animate-spin" />
                      <span className="font-semibold">
                        Waiting for response from {getCurrentAssignedHospital()}...
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-warning/80">
                      📍 Your location ({lat.toFixed(4)}, {lng.toFixed(4)}) has been shared. Stay calm.
                    </p>
                    {sentAlert.declinedByHospitals && sentAlert.declinedByHospitals.length > 0 && (
                      <p className="text-xs mt-2 text-warning/70">
                        ⚠️ Declined by: {sentAlert.declinedByHospitals
                          .map((hid) => hospitals.find((h) => h.hos_id === hid)?.name || `Hospital #${hid}`)
                          .join(", ")} — Alert forwarded to next hospital
                      </p>
                    )}
                  </div>
                )}

                {/* Status: Hospital ACCEPTED */}
                {sentAlert.status === "acknowledged" && (
                  <div className="p-5 rounded-xl bg-success/10 border-2 border-success/40 text-success">
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-bold">
                        🏥 {sentAlert.acceptedByHospital || "Hospital"} has ACCEPTED your emergency!
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-success/80">
                      Ambulance is being prepared for dispatch to your location.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-success/70">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {sentAlert.acceptedByHospital}
                      </span>
                      <span className="flex items-center gap-1">
                        📍 Your location: {lat.toFixed(4)}, {lng.toFixed(4)}
                      </span>
                    </div>
                    {sentAlert.declinedByHospitals && sentAlert.declinedByHospitals.length > 0 && (
                      <p className="text-xs mt-2 text-muted-foreground">
                        Previously declined by: {sentAlert.declinedByHospitals
                          .map((hid) => hospitals.find((h) => h.hos_id === hid)?.name || `Hospital #${hid}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Status: AMBULANCE DISPATCHED */}
                {sentAlert.status === "dispatched" && (
                  <div className="p-5 rounded-xl bg-primary/10 border-2 border-primary/40 text-primary">
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <Ambulance className="w-6 h-6" />
                      <span className="font-bold">
                        🚑 Ambulance has been DISPATCHED to your location!
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-primary/80">
                      <strong>{sentAlert.acceptedByHospital || "Hospital"}</strong> has sent an ambulance.
                      Stay at your current location and keep your phone accessible.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-primary/70">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        From: {sentAlert.acceptedByHospital}
                      </span>
                      <span className="flex items-center gap-1">
                        📍 To: {lat.toFixed(4)}, {lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status: ALL DECLINED */}
                {sentAlert.status === "declined" && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">
                        All nearby hospitals have declined the request.
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-destructive/80">
                      Please call 108 directly for assistance or try the SOS button to navigate to the nearest hospital.
                    </p>
                    <Button
                      onClick={() => { setAlertSent(false); setSentAlertId(null); }}
                      size="sm"
                      className="mt-3 emergency-gradient text-white border-0"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}
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
                    <div className="flex flex-col gap-2">
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
