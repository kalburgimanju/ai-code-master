import { useState } from 'react'

// Profile Setup Form
function ProfileSetupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    skills: '',
    education: '',
    preferredRole: '',
    salaryExpectation: '',
    availability: 'immediate'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Profile created! AI will start matching you with relevant opportunities.')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Your Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+966 5XX XXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Location *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Riyadh, Saudi Arabia"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            >
              <option value="">Select Experience</option>
              <option value="0-1">0-1 years (Entry Level)</option>
              <option value="1-3">1-3 years (Junior)</option>
              <option value="3-5">3-5 years (Mid Level)</option>
              <option value="5-10">5-10 years (Senior)</option>
              <option value="10+">10+ years (Lead/Executive)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Role *</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.preferredRole}
              onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
            >
              <option value="">Select Role Type</option>
              <option value="engineering">Engineering</option>
              <option value="product">Product</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salary Expectation (SAR/month)</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., 15,000 - 20,000"
              value={formData.salaryExpectation}
              onChange={(e) => setFormData({ ...formData, salaryExpectation: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills *</label>
          <textarea
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="React, TypeScript, Node.js, Python, SQL..."
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
          <textarea
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="University, Degree, Year..."
            value={formData.education}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability *</label>
          <select
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          >
            <option value="immediate">Immediately</option>
            <option value="2-weeks">2 Weeks Notice</option>
            <option value="1-month">1 Month Notice</option>
            <option value="2-months">2+ Months</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Create Profile & Start Matching →
          </button>
          <button
            type="button"
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-green-600 hover:text-green-600 transition-colors font-semibold"
          >
            Upload Resume Instead
          </button>
        </div>
      </form>
    </div>
  )
}

// Job Matches Dashboard
function JobMatchesDashboard() {
  const matches = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp Saudi',
      location: 'Riyadh',
      salary: 'SAR 20,000 - 28,000',
      matchScore: 95,
      posted: '1 day ago',
      skills: ['React', 'TypeScript', 'Node.js']
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'InnovateHub',
      location: 'Jeddah',
      salary: 'SAR 18,000 - 25,000',
      matchScore: 88,
      posted: '3 days ago',
      skills: ['React', 'Python', 'AWS']
    },
    {
      id: 3,
      title: 'Frontend Developer',
      company: 'Digital Solutions',
      location: 'Remote',
      salary: 'SAR 15,000 - 22,000',
      matchScore: 82,
      posted: '1 week ago',
      skills: ['Vue.js', 'JavaScript', 'CSS']
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">AI-Matched Jobs</h3>
        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
          {matches.length} Matches Found
        </span>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{match.title}</h4>
                <p className="text-gray-600">{match.company} • {match.location}</p>
                <p className="text-green-600 font-semibold">{match.salary}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{match.matchScore}%</div>
                <div className="text-sm text-gray-600">Match Score</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {match.skills.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Posted {match.posted}</span>
              <div className="flex gap-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                  Apply Now
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-green-600 hover:text-green-600 transition-colors text-sm font-medium">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Application Status
function ApplicationStatus() {
  const applications = [
    {
      id: 1,
      jobTitle: 'Senior Software Engineer',
      company: 'GlobalTech',
      status: 'interview',
      statusText: 'Interview Scheduled',
      date: 'Tomorrow, 2:00 PM',
      color: 'blue'
    },
    {
      id: 2,
      jobTitle: 'React Developer',
      company: 'StartupXYZ',
      status: 'screening',
      statusText: 'AI Screening in Progress',
      date: 'Applied 2 days ago',
      color: 'purple'
    },
    {
      id: 3,
      jobTitle: 'Full Stack Engineer',
      company: 'Enterprise Corp',
      status: 'review',
      statusText: 'Under Review',
      date: 'Applied 5 days ago',
      color: 'orange'
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Applications</h3>
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <h4 className="font-bold text-gray-900">{app.jobTitle}</h4>
              <p className="text-gray-600">{app.company}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                app.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                app.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {app.statusText}
              </span>
              <p className="text-gray-500 text-sm mt-1">{app.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skills Assessment
function SkillsAssessment() {
  const skills = [
    { name: 'React', level: 90, category: 'Technical' },
    { name: 'TypeScript', level: 85, category: 'Technical' },
    { name: 'Node.js', level: 80, category: 'Technical' },
    { name: 'Problem Solving', level: 95, category: 'Soft Skills' },
    { name: 'Communication', level: 88, category: 'Soft Skills' },
    { name: 'Team Leadership', level: 75, category: 'Leadership' }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Skills Assessment</h3>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{skill.name}</span>
              <span className="text-sm text-gray-600">{skill.level}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${skill.level}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{skill.category}</span>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
        Take AI Skills Assessment
      </button>
    </div>
  )
}

// Job Seeker Page Main Component
export function JobSeekerPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Job Seeker Dashboard</h1>
          <p className="text-xl text-blue-100">Find your dream job with AI-powered matching</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-green-600">12</div>
            <div className="text-gray-600">Job Matches</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">5</div>
            <div className="text-gray-600">Applications Sent</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">2</div>
            <div className="text-gray-600">Interviews Scheduled</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-orange-600">85%</div>
            <div className="text-gray-600">Profile Complete</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Profile Setup */}
          <ProfileSetupForm />

          {/* Job Matches */}
          <JobMatchesDashboard />
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Application Status */}
          <ApplicationStatus />

          {/* Skills Assessment */}
          <SkillsAssessment />
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-semibold">Search Jobs</div>
            </button>
            <button className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">Update Resume</div>
            </button>
            <button className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">Skill Assessment</div>
            </button>
            <button className="bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-700 transition-colors">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold">AI Courses</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
