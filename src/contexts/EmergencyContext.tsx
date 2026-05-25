import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { hospitals, getDistance } from "@/data/mockData";

export interface EmergencyAlert {
  id: string;
  userName: string;
  userPhone: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: "active" | "acknowledged" | "dispatched" | "declined";
  nearestHospitalId: number;
  // Track which hospitals have declined so the alert cascades to the next one
  declinedByHospitals: number[];
  // When a hospital accepts, store their info for the general user to see
  acceptedByHospital?: string;
  acceptedByHospitalId?: number;
}

interface EmergencyContextType {
  alerts: EmergencyAlert[];
  addAlert: (alert: EmergencyAlert) => void;
  acknowledgeAlert: (id: string, hospitalName: string, hospitalId: number) => void;
  declineAlert: (id: string, hospitalId: number) => void;
  dispatchAlert: (id: string) => void;
  clearAlert: (id: string) => void;
  getActiveAlerts: (hospitalId?: number) => EmergencyAlert[];
}

const STORAGE_KEY = "healthify_emergency_alerts";

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

// Helper: read alerts from localStorage
const readAlerts = (): EmergencyAlert[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper: write alerts to localStorage
const writeAlerts = (alerts: EmergencyAlert[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
};

// Helper: find the next nearest hospital that hasn't declined
const findNextHospital = (
  lat: number,
  lng: number,
  declinedIds: number[]
): number | null => {
  const emergencyHospitals = hospitals
    .filter((h) => h.is_emergency && !declinedIds.includes(h.hos_id))
    .map((h) => ({
      ...h,
      distance: getDistance(lat, lng, h.latitude, h.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  return emergencyHospitals.length > 0 ? emergencyHospitals[0].hos_id : null;
};

export const EmergencyProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(readAlerts);

  // Track whether we are the ones who wrote to localStorage (to avoid echo)
  const selfWriteRef = useRef(false);

  // Listen for cross-tab changes using the native 'storage' event.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue) as EmergencyAlert[];
          setAlerts(parsed);
        } catch {
          // ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Also poll as a backup every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (selfWriteRef.current) {
        selfWriteRef.current = false;
        return;
      }
      const fromStorage = readAlerts();
      setAlerts((prev) => {
        const prevJson = JSON.stringify(prev);
        const newJson = JSON.stringify(fromStorage);
        if (prevJson !== newJson) {
          return fromStorage;
        }
        return prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Helper to update state AND localStorage atomically
  const updateAlerts = useCallback((updater: (prev: EmergencyAlert[]) => EmergencyAlert[]) => {
    setAlerts((prev) => {
      const latest = readAlerts();
      const base = latest.length >= prev.length ? latest : prev;
      const updated = updater(base);
      selfWriteRef.current = true;
      writeAlerts(updated);
      return updated;
    });
  }, []);

  const addAlert = useCallback((alert: EmergencyAlert) => {
    updateAlerts((prev) => {
      if (prev.some((a) => a.id === alert.id)) return prev;
      return [alert, ...prev];
    });
  }, [updateAlerts]);

  // Hospital ACCEPTS the alert — store hospital info so the user can see who accepted
  const acknowledgeAlert = useCallback((id: string, hospitalName: string, hospitalId: number) => {
    updateAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "acknowledged" as const,
              acceptedByHospital: hospitalName,
              acceptedByHospitalId: hospitalId,
            }
          : a
      )
    );
  }, [updateAlerts]);

  // Hospital DECLINES the alert — cascade to next nearest hospital
  const declineAlert = useCallback((id: string, hospitalId: number) => {
    updateAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;

        const newDeclinedList = [...(a.declinedByHospitals || []), hospitalId];
        const nextHospitalId = findNextHospital(a.latitude, a.longitude, newDeclinedList);

        if (nextHospitalId) {
          // Forward to next hospital — keep status "active"
          return {
            ...a,
            nearestHospitalId: nextHospitalId,
            declinedByHospitals: newDeclinedList,
            status: "active" as const,
          };
        } else {
          // All hospitals declined — mark as declined
          return {
            ...a,
            declinedByHospitals: newDeclinedList,
            status: "declined" as const,
          };
        }
      })
    );
  }, [updateAlerts]);

  // Hospital dispatches ambulance
  const dispatchAlert = useCallback((id: string) => {
    updateAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "dispatched" as const } : a
      )
    );
  }, [updateAlerts]);

  const clearAlert = useCallback((id: string) => {
    updateAlerts((prev) => prev.filter((a) => a.id !== id));
  }, [updateAlerts]);

  const getActiveAlerts = useCallback(
    (hospitalId?: number) => {
      if (hospitalId) {
        return alerts.filter((a) => a.nearestHospitalId === hospitalId);
      }
      return alerts;
    },
    [alerts]
  );

  return (
    <EmergencyContext.Provider
      value={{ alerts, addAlert, acknowledgeAlert, declineAlert, dispatchAlert, clearAlert, getActiveAlerts }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
};
