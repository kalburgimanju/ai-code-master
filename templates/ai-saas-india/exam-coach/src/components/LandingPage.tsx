import { useState } from 'react';
import {
  BookOpen,
  Brain,
  BarChart3,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Globe,
  Zap,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToDemo: () => void;
}

const features = [
  {
    icon: Clock,
    title: 'Daily Study Plans',
    description:
      'Personalized daily schedules tailored to your exam preparation level, available in your native language.',
  },
  {
    icon: BookOpen,
    title: 'Multilingual MCQ',
    description:
      'Practice thousands of MCQs in 12+ Indian languages with detailed explanations and performance tracking.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description:
      'Track your preparation with detailed analytics, weak area identification, and improvement suggestions.',
  },
  {
    icon: MessageCircle,
    title: 'Live Doubt Solving',
    description:
      'Get instant answers to your doubts from our AI tutor, explained in your preferred language.',
  },
  {
    icon: Brain,
    title: 'Smart Revision',
    description:
      'AI-powered spaced repetition system ensures you never forget what you have learned.',
  },
  {
    icon: Globe,
    title: '12+ Languages',
    description:
      'Full support for Hindi, Marathi, Tamil, Kannada, Bengali, Telugu, Gujarati, and more.',
  },
];

const steps = [
  {
    step: 1,
    title: 'Choose Your Language',
    description: 'Select from 12+ Indian languages for your learning experience.',
  },
  {
    step: 2,
    title: 'Pick Your Subject',
    description: 'Choose from Polity, History, Geography, Economy, or Science.',
  },
  {
    step: 3,
    title: 'Get Your Study Plan',
    description: 'AI generates a personalized daily schedule with MCQ practice.',
  },
  {
    step: 4,
    title: 'Track & Improve',
    description: 'Monitor your progress and get smarter recommendations over time.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect to get started with exam preparation',
    features: [
      'Daily study plan',
      '5 MCQs per day',
      'Basic progress tracking',
      '2 languages support',
      'Community forum access',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    description: 'For serious aspirants who want focused preparation',
    features: [
      'Unlimited study plans',
      '50 MCQs per day',
      'Detailed analytics',
      'All 12 languages',
      'Live doubt solving',
      'Mock tests',
      'Previous year papers',
    ],
    cta: 'Get Pro',
    popular: true,
  },
  {
    name: 'Premium',
    price: '₹999',
    period: '/month',
    description: 'Complete preparation with personal mentorship',
    features: [
      'Everything in Pro',
      'Unlimited MCQs',
      'Personal AI mentor',
      'Custom study plans',
      'Interview preparation',
      'Essay writing practice',
      'Priority support',
      'Offline access',
    ],
    cta: 'Go Premium',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    exam: 'UPSC CSE 2025',
    text: 'Studying in Hindi made concepts much clearer. The daily study plan kept me on track throughout my preparation.',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    exam: 'SSC CGL 2025',
    text: 'The multilingual MCQs are a game-changer. I can practice in Marathi and understand concepts better.',
    rating: 5,
  },
  {
    name: 'Ananya Patel',
    exam: 'UPSC Mains 2025',
    text: 'Live doubt solving in Gujarati helped me clear my Polity concepts. Highly recommended!',
    rating: 5,
  },
];

export default function LandingPage({ onNavigateToDemo }: LandingPageProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Which exams does this coach support?',
      answer:
        'We support UPSC CSE, UPSC Prelims & Mains, SSC CGL, SSC CHSL, SSC MTS, State PSC exams, and other competitive examinations.',
    },
    {
      question: 'How many languages are supported?',
      answer:
        'We support 12 Indian languages: Hindi, Marathi, Tamil, Kannada, Bengali, Telugu, Gujarati, Malayalam, Punjabi, Urdu, Odia, and Assamese.',
    },
    {
      question: 'Is the AI tutor available 24/7?',
      answer:
        'Yes! Our AI-powered tutor is available round the clock to help you with doubts, explanations, and study guidance in your preferred language.',
    },
    {
      question: 'Can I switch languages mid-preparation?',
      answer:
        'Absolutely! You can switch languages at any time. Your progress and study plans will adapt to the new language automatically.',
    },
    {
      question: 'Is there a free trial for Pro/Premium plans?',
      answer:
        'Yes, we offer a 7-day free trial for Pro and a 14-day free trial for Premium plans. No credit card required.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Vernacular<span className="text-primary-500">Coach</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-500 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-500 transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-500 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-gray-600 hover:text-primary-500 transition-colors">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToDemo}
                className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
              >
                Try Demo
              </button>
              <button className="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg4VjI4aDI4em0wLTRWMjBIMHY0aDI4em0wLTR2MkgxOHYtNGgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">AI-Powered Learning in Your Language</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Crack UPSC/SSC
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  In Your Language
                </span>
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-lg">
                Personalized study plans, multilingual MCQs, and AI-powered doubt solving in 12+ Indian
                languages. Start your journey to success today.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onNavigateToDemo}
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Try Free Demo
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-white/70 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  12+ Languages
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  AI-Powered
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Free to Start
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Today's Study Plan</div>
                    <div className="text-sm text-white/60">Indian Polity</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { time: '06:00', task: 'Revision - Fundamental Rights', color: 'bg-green-400' },
                    { time: '08:00', task: 'New Topic - Parliament', color: 'bg-blue-400' },
                    { time: '10:00', task: 'MCQ Practice (30 questions)', color: 'bg-purple-400' },
                    { time: '14:00', task: 'Current Affairs', color: 'bg-yellow-400' },
                    { time: '16:00', task: 'Mock Test', color: 'bg-red-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm font-mono text-white/60 w-12">{item.time}</span>
                      <span className="text-sm">{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive exam preparation tools in your native language.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in 4 simple steps and begin your exam preparation journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Aspirants
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful candidates who prepared with VernacularCoach.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.exam}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your preparation needs. All plans include a free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? 'ring-2 ring-primary-500 shadow-xl relative'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onNavigateToDemo}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about VernacularCoach.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Preparation?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of aspirants who are preparing for UPSC/SSC in their native language.
            Start your free trial today.
          </p>
          <button
            onClick={onNavigateToDemo}
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Try Free Demo
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">
                  Vernacular<span className="text-primary-400">Coach</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered exam preparation in 12+ Indian languages. Crack UPSC/SSC with personalized study plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Languages</li>
                <li>Mock Tests</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Blog</li>
                <li>Study Materials</li>
                <li>Previous Papers</li>
                <li>Current Affairs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 VernacularCoach. All rights reserved. Made with ❤️ for Indian aspirants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
