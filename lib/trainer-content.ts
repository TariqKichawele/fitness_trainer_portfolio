import type {
  AboutContent,
  FooterContent,
  Session,
  Testimonial,
} from "@/lib/types";

export const trainerName = "Alex Moreno";

export const siteTagline = "Strength, conditioning, and mobility—built around your goals.";

export const sessions: Session[] = [
  {
    id: "strength-foundation",
    name: "Strength Foundation",
    day: "Monday",
    category: "Strength",
    durationMin: 60,
    spots: 12,
    spotsTaken: 8,
    location: "Studio",
  },
  {
    id: "beach-conditioning",
    name: "Beach Conditioning",
    day: "Tuesday",
    category: "Conditioning",
    durationMin: 45,
    spots: 12,
    spotsTaken: 4,
    location: "Outdoor",
  },
  {
    id: "mobility-flow",
    name: "Mobility Flow",
    day: "Wednesday",
    category: "Mobility",
    durationMin: 45,
    spots: 10,
    spotsTaken: 9,
    location: "Studio",
  },
  {
    id: "power-circuit",
    name: "Power Circuit",
    day: "Thursday",
    category: "Conditioning",
    durationMin: 50,
    spots: 10,
    spotsTaken: 3,
    location: "Studio",
  },
  {
    id: "upper-body-focus",
    name: "Upper Body Focus",
    day: "Friday",
    category: "Strength",
    durationMin: 60,
    spots: 10,
    spotsTaken: 5,
    location: "Studio",
  },
  {
    id: "park-training",
    name: "Park Training",
    day: "Saturday",
    category: "Conditioning",
    durationMin: 60,
    spots: 12,
    spotsTaken: 11,
    location: "Outdoor",
  },
];

export const hero = {
  title: "Train with purpose.",
  subtitle: `Hi, I'm ${trainerName}. Small-group sessions that blend strength, conditioning, and mobility—so you move better, feel stronger, and stay consistent.`,
  primaryCta: "View weekly schedule",
  secondaryCta: "About Alex",
};

export const heroImage = {
  src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80",
  alt: "Athletes training with weights in a gym",
};

export const about: AboutContent = {
  headline: "Coach, not cheerleader.",
  bio: [
    `${trainerName} has spent the last decade helping busy professionals build sustainable strength without burning out. Sessions are structured, supportive, and focused on technique first.`,
    "Whether you are returning from an injury or leveling up performance, you will get clear progressions and accountability in a welcoming group setting.",
  ],
  credentials: [
    "NASM Certified Personal Trainer",
    "Precision Nutrition Level 1",
    "CPR/AED certified",
    "500+ coached small-group hours",
  ],
  images: [
    {
      src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
      alt: `${trainerName} coaching a client during a lift`,
    },
    {
      src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
      alt: "Outdoor conditioning session",
    },
    {
      src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      alt: "Mobility and stretching work",
    },
  ],
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "I finally have a plan I can stick to. Alex explains the why behind every block and scales movements without making it feel watered down.",
    name: "Jordan M.",
    subtitle: "Strength Foundation regular",
  },
  {
    id: "t2",
    quote:
      "Beach days are tough—in the best way. Energy is high, music is on point, and I have never felt more conditioned for weekend hikes.",
    name: "Sam R.",
    subtitle: "Beach Conditioning",
  },
  {
    id: "t3",
    quote:
      "My shoulders used to ache at my desk. Mobility Flow plus Alex's cues changed how I sit, stand, and lift.",
    name: "Priya K.",
    subtitle: "Mobility Flow",
  },
  {
    id: "t4",
    quote:
      "Small groups mean real feedback. I am lifting heavier than I thought possible, safely.",
    name: "Chris L.",
    subtitle: "Upper Body Focus",
  },
];

export const finalCta = {
  title: "Ready for your first session?",
  body: "Pick a class that fits your week. Spots are limited to keep coaching quality high.",
  buttonLabel: "Browse the schedule",
};

export const footer: FooterContent = {
  tagline: siteTagline,
  email: "hello@alexmoreno.training",
  socialLabel: "@alexmorenotraining",
};

export const weekdaysOrdered = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
