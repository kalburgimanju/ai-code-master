import type { Bootcamp, Testimonial, PricingTier } from './types';

export const bootcamps: Bootcamp[] = [
  {
    id: 'ai-web-dev',
    title: 'AI Web Development',
    tagline: 'Build full-stack apps with AI as your co-pilot',
    description:
      'Master modern web development with AI tools integrated into every step. Learn React, Node.js, and deployment while leveraging AI for code generation, debugging, and architecture decisions.',
    duration: '12 weeks',
    level: 'Intermediate',
    price: 49999,
    originalPrice: 79999,
    features: [
      'Live instructor-led sessions 3x/week',
      'AI pair-programming workshops',
      'Real-world project portfolio (5 apps)',
      '1-on-1 mentorship sessions',
      'Lifetime access to course materials',
      'Job placement assistance',
    ],
    outcomes: [
      'Build and deploy 5 production apps',
      'Master AI-assisted development workflow',
      'Land a developer role or freelance clients',
      'Join our alumni network of 2,000+ devs',
    ],
    icon: 'code',
    color: 'from-blue-500 to-cyan-500',
    spotsLeft: 12,
    startDate: '2026-07-15',
  },
  {
    id: 'ai-data-science',
    title: 'AI & Data Science',
    tagline: 'From raw data to deployed ML models',
    description:
      'Learn data analysis, machine learning, and model deployment with hands-on projects using real-world datasets. AI agents help you iterate faster and learn deeper.',
    duration: '16 weeks',
    level: 'Intermediate',
    price: 59999,
    originalPrice: 89999,
    features: [
      'Hands-on ML pipeline projects',
      'Python, Pandas, Scikit-learn, TensorFlow',
      'AI-assisted data exploration',
      'Capstone project with industry partner',
      'Cloud deployment (AWS/GCP)',
      'Interview prep & resume review',
    ],
    outcomes: [
      'Build end-to-end ML pipelines',
      'Deploy models to production',
      'Earn a verified certificate',
      'Get placed in data roles',
    ],
    icon: 'brain',
    color: 'from-purple-500 to-pink-500',
    spotsLeft: 8,
    startDate: '2026-07-22',
  },
  {
    id: 'ai-product-design',
    title: 'AI Product Design',
    tagline: 'Design intelligent products that users love',
    description:
      'Learn UX/UI design, prototyping, and AI-powered design tools. Create designs for real products using Figma, AI generators, and user research methodologies.',
    duration: '10 weeks',
    level: 'Beginner',
    price: 39999,
    originalPrice: 59999,
    features: [
      'Figma mastery + AI design tools',
      'User research & testing methodology',
      '5 portfolio-ready design projects',
      'Design system creation',
      'AI prototyping workshops',
      'Portfolio review & feedback',
    ],
    outcomes: [
      'Build a stunning design portfolio',
      'Master AI-assisted design workflow',
      'Land your first design role',
      'Understand product thinking end-to-end',
    ],
    icon: 'palette',
    color: 'from-orange-500 to-red-500',
    spotsLeft: 15,
    startDate: '2026-08-01',
  },
  {
    id: 'ai-devops',
    title: 'AI DevOps & Cloud',
    tagline: 'Automate infrastructure with intelligent agents',
    description:
      'Master CI/CD, cloud infrastructure, and container orchestration with AI-powered automation. Learn to build and maintain production systems at scale.',
    duration: '14 weeks',
    level: 'Advanced',
    price: 69999,
    originalPrice: 99999,
    features: [
      'Docker, Kubernetes, Terraform',
      'AWS, GCP, Azure multi-cloud',
      'AI-driven monitoring & alerting',
      'Security best practices',
      'Cost optimization strategies',
      'Real-world incident simulations',
    ],
    outcomes: [
      'Manage production cloud infrastructure',
      'Implement CI/CD pipelines end-to-end',
      'Earn cloud certifications',
      'Handle incidents like a senior SRE',
    ],
    icon: 'cloud',
    color: 'from-green-500 to-teal-500',
    spotsLeft: 6,
    startDate: '2026-08-10',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Frontend Developer',
    company: 'Razorpay',
    avatar: '',
    quote:
      'The AI Web Dev bootcamp completely changed how I code. I went from writing boilerplate to shipping features 3x faster. The mentorship was incredible.',
    bootcampCompleted: 'AI Web Development',
    rating: 5,
  },
  {
    id: '2',
    name: 'Arjun Patel',
    role: 'ML Engineer',
    company: 'Freshworks',
    avatar: '',
    quote:
      'I had some Python knowledge but zero ML experience. After 16 weeks, I deployed my first production model. The AI-assisted learning made complex topics click.',
    bootcampCompleted: 'AI & Data Science',
    rating: 5,
  },
  {
    id: '3',
    name: 'Kavya Reddy',
    role: 'Product Designer',
    company: 'Zerodha',
    avatar: '',
    quote:
      'As a career switcher from marketing, I was nervous. The design bootcamp gave me a portfolio that got me interviews within 2 weeks of graduating.',
    bootcampCompleted: 'AI Product Design',
    rating: 5,
  },
  {
    id: '4',
    name: 'Rohit Kumar',
    role: 'DevOps Engineer',
    company: 'Flipkart',
    avatar: '',
    quote:
      'The DevOps bootcamp is hands-on from day one. By week 4 I was managing real Kubernetes clusters. The AI tools for infrastructure are a game changer.',
    bootcampCompleted: 'AI DevOps & Cloud',
    rating: 5,
  },
];

export const pricingTiers: PricingTier[] = [
  {
    id: 'self-paced',
    name: 'Self-Paced',
    price: 19999,
    period: 'one-time',
    description: 'Learn at your own speed with full course access.',
    features: [
      'Full course content & videos',
      'Community Slack access',
      'Monthly group Q&A sessions',
      'Course completion certificate',
    ],
    cta: 'Start Learning',
  },
  {
    id: 'guided',
    name: 'Guided',
    price: 49999,
    period: 'one-time',
    description: 'Instructor-led with 1-on-1 mentorship and career support.',
    features: [
      'Everything in Self-Paced',
      'Live instructor-led sessions',
      'Weekly 1-on-1 mentorship',
      'Portfolio & resume review',
      'Job placement assistance',
      'Lifetime alumni network access',
    ],
    highlighted: true,
    cta: 'Enroll Now',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29999,
    period: 'per seat',
    description: 'Custom training for teams. Volume discounts available.',
    features: [
      'Everything in Guided',
      'Custom curriculum for your team',
      'Dedicated success manager',
      'Progress tracking dashboard',
      'SLA & priority support',
      'Invoice & PO billing',
    ],
    cta: 'Contact Sales',
  },
];

export const stats = [
  { label: 'Students Placed', value: '2,400+' },
  { label: 'Average Salary Hike', value: '85%' },
  { label: 'Course Rating', value: '4.9/5' },
  { label: 'Hiring Partners', value: '120+' },
];

export const navLinks = [
  { label: 'Bootcamps', href: '#bootcamps' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];
