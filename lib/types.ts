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
