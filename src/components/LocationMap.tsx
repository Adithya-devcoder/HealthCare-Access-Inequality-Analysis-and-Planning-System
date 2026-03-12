import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGeolocation } from "@/hooks/useGeolocation";
import { hospitals, getDistance } from "@/data/mockData";
import { MapPin, AlertTriangle } from "lucide-react";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const userIcon = new L.DivIcon({
  html: `<div style="background: hsl(200, 80%, 35%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,100,200,0.5);"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const emergencyIcon = new L.DivIcon({
  html: `<div style="background: hsl(0, 80%, 50%); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(200,0,0,0.5);"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const hospitalIcon = new L.DivIcon({
  html: `<div style="background: hsl(200, 80%, 35%); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,100,200,0.4);"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 11);
  }, [lat, lng, map]);
  return null;
}

interface LocationMapProps {
  className?: string;
  showEmergencyOnly?: boolean;
  compact?: boolean;
}

const LocationMap = ({
  className = "",
  showEmergencyOnly = false,
  compact = false,
}: LocationMapProps) => {
  const { latitude, longitude, error, loading } = useGeolocation();

  const defaultLat = 12.8231;
  const defaultLng = 80.0442;
  const lat = latitude ?? defaultLat;
  const lng = longitude ?? defaultLng;

  const filteredHospitals = showEmergencyOnly
    ? hospitals.filter((h) => h.is_emergency)
    : hospitals;

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-border/50 ${className}`}
      style={{ boxShadow: "var(--shadow-lg)" }}
    >
      {loading && (
        <div className="absolute top-2 right-2 z-[1000] bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-border">
          <div className="w-2 h-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Detecting location...
        </div>
      )}
      
      {error && !latitude && (
        <div className="absolute top-2 right-2 z-[1000] bg-warning/10 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-warning flex items-center gap-1 border border-warning/20">
          <AlertTriangle className="w-3 h-3" />
          Using default location
        </div>
      )}

      <MapContainer
        center={[lat, lng]}
        zoom={11}
        style={{
          height: "100%",
          width: "100%",
          minHeight: compact ? "300px" : "400px",
        }}
        zoomControl={!compact}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater lat={lat} lng={lng} />

        {/* User location */}
        <Marker position={[lat, lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">📍 Your Location</p>
              <p className="text-xs text-gray-500">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={[lat, lng]}
          radius={500}
          pathOptions={{ color: "hsl(200, 80%, 35%)", fillOpacity: 0.1 }}
        />

        {/* Hospitals */}
        {filteredHospitals.map((hospital) => {
          const dist = getDistance(
            lat,
            lng,
            hospital.latitude,
            hospital.longitude,
          );
          return (
            <Marker
              key={hospital.hos_id}
              position={[hospital.latitude, hospital.longitude]}
              icon={hospital.is_emergency ? emergencyIcon : hospitalIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-bold text-sm">{hospital.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {hospital.address}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="font-medium">{dist} km away</span>
                    <span>•</span>
                    <span>⭐ {hospital.rating}</span>
                  </div>
                  {hospital.is_emergency && (
                    <p
                      className="text-xs mt-1 font-medium"
                      style={{ color: "hsl(0, 80%, 50%)" }}
                    >
                      🚨 Emergency: {hospital.emergency_beds} beds available
                    </p>
                  )}
                  <p className="text-xs mt-1 text-gray-600">
                    {hospital.price_range}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
