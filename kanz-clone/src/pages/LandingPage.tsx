import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-600">Kanz</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            The AI-Powered Job Matching Platform | Find Jobs & Talent in Saudi Arabia
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Choose how you'd like to get started — whether you're hiring talent or looking for your next opportunity.
          </p>
        </div>

        {/* Main Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Hiring Option */}
          <Link to="/hiring" className="group">
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <span className="text-4xl">👥</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Employers</h2>
              <h3 className="text-xl text-green-600 font-semibold mb-4">Start Hiring</h3>
              <p className="text-gray-600 mb-6">
                Post jobs, let AI source and screen candidates, and meet the best talent in 5 days.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-green-500 text-xl">✓</span>
                  Post to 20+ job boards automatically
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-green-500 text-xl">✓</span>
                  AI screens 1M+ candidates
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-green-500 text-xl">✓</span>
                  3 interview-ready candidates in 5 days
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-green-500 text-xl">✓</span>
                  First 3 interviews free
                </li>
              </ul>
              <div className="bg-green-600 text-white px-8 py-4 rounded-xl text-center font-semibold text-lg group-hover:bg-green-700 transition-colors">
                Start Hiring Free →
              </div>
            </div>
          </Link>

          {/* Job Seeker Option */}
          <Link to="/job-seeker" className="group">
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <span className="text-4xl">💼</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Job Seekers</h2>
              <h3 className="text-xl text-blue-600 font-semibold mb-4">Find Your Dream Job</h3>
              <p className="text-gray-600 mb-6">
                Create your profile, get AI-matched with relevant opportunities, and land your next role.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-blue-500 text-xl">✓</span>
                  AI-powered job matching
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-blue-500 text-xl">✓</span>
                  Skills assessment & certification
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-blue-500 text-xl">✓</span>
                  Free AI training courses
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <span className="text-blue-500 text-xl">✓</span>
                  Direct employer connections
                </li>
              </ul>
              <div className="bg-blue-600 text-white px-8 py-4 rounded-xl text-center font-semibold text-lg group-hover:bg-blue-700 transition-colors">
                Find Jobs →
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Platform Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">4K+</div>
              <div className="text-gray-600">People Hired</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1.1M</div>
              <div className="text-gray-600">Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">94%</div>
              <div className="text-gray-600">Retention Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">9.35/10</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-green-600 text-5xl font-bold mb-4">01</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Path</h3>
              <p className="text-gray-600">Select whether you're hiring or looking for a job.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-green-600 text-5xl font-bold mb-4">02</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Does the Work</h3>
              <p className="text-gray-600">Our 10 AI agents handle sourcing, screening, and matching.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-green-600 text-5xl font-bold mb-4">03</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Results</h3>
              <p className="text-gray-600">Meet top candidates or land your dream job in 5 days.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-green-100 mb-8">
            Your first 3 candidate interviews are on us. No commitment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/hiring" className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors">
              I'm Hiring →
            </Link>
            <Link to="/job-seeker" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              I'm Looking for a Job →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
