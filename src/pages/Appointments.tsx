import { useState } from "react";
import Navbar from "@/components/Navbar";
import { doctors, hospitals } from "@/data/mockData";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Appointments = () => {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctor");
  const selectedDoc = doctorId
    ? doctors.find((d) => d.doc_id === Number(doctorId))
    : null;

  const [selectedDoctor, setSelectedDoctor] = useState(
    selectedDoc?.doc_id ?? 0,
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [booked, setBooked] = useState(false);

  const doctor = doctors.find((d) => d.doc_id === selectedDoctor);
  const hospitalName = doctor
    ? hospitals.find((h) => h.hos_id === doctor.hospital_ids[0])?.name
    : "";

  const handleBook = () => {
    if (
      !selectedDoctor ||
      !selectedSlot ||
      !selectedDate ||
      !patientName.trim() ||
      !patientPhone.trim()
    ) {
      toast({
        title: "Missing Info",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    setBooked(true);
    toast({
      title: "Appointment Booked! ✅",
      description: `With ${doctor?.name} on ${selectedDate} at ${selectedSlot}`,
    });
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-16 flex items-center justify-center">
          <div className="glass-card p-10 text-center max-w-md animate-scale-in">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display text-foreground">
              Appointment Confirmed!
            </h2>
            <p className="text-muted-foreground mt-2">
              Your appointment with <strong>{doctor?.name}</strong> at{" "}
              <strong>{hospitalName}</strong> is confirmed for{" "}
              <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>
              .
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              A confirmation will be sent to your phone number.
            </p>
            <Button
              onClick={() => setBooked(false)}
              className="mt-6 hero-gradient text-primary-foreground border-0"
            >
              Book Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">
            Book <span className="text-gradient">Appointment</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Schedule a visit with your preferred doctor
          </p>

          <div className="space-y-6">
            {/* Doctor Selection */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-primary" /> Select Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(Number(e.target.value));
                  setSelectedSlot("");
                }}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value={0}>Choose a doctor...</option>
                {doctors.map((d) => (
                  <option key={d.doc_id} value={d.doc_id}>
                    {d.name} — {d.specialty} (⭐ {d.rating})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" /> Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            {/* Time Slots */}
            {doctor && (
              <div className="glass-card p-5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" /> Available Slots
                </label>
                <div className="flex flex-wrap gap-2">
                  {doctor.available_slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSlot === slot
                          ? "hero-gradient text-primary-foreground shadow-glow"
                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Info */}
            <div className="glass-card p-5 space-y-4">
              <label className="text-sm font-medium text-foreground">
                Patient Details
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            {/* Summary */}
            {doctor && selectedSlot && selectedDate && (
              <div className="glass-card p-5 border-l-4 border-l-primary">
                <p className="text-sm font-medium text-foreground">
                  Appointment Summary
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {doctor.name} • {doctor.specialty} • {hospitalName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedDate} at {selectedSlot}
                </p>
              </div>
            )}

            <Button
              onClick={handleBook}
              size="lg"
              className="w-full hero-gradient text-primary-foreground border-0 h-12 text-base font-semibold"
            >
              Confirm Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
