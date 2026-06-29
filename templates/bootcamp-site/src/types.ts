export interface Bootcamp {
  id: string;
  title: string;
  tagline: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: number;
  originalPrice?: number;
  features: string[];
  outcomes: string[];
  icon: string;
  color: string;
  spotsLeft: number;
  startDate: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  bootcampCompleted: string;
  rating: number;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}
