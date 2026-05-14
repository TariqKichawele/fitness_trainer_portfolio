export type SessionCategory = "Strength" | "Conditioning" | "Mobility";

export type SessionLocation = "Studio" | "Outdoor";

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type Session = {
  id: string;
  name: string;
  day: Weekday;
  category: SessionCategory;
  durationMin: number;
  /** Total capacity for the class */
  spots: number;
  /** Booked seats (fake demo data) */
  spotsTaken: number;
  location: SessionLocation;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  subtitle: string;
};

export type AboutContent = {
  headline: string;
  bio: string[];
  credentials: string[];
  images: { src: string; alt: string }[];
};

export type FooterContent = {
  tagline: string;
  email: string;
  socialLabel: string;
};
