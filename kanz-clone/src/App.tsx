import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { HiringPage } from './pages/HiringPage'
import { JobSeekerPage } from './pages/JobSeekerPage'

// Navigation Component
function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hide navbar on hiring and job seeker pages
  if (location.pathname === '/hiring' || location.pathname === '/job-seeker') {
    return null
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-green-600">Kanz</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#proof" className="text-gray-700 hover:text-green-600 font-medium">Proof</a>
            <a href="#showroom" className="text-gray-700 hover:text-green-600 font-medium">AI Showroom</a>
            <a href="#infrastructure" className="text-gray-700 hover:text-green-600 font-medium">Infrastructure</a>
            <a href="#hackathon" className="text-gray-700 hover:text-green-600 font-medium">Hackathon</a>
            <button className="text-gray-700 hover:text-green-600 font-medium">عربي</button>
            <Link to="/hiring" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Start Hiring
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#proof" className="block px-3 py-2 text-gray-700 hover:text-green-600 font-medium">Proof</a>
              <a href="#showroom" className="block px-3 py-2 text-gray-700 hover:text-green-600 font-medium">AI Showroom</a>
              <a href="#infrastructure" className="block px-3 py-2 text-gray-700 hover:text-green-600 font-medium">Infrastructure</a>
              <a href="#hackathon" className="block px-3 py-2 text-gray-700 hover:text-green-600 font-medium">Hackathon</a>
              <button className="block px-3 py-2 text-gray-700 hover:text-green-600 font-medium">عربي</button>
              <Link to="/hiring" className="block px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center">
                Start Hiring
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Hero Section
function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          From job post to final interviews in <span className="text-green-600">5 days</span>. Not 34.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          10 AI agents replace your entire hiring workflow — post, source, assess, interview, rank, and schedule.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link to="/hiring" className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl">
            Start Hiring Free →
          </Link>
          <a href="#how-it-works" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-green-600 hover:text-green-600 transition-all font-semibold text-lg">
            See How It Works ↓
          </a>
        </div>
        <p className="text-gray-500 text-sm">
          Your first 3 candidate interviews are on us. No commitment.
        </p>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Tell us who you need',
      description: 'Describe your ideal candidate and availability. Our AI understands your requirements.'
    },
    {
      number: '02',
      title: 'AI does the rest',
      description: '10 AI agents work simultaneously: post, source, assess, interview, rank, and schedule.'
    },
    {
      number: '03',
      title: 'You meet the best',
      description: 'Top 3 pre-screened candidates on your calendar. 50% hire from first 3 interviews.'
    }
  ]

  const pipeline = [
    'Writes JD',
    'Posts 20+ Channels',
    'Sources 1M+',
    'Assesses Skills',
    'AI Interviews',
    'Scores & Ranks',
    'Scheduled'
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          How It Works
        </h2>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-green-600 text-5xl font-bold mb-4">{step.number}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max gap-4">
            {pipeline.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-white px-6 py-3 rounded-lg shadow-sm font-medium text-gray-800 whitespace-nowrap">
                  {step}
                </div>
                {index < pipeline.length - 1 && (
                  <svg className="w-8 h-8 text-green-600 mx-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-6 font-medium">
            Every step powered by AI agents — zero manual work
          </p>
        </div>
      </div>
    </section>
  )
}

// Before vs After Section
function BeforeVsAfter() {
  const comparisons = [
    { metric: 'Time to hire', before: '34 days', after: '5 days' },
    { metric: 'Candidates', before: '1,000 unqualified CVs', after: '3 pre-screened on calendar' },
    { metric: 'Cost', before: 'SAR 12K+ per hire', after: 'First interviews free' },
    { metric: 'Screening', before: 'Weeks of manual work', after: '10 AI agents do it all' }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Before Kanz vs After Kanz
        </h2>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-900 text-white">
            <div className="p-6 font-semibold">Metric</div>
            <div className="p-6 font-semibold text-center">Before</div>
            <div className="p-6 font-semibold text-center">After Kanz</div>
          </div>

          {/* Rows */}
          {comparisons.map((item, index) => (
            <div key={index} className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="p-6 font-medium text-gray-900 border-r border-gray-200">{item.metric}</div>
              <div className="p-6 text-center text-red-600 border-r border-gray-200">{item.before}</div>
              <div className="p-6 text-center text-green-600 font-semibold">{item.after}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Proof / Stats Section
function ProofSection() {
  const stats = [
    { number: '4K+', label: 'People hired' },
    { number: '$200M', label: 'Wages generated' },
    { number: '94%', label: '90-day retention' },
    { number: '9.35/10', label: 'Avg employer satisfaction' },
    { number: '100%', label: 'Would hire again' },
    { number: '2.3yr', label: 'Avg hire tenure' }
  ]

  const employers = [
    { name: 'TELUS Digital', hires: 260, score: '10/10', signal: 'Immensely valuable...incredibly efficient' },
    { name: 'Sucafina', hires: 16, score: '10/10', signal: 'Peace of mind — 15/16 retained after 2 years' },
    { name: 'Booking.com', hires: 56, score: '10/10', signal: '197 employees trained, spend growth' },
    { name: 'WeLocalize', hires: 20, score: '10/10', signal: '20 hires from 1,765 applicants in 90 days' },
    { name: 'Redington (KSA)', hires: 3, score: '10/10', signal: 'Excellent service — Vision 2030 aligned' },
    { name: 'Alefb', hires: 13, score: '8/10', signal: 'Our only hiring platform — abandoned all others' }
  ]

  return (
    <section id="proof" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Proof</h2>
          <p className="text-gray-600 text-lg">Global numbers across 200+ employers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 mb-12">Still counting</p>

        {/* Employer Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4 text-left">Employer</th>
                  <th className="p-4 text-center">Hires</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-left">Key Signal</th>
                </tr>
              </thead>
              <tbody>
                {employers.map((employer, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-medium text-gray-900">{employer.name}</td>
                    <td className="p-4 text-center font-semibold text-green-600">{employer.hires}</td>
                    <td className="p-4 text-center font-semibold text-green-600">{employer.score}</td>
                    <td className="p-4 text-gray-600">{employer.signal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-600">
            372+ verified hires across named employers · Avg: 9.35/10 · 100% would hire again
          </div>
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
function Testimonials() {
  const testimonials = [
    {
      quote: "Peace of mind. Kanz transformed our hiring process completely.",
      name: "Sucafina Team",
      title: "15/16 hires retained after 2 years",
      metric: "16 hires"
    },
    {
      quote: "Immensely valuable...incredibly efficient solution for our talent needs.",
      name: "TELUS Digital",
      title: "260 hires with 10/10 satisfaction",
      metric: "260 hires"
    },
    {
      quote: "Our only hiring platform. We abandoned all others after trying Kanz.",
      name: "Alefb",
      title: "13 hires, 8/10 satisfaction",
      metric: "13 hires"
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          What Employers Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-4xl text-green-600 mb-4">"</div>
              <p className="text-gray-700 text-lg mb-6 italic">{testimonial.quote}</p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-gray-600 text-sm">{testimonial.title}</div>
                <div className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {testimonial.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Trusted By Section
function TrustedBy() {
  const logos = [
    'Cartier', 'Chanel', 'Booking.com', 'Novartis', 'Vodafone',
    'Tamkeen', 'Al Futtaim', 'Infosys', 'Coca-Cola', 'DP World',
    'Mobily', 'AECOM', 'Tuwaiq Academy', 'Takamol'
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-center text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">
          Trusted by industry leaders
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-8 items-center justify-items-center opacity-60">
          {logos.map((logo, index) => (
            <div key={index} className="text-gray-400 font-semibold text-lg">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Problem/Solution Section
function ProblemSolution() {
  const rows = [
    {
      problem: "Candidate Supply",
      typical: "Couldn't fill it",
      kanz: "1.1M candidates (225K Saudi), zero acquisition cost"
    },
    {
      problem: "Engagement",
      typical: "Didn't show up",
      kanz: "60% email open rates (vs. industry 15-20%)"
    },
    {
      problem: "Candidate Trust",
      typical: "No investment",
      kanz: "Free AI courses (30K registered), feedback on every rejection"
    },
    {
      problem: "Employer Retention",
      typical: "One-off transactions",
      kanz: "9.35/10 satisfaction, 100% rehire rate"
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Why HR Tech Fails in MENA — And Why Kanz Doesn't
        </h2>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-3 bg-gray-900 text-white">
            <div className="p-6 font-semibold">The Problem</div>
            <div className="p-6 font-semibold text-center">Typical HR Tech</div>
            <div className="p-6 font-semibold text-center">Kanz</div>
          </div>

          {rows.map((row, index) => (
            <div key={index} className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="p-6 font-medium text-gray-900 border-r border-gray-200">{row.problem}</div>
              <div className="p-6 text-center text-red-600 border-r border-gray-200">{row.typical}</div>
              <div className="p-6 text-center text-green-600 font-medium">{row.kanz}</div>
            </div>
          ))}
        </div>

        {/* Accessibility Callout */}
        <div className="mt-8 bg-green-50 rounded-2xl p-8 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="text-3xl">♿</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Accessibility First</h3>
              <p className="text-gray-600">
                Kanz is the only hiring app in KSA for people with disabilities. WCAG & ADA compliant with screen readers, cognitive support, voice/keyboard navigation, and bilingual Arabic & English support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// AI Training Section
function AITraining() {
  const weeks = [
    {
      week: 1,
      title: 'Build Your First App',
      description: 'Build a working AI app in 3 hours, no coding required.'
    },
    {
      week: 2,
      title: 'Apply to Your Function',
      description: 'Customize AI tools for your specific department needs.'
    },
    {
      week: 3,
      title: 'Career-Ready Portfolio',
      description: 'Capstone project as proof for employers.'
    },
    {
      week: 4,
      title: 'Showcase & Certification',
      description: 'Present to employers; Google + Helsinki certification.'
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Boost your team's productivity with AI
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            4-week no-code AI course for HR talent. 30K+ sign ups, 3K+ graduates. 70% HRDF subsidized.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {weeks.map((week, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="text-green-600 font-bold text-sm mb-2">Week {week.week}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{week.title}</h3>
              <p className="text-gray-600">{week.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">30K+</div>
            <div className="text-gray-600">Sign Ups</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">3K+</div>
            <div className="text-gray-600">Graduates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">70%</div>
            <div className="text-gray-600">HRDF Subsidy</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// AI Showroom Section
function AIShowroom() {
  const projects = [
    {
      category: 'Content & Marketing',
      title: 'Social Media Content Distribution',
      creator: 'Rehab Almuteab'
    },
    {
      category: 'FinTech',
      title: 'Islamic Finance Trading Platform',
      creator: 'Ayesha Alkhajeh'
    },
    {
      category: 'Healthcare',
      title: 'SANAD AI — Healthcare Triage',
      creator: 'Syeda Hajera Afsheen'
    }
  ]

  return (
    <section id="showroom" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Agentic AI Showroom
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-white text-6xl">🚀</span>
              </div>
              <div className="p-6">
                <div className="text-green-600 text-sm font-medium mb-2">{project.category}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600">{project.creator}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <a href="#" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Submit your own project
          </a>
          <a href="#" className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-green-600 hover:text-green-600 transition-colors font-medium">
            See More Projects →
          </a>
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function Pricing() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Try your first hire free. Then 1,500 SAR per job slot.
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            One slot = 300+ candidates sourced, screened, and 3 interview-ready candidates delivered in 5 days.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">First Hire Free</h3>
            <div className="text-4xl font-bold text-green-600 mb-6">Free</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> 3 interview-ready candidates
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> Full AI pipeline included
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> No credit card required
              </li>
            </ul>
            <Link to="/hiring" className="block text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Start Free →
            </Link>
          </div>

          {/* Pay-as-You-Go */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pay-as-You-Go</h3>
            <div className="text-4xl font-bold text-green-600 mb-6">1,500 SAR</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> 3 interview-ready candidates from 300+ sourced
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> 5-day turnaround guarantee
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> Free quality guarantee iteration
              </li>
            </ul>
            <Link to="/hiring" className="block text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Get Started
            </Link>
          </div>

          {/* Subscriptions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Subscriptions</h3>
            <div className="text-sm text-green-600 font-medium mb-6">Save up to 50%</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> Priority support
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> Analytics dashboard
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> Team collaboration
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="text-green-500">✓</span> Cancel anytime
              </li>
            </ul>
            <Link to="/hiring" className="block text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              View Plans
            </Link>
          </div>
        </div>

        {/* Subscription Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4 text-left">Plan</th>
                  <th className="p-4 text-center">Slots/Mo</th>
                  <th className="p-4 text-center">Monthly Price</th>
                  <th className="p-4 text-center">Cost/Slot</th>
                  <th className="p-4 text-center">Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium">Starter</td>
                  <td className="p-4 text-center">3</td>
                  <td className="p-4 text-center">3,750 SAR</td>
                  <td className="p-4 text-center">1,250 SAR</td>
                  <td className="p-4 text-center text-green-600">17%</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="p-4 font-medium">
                    Growth
                    <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">Popular</span>
                  </td>
                  <td className="p-4 text-center">5</td>
                  <td className="p-4 text-center">5,625 SAR</td>
                  <td className="p-4 text-center">1,125 SAR</td>
                  <td className="p-4 text-center text-green-600">25%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium">Scale</td>
                  <td className="p-4 text-center">10</td>
                  <td className="p-4 text-center">10,000 SAR</td>
                  <td className="p-4 text-center">1,000 SAR</td>
                  <td className="p-4 text-center text-green-600">33%</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-4 font-medium">Enterprise</td>
                  <td className="p-4 text-center">20</td>
                  <td className="p-4 text-center">18,000 SAR</td>
                  <td className="p-4 text-center">900 SAR</td>
                  <td className="p-4 text-center text-green-600">40%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium">Unlimited</td>
                  <td className="p-4 text-center">50</td>
                  <td className="p-4 text-center">37,500 SAR</td>
                  <td className="p-4 text-center">750 SAR</td>
                  <td className="p-4 text-center text-green-600">50%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Guarantee */}
        <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
          <div className="text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Double Guarantee</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h4>
                <p className="text-gray-600">3 more candidates at no cost if first 3 don't meet requirements.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Speed Guarantee</h4>
                <p className="text-gray-600">Top 3 in under 5 days or next slot free.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Infrastructure Section
function Infrastructure() {
  return (
    <section id="infrastructure" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recruitment Infrastructure</h2>
          <h3 className="text-xl text-gray-300 mb-6">Job Board as a Service</h3>
          <p className="text-gray-300 mb-8 max-w-2xl">
            For Ministries, Gov't & Large Platforms — launch own AI hiring platform in 4 weeks, white-label or API. Starting at $120K/year.
          </p>
          <a href="#" className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold">
            Learn More →
          </a>
        </div>
      </div>
    </section>
  )
}

// AI Training Pricing
function AITrainingPricing() {
  const pricing = [
    { employees: '0-49', price: '4,000' },
    { employees: '50-99', price: '3,600' },
    { employees: '100-199', price: '3,200' },
    { employees: '200+', price: '2,800' }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          AI Training Pricing
        </h2>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-6 text-left">Employees Trained</th>
                  <th className="p-6 text-right">Price per Employee (SAR)</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-6 font-medium text-gray-900">{item.employees}</td>
                    <td className="p-6 text-right font-semibold text-green-600">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-gray-600">
            Min class size: 20 · Course duration: 4 weeks · 70% HRDF subsidized
          </div>
        </div>
      </div>
    </section>
  )
}

// Contact Section
function Contact() {
  const contacts = [
    {
      name: 'Sara Arshad',
      role: 'Talent Manager',
      phone: '056 084 7289',
      email: 'sara@ka.nz'
    },
    {
      name: 'Roy Baladi',
      role: 'General Manager',
      phone: '053 434 0692',
      email: 'roy@ka.nz'
    },
    {
      name: 'Rehab Almuteab',
      role: 'Growth Manager',
      phone: '055 615 4928',
      email: 'rehab@ka.nz'
    }
  ]

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to hire smarter?
          </h2>
          <p className="text-gray-600 text-lg">
            Your first 3 candidate interviews are on us. No commitment, no risk.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contacts.map((contact, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{contact.name}</h3>
              <p className="text-green-600 font-medium mb-4">{contact.role}</p>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center justify-center gap-2">
                  <span>📱</span> {contact.phone}
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span>✉️</span> {contact.email}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/hiring" className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl inline-block">
            Start Hiring Now →
          </Link>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-green-400 transition-colors">Home</Link></li>
              <li><a href="#proof" className="hover:text-green-400 transition-colors">Proof of Impact</a></li>
              <li><a href="#showroom" className="hover:text-green-400 transition-colors">AI Showroom</a></li>
              <li><a href="#infrastructure" className="hover:text-green-400 transition-colors">Infrastructure</a></li>
            </ul>
          </div>

          {/* Success Stories */}
          <div>
            <h4 className="font-semibold mb-4">Success Stories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">TELUS</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Sucafina</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Booking.com</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Alefb</a></li>
            </ul>
          </div>

          {/* Certificates */}
          <div>
            <h4 className="font-semibold mb-4">Certificates</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Workshop Certificate</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Portfolio Certificate</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Verify Certificate</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#hackathon" className="hover:text-green-400 transition-colors">Hackathon</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Visit</a></li>
              <li><Link to="/hiring" className="hover:text-green-400 transition-colors">Kanz App</Link></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Assessment Framework</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Bug Tracker</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Riyadh, Saudi Arabia</li>
              <li>CR: 7041598322</li>
              <li><a href="mailto:hello@ka.nz" className="hover:text-green-400 transition-colors">hello@ka.nz</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-bold text-green-500">Kanz</Link>
            <span className="text-gray-400">The AI Recruiter · Powering Vision 2030</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 Kanz. All rights reserved. AI-powered talent solutions for the modern workforce.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main App Component with Routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            <HowItWorks />
            <BeforeVsAfter />
            <ProofSection />
            <Testimonials />
            <TrustedBy />
            <ProblemSolution />
            <AITraining />
            <AIShowroom />
            <Pricing />
            <Infrastructure />
            <AITrainingPricing />
            <Contact />
            <Footer />
          </div>
        } />
        <Route path="/hiring" element={<HiringPage />} />
        <Route path="/job-seeker" element={<JobSeekerPage />} />
      </Routes>
    </Router>
  )
}

export default App
