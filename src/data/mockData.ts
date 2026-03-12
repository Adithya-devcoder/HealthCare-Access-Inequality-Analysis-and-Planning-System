export interface Hospital {
  hos_id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  emergency_beds: number;
  total_beds: number;
  rating: number;
  departments: string[];
  price_range: string;
  is_emergency: boolean;
}

export interface Doctor {
  doc_id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  rating: number;
  hospital_ids: number[];
  available_slots: string[];
  image?: string;
}

export interface Specialty {
  spec_id: number;
  name: string;
  icon: string;
}

export const specialties: Specialty[] = [
  { spec_id: 1, name: "Cardiology", icon: "❤️" },
  { spec_id: 2, name: "Neurology", icon: "🧠" },
  { spec_id: 3, name: "Orthopedics", icon: "🦴" },
  { spec_id: 4, name: "Pediatrics", icon: "👶" },
  { spec_id: 5, name: "Dermatology", icon: "🩺" },
  { spec_id: 6, name: "Endocrinology", icon: "💉" },
  { spec_id: 7, name: "Ophthalmology", icon: "👁️" },
  { spec_id: 8, name: "General Medicine", icon: "🏥" },
];

export const hospitals: Hospital[] = [
  {
    hos_id: 1,
    name: "Healthify Medical Center",
    address: "Healthify Park, Kattankulathur, Tamil Nadu",
    phone: "+91 44 2745 5000",
    latitude: 12.8231,
    longitude: 80.0442,
    emergency_beds: 12,
    total_beds: 200,
    rating: 4.5,
    departments: [
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "Pediatrics",
      "General Medicine",
    ],
    price_range: "₹500 - ₹2000",
    is_emergency: true,
  },
  {
    hos_id: 2,
    name: "Chengalpattu Government Hospital",
    address: "Chengalpattu, Tamil Nadu",
    phone: "+91 44 2742 2000",
    latitude: 12.6819,
    longitude: 79.9888,
    emergency_beds: 8,
    total_beds: 150,
    rating: 4.0,
    departments: ["General Medicine", "Orthopedics", "Pediatrics"],
    price_range: "₹100 - ₹800",
    is_emergency: true,
  },
  {
    hos_id: 3,
    name: "Apollo Hospitals Chennai",
    address: "Greams Lane, Chennai, Tamil Nadu",
    phone: "+91 44 2829 3333",
    latitude: 13.0604,
    longitude: 80.2496,
    emergency_beds: 25,
    total_beds: 500,
    rating: 4.8,
    departments: [
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "Dermatology",
      "Endocrinology",
      "Ophthalmology",
    ],
    price_range: "₹1500 - ₹5000",
    is_emergency: true,
  },
  {
    hos_id: 4,
    name: "MIOT International",
    address: "Manapakkam, Chennai, Tamil Nadu",
    phone: "+91 44 4200 0000",
    latitude: 13.013,
    longitude: 80.1694,
    emergency_beds: 18,
    total_beds: 350,
    rating: 4.6,
    departments: ["Cardiology", "Orthopedics", "Neurology", "General Medicine"],
    price_range: "₹1000 - ₹4000",
    is_emergency: true,
  },
  {
    hos_id: 5,
    name: "Sundaram Medical Foundation",
    address: "T. Nagar, Chennai, Tamil Nadu",
    phone: "+91 44 2834 5050",
    latitude: 13.0382,
    longitude: 80.2298,
    emergency_beds: 5,
    total_beds: 120,
    rating: 4.2,
    departments: ["General Medicine", "Pediatrics", "Dermatology"],
    price_range: "₹400 - ₹1500",
    is_emergency: false,
  },
];

export const doctors: Doctor[] = [
  {
    doc_id: 1,
    name: "Dr. Anitha Rajan",
    email: "anitha@healthify.com",
    phone: "+91 98765 43210",
    specialty: "Cardiology",
    rating: 4.8,
    hospital_ids: [1],
    available_slots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
  },
  {
    doc_id: 2,
    name: "Dr. Karthik Venkatesh",
    email: "karthik@apollo.com",
    phone: "+91 98765 43211",
    specialty: "Neurology",
    rating: 4.9,
    hospital_ids: [3],
    available_slots: ["10:00", "11:00", "14:00", "16:00"],
  },
  {
    doc_id: 3,
    name: "Dr. Priya Sharma",
    email: "priya@miot.com",
    phone: "+91 98765 43212",
    specialty: "Orthopedics",
    rating: 4.7,
    hospital_ids: [4],
    available_slots: ["09:00", "10:30", "13:00", "15:30"],
  },
  {
    doc_id: 4,
    name: "Dr. Suresh Kumar",
    email: "suresh@healthify.com",
    phone: "+91 98765 43213",
    specialty: "Pediatrics",
    rating: 4.6,
    hospital_ids: [1, 2],
    available_slots: ["08:00", "09:30", "11:00", "14:00"],
  },
  {
    doc_id: 5,
    name: "Dr. Lakshmi Narayanan",
    email: "lakshmi@sundaram.com",
    phone: "+91 98765 43214",
    specialty: "Dermatology",
    rating: 4.5,
    hospital_ids: [5],
    available_slots: ["10:00", "11:30", "14:00", "16:00"],
  },
  {
    doc_id: 6,
    name: "Dr. Rajesh Iyer",
    email: "rajesh@apollo.com",
    phone: "+91 98765 43215",
    specialty: "Endocrinology",
    rating: 4.7,
    hospital_ids: [3],
    available_slots: ["09:00", "11:00", "14:30", "16:00"],
  },
];

export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};
