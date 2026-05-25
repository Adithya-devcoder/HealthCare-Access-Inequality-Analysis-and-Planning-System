import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "@/contexts/AuthContext";
import { useEmergency, EmergencyAlert } from "@/contexts/EmergencyContext";
import { hospitals, getDistance } from "@/data/mockData";
import {
  AlertTriangle,
  Bell,
  MapPin,
  Clock,
  Phone,
  Navigation,
  LogOut,
  Building2,
  Ambulance,
  CheckCircle,
  XCircle,
  User,
  Siren,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const emergencyIcon = new L.DivIcon({
  html: `<div style="
    width: 40px; height: 40px; 
    background: linear-gradient(135deg, hsl(0, 80%, 50%), hsl(20, 90%, 55%)); 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
    animation: pulse-ring 1.5s ease-out infinite;
    border: 3px solid white;
    font-size: 18px;
  ">🚨</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: "",
});

const hospitalIcon = new L.DivIcon({
  html: `<div style="
    width: 36px; height: 36px;
    background: linear-gradient(135deg, hsl(200, 80%, 35%), hsl(170, 60%, 40%));
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    font-size: 16px;
  ">🏥</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: "",
});

// Component to fit map to alert bounds
const FitBounds = ({ alert, hospital }: { alert: EmergencyAlert | null; hospital: { latitude: number; longitude: number } }) => {
  const map = useMap();
  useEffect(() => {
    if (alert) {
      const bounds = L.latLngBounds(
        [alert.latitude, alert.longitude],
        [hospital.latitude, hospital.longitude]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([hospital.latitude, hospital.longitude], 13);
    }
  }, [alert, hospital, map]);
  return null;
};

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const { alerts, acknowledgeAlert, declineAlert, dispatchAlert, clearAlert } = useEmergency();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const prevAlertCountRef = useRef(0);

  const myHospital = hospitals.find((h) => h.hos_id === user?.hospitalId) || hospitals[0];

  // Show ALL emergency alerts on this hospital's dashboard
  const myAlerts = alerts;
  const activeAlerts = myAlerts.filter((a) => a.status === "active");
  const acknowledgedAlerts = myAlerts.filter((a) => a.status === "acknowledged");
  const dispatchedAlerts = myAlerts.filter((a) => a.status === "dispatched");
  const declinedAlerts = myAlerts.filter((a) => a.status === "declined");

  // Detect new alerts and play sound/animation
  useEffect(() => {
    if (activeAlerts.length > prevAlertCountRef.current) {
      setHasNewAlert(true);
      setSelectedAlert(activeAlerts[0]);

      // Play alert sound
      try {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gain.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => {
          oscillator.frequency.value = 1000;
        }, 200);
        setTimeout(() => {
          oscillator.frequency.value = 800;
        }, 400);
        setTimeout(() => {
          oscillator.stop();
          audioCtx.close();
        }, 600);
      } catch {
        // Audio may fail silently
      }

      setTimeout(() => setHasNewAlert(false), 5000);
    }
    prevAlertCountRef.current = activeAlerts.length;
  }, [activeAlerts]);

  useEffect(() => {
    if (!user || user.role !== "hospital") {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAccept = (alert: EmergencyAlert) => {
    acknowledgeAlert(alert.id, myHospital.name, myHospital.hos_id);
    setSelectedAlert(alert);
  };

  const handleDecline = (alert: EmergencyAlert) => {
    declineAlert(alert.id, myHospital.hos_id);
  };

  const handleDispatch = (alert: EmergencyAlert) => {
    dispatchAlert(alert.id);
  };

  const getTimeSince = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getStatusBadge = (alert: EmergencyAlert) => {
    switch (alert.status) {
      case "active":
        return "bg-emergency text-white";
      case "acknowledged":
        return "bg-success text-white";
      case "dispatched":
        return "bg-primary text-white";
      case "declined":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (alert: EmergencyAlert) => {
    switch (alert.status) {
      case "active":
        return "INCOMING";
      case "acknowledged":
        return `ACCEPTED by ${alert.acceptedByHospital || "Hospital"}`;
      case "dispatched":
        return "🚑 AMBULANCE DISPATCHED";
      case "declined":
        return "ALL DECLINED";
      default:
        return alert.status;
    }
  };

  const getBorderColor = (alert: EmergencyAlert) => {
    switch (alert.status) {
      case "active":
        return "border-l-emergency bg-emergency/5";
      case "acknowledged":
        return "border-l-success bg-success/5";
      case "dispatched":
        return "border-l-primary bg-primary/5";
      case "declined":
        return "border-l-muted";
      default:
        return "border-l-muted";
    }
  };

  if (!user || user.role !== "hospital") return null;

  return (
    <div ref={ref} className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className={`px-4 py-2 text-center transition-all duration-300 ${
          activeAlerts.length > 0
            ? "emergency-gradient"
            : "hero-gradient"
        }`}>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
            {activeAlerts.length > 0 ? (
              <>
                <Siren className="w-4 h-4 animate-pulse" />
                {activeAlerts.length} INCOMING EMERGENCY ALERT{activeAlerts.length > 1 ? "S" : ""} — ACCEPT OR DECLINE
                <Siren className="w-4 h-4 animate-pulse" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Hospital Dashboard — No Active Emergencies
              </>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-display text-foreground">{myHospital.name}</h2>
                <p className="text-xs text-muted-foreground">Hospital Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className={`w-5 h-5 ${activeAlerts.length > 0 ? "text-emergency animate-bounce" : "text-muted-foreground"}`} />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emergency text-[10px] text-white rounded-full flex items-center justify-center font-bold">
                    {activeAlerts.length}
                  </span>
                )}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-[108px] pb-8">
        <div className="container mx-auto px-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className={`dash-card glass-card p-4 text-center opacity-0 ${activeAlerts.length > 0 ? "border-emergency/50" : ""}`}>
              <AlertTriangle className={`w-6 h-6 mx-auto mb-2 ${activeAlerts.length > 0 ? "text-emergency animate-pulse" : "text-muted-foreground"}`} />
              <p className={`text-2xl font-bold font-display ${activeAlerts.length > 0 ? "text-emergency" : "text-foreground"}`}>
                {activeAlerts.length}
              </p>
              <p className="text-xs text-muted-foreground">Incoming</p>
            </div>
            <div className="dash-card glass-card p-4 text-center opacity-0">
              <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">{acknowledgedAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
            <div className="dash-card glass-card p-4 text-center opacity-0">
              <Ambulance className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">{dispatchedAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Dispatched</p>
            </div>
            <div className="dash-card glass-card p-4 text-center opacity-0">
              <XCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">{declinedAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Declined</p>
            </div>
            <div className="dash-card glass-card p-4 text-center opacity-0">
              <Building2 className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">{myHospital.emergency_beds}</p>
              <p className="text-xs text-muted-foreground">Beds</p>
            </div>
          </div>

          {/* New Alert Banner - Full-width Accept/Decline prompt */}
          {hasNewAlert && activeAlerts.length > 0 && (
            <div className="mb-6 p-5 rounded-2xl emergency-gradient text-white shadow-emergency">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Siren className="w-8 h-8 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold">🚨 NEW EMERGENCY ALERT!</h3>
                  <p className="text-sm text-white/90 mt-1">
                    <strong>{activeAlerts[0].userName}</strong> needs immediate assistance — 
                    <strong> {getDistance(myHospital.latitude, myHospital.longitude, activeAlerts[0].latitude, activeAlerts[0].longitude)} km</strong> away
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    📍 Location: {activeAlerts[0].latitude.toFixed(4)}, {activeAlerts[0].longitude.toFixed(4)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAccept(activeAlerts[0])}
                    className="bg-white text-success font-bold hover:bg-white/90 px-6 h-11 text-base"
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    ACCEPT
                  </Button>
                  <Button
                    onClick={() => handleDecline(activeAlerts[0])}
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white/20 px-6 h-11 text-base font-bold"
                  >
                    <ThumbsDown className="w-5 h-5 mr-2" />
                    DECLINE
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Alerts List */}
            <div className="dash-card opacity-0">
              <h2 className="text-lg font-bold font-display text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emergency" />
                Emergency Alerts
                {activeAlerts.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-emergency text-white animate-pulse">
                    {activeAlerts.length} INCOMING
                  </span>
                )}
              </h2>

              {myAlerts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-success/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Emergency Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    All clear! You'll receive alerts here when a patient triggers an emergency 108 call.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {myAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`glass-card p-4 cursor-pointer transition-all duration-200 border-l-4 hover:shadow-md ${getBorderColor(alert)} ${
                        selectedAlert?.id === alert.id ? "ring-2 ring-primary" : ""
                      } ${alert.status === "active" ? "animate-pulse" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <User className="w-4 h-4 text-foreground" />
                            <span className="font-semibold text-foreground">{alert.userName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(alert)}`}>
                              {getStatusLabel(alert)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {alert.userPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeSince(alert.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {getDistance(myHospital.latitude, myHospital.longitude, alert.latitude, alert.longitude)} km
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </p>
                          {/* Show declined hospitals */}
                          {alert.declinedByHospitals && alert.declinedByHospitals.length > 0 && (
                            <p className="text-xs text-emergency/70 mt-1">
                              ⚠️ Declined by: {alert.declinedByHospitals
                                .map((hid) => hospitals.find((h) => h.hos_id === hid)?.name || `Hospital #${hid}`)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {/* ACTIVE: Show Accept & Decline */}
                        {alert.status === "active" && (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleAccept(alert); }}
                              className="bg-success hover:bg-success/90 text-white text-xs h-8 font-bold"
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDecline(alert); }}
                              variant="outline"
                              className="text-xs h-8 border-emergency/50 text-emergency hover:bg-emergency/10 font-bold"
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}

                        {/* ACKNOWLEDGED: Show Dispatch Ambulance button */}
                        {alert.status === "acknowledged" && (
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleDispatch(alert); }}
                            className="emergency-gradient text-white text-xs h-8 border-0 font-bold"
                          >
                            <Ambulance className="w-3 h-3 mr-1" />
                            Dispatch Ambulance
                          </Button>
                        )}

                        {/* DISPATCHED: Show Resolve */}
                        {alert.status === "dispatched" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); clearAlert(alert.id); }}
                            className="text-xs h-8 text-muted-foreground"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Resolve & Close
                          </Button>
                        )}

                        {/* Always show Directions for non-declined */}
                        {alert.status !== "declined" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `https://www.google.com/maps/dir/${myHospital.latitude},${myHospital.longitude}/${alert.latitude},${alert.longitude}`;
                              window.open(url, "_blank");
                            }}
                            className="text-xs h-8"
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Directions
                          </Button>
                        )}

                        {/* DECLINED by all: option to clear */}
                        {alert.status === "declined" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); clearAlert(alert.id); }}
                            className="text-xs h-8 text-muted-foreground"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="dash-card opacity-0">
              <h2 className="text-lg font-bold font-display text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Emergency Location Map
                {selectedAlert && (
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    Showing: {selectedAlert.userName}'s location
                  </span>
                )}
              </h2>
              <div className="rounded-xl overflow-hidden border border-border/50" style={{ height: "500px" }}>
                <MapContainer
                  center={[myHospital.latitude, myHospital.longitude]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds alert={selectedAlert} hospital={myHospital} />

                  {/* Hospital marker */}
                  <Marker
                    position={[myHospital.latitude, myHospital.longitude]}
                    icon={hospitalIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>{myHospital.name}</strong><br />
                        <span className="text-xs">Your Hospital</span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Alert markers */}
                  {myAlerts
                    .filter((a) => a.status !== "declined")
                    .map((alert) => (
                    <Marker
                      key={alert.id}
                      position={[alert.latitude, alert.longitude]}
                      icon={emergencyIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong className="text-red-600">🚨 {alert.userName}</strong><br />
                          <span className="text-xs">{alert.userPhone}</span><br />
                          <span className="text-xs font-semibold uppercase" style={{
                            color: alert.status === "active" ? "#ef4444" : alert.status === "acknowledged" ? "#22c55e" : "#3b82f6"
                          }}>
                            {getStatusLabel(alert)}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Highlight circle around selected alert */}
                  {selectedAlert && selectedAlert.status !== "declined" && (
                    <Circle
                      center={[selectedAlert.latitude, selectedAlert.longitude]}
                      radius={500}
                      pathOptions={{
                        color: "#ef4444",
                        fillColor: "#ef4444",
                        fillOpacity: 0.1,
                        weight: 2,
                      }}
                    />
                  )}
                </MapContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, hsl(200, 80%, 35%), hsl(170, 60%, 40%))" }} />
                  Hospital
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, hsl(0, 80%, 50%), hsl(20, 90%, 55%))" }} />
                  Emergency Patient
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency pulse CSS */}
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default HospitalDashboard;
