import { useState } from 'react'

// Job Posting Form Component
function JobPostingForm() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    location: '',
    jobType: 'full-time',
    salaryRange: '',
    description: '',
    requirements: '',
    benefits: '',
    deadline: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Job posted successfully! AI agents will start sourcing candidates.')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Senior Software Engineer"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Department</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., SAR 15,000 - 25,000"
              value={formData.salaryRange}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
          <textarea
            required
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe the role, responsibilities, and what a typical day looks like..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Requirements *</label>
          <textarea
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="List required skills, experience, qualifications..."
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Benefits & Perks</label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Health insurance, annual leave, training opportunities..."
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Post Job & Start AI Sourcing →
          </button>
          <button
            type="button"
            className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-green-600 hover:text-green-600 transition-colors font-semibold"
          >
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  )
}

// Active Jobs Dashboard
function ActiveJobsDashboard() {
  const jobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      location: 'Riyadh',
      applicants: 45,
      screened: 12,
      interviewed: 3,
      status: 'active',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Product Manager',
      location: 'Jeddah',
      applicants: 32,
      screened: 8,
      interviewed: 2,
      status: 'active',
      posted: '5 days ago'
    },
    {
      id: 3,
      title: 'UX Designer',
      location: 'Remote',
      applicants: 28,
      screened: 10,
      interviewed: 3,
      status: 'interviewing',
      posted: '1 week ago'
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Active Job Listings</h3>
        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
          {jobs.length} Active Jobs
        </span>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
                <p className="text-gray-600">{job.location} • Posted {job.posted}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {job.status === 'active' ? 'AI Sourcing' : 'Interviewing'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{job.applicants}</div>
                <div className="text-sm text-gray-600">Applicants</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{job.screened}</div>
                <div className="text-sm text-gray-600">Screened</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{job.interviewed}</div>
                <div className="text-sm text-gray-600">Interviewed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">Hired</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                View Candidates
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-green-600 hover:text-green-600 transition-colors text-sm font-medium">
                Edit Job
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-red-600 hover:text-red-600 transition-colors text-sm font-medium">
                Pause
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// AI Pipeline Status
function AIPipelineStatus() {
  const stages = [
    { name: 'Job Posted', count: 3, status: 'completed' },
    { name: 'Sourcing 1M+', count: 3, status: 'active' },
    { name: 'AI Screening', count: 2, status: 'active' },
    { name: 'AI Interviews', count: 1, status: 'active' },
    { name: 'Scheduled', count: 0, status: 'pending' }
  ]

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">AI Pipeline Status</h3>
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center">
            <div className={`text-center p-4 rounded-xl min-w-[120px] ${
              stage.status === 'completed' ? 'bg-green-600 text-white' :
              stage.status === 'active' ? 'bg-white text-green-600 border-2 border-green-600' :
              'bg-gray-200 text-gray-500'
            }`}>
              <div className="text-2xl font-bold">{stage.count}</div>
              <div className="text-sm font-medium">{stage.name}</div>
            </div>
            {index < stages.length - 1 && (
              <svg className="w-8 h-8 text-green-600 mx-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-gray-600 mt-4">
        Every step powered by AI — zero manual work required
      </p>
    </div>
  )
}

// Hiring Page Main Component
export function HiringPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hiring Dashboard</h1>
          <p className="text-xl text-green-100">Post jobs, track AI sourcing, and manage candidates</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-gray-600">Active Jobs</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">105</div>
            <div className="text-gray-600">Total Applicants</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">30</div>
            <div className="text-gray-600">AI Screened</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-orange-600">8</div>
            <div className="text-gray-600">Interviews Scheduled</div>
          </div>
        </div>

        {/* AI Pipeline */}
        <div className="mb-12">
          <AIPipelineStatus />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Job Posting Form */}
          <JobPostingForm />

          {/* Active Jobs */}
          <ActiveJobsDashboard />
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold">Post New Job</div>
            </button>
            <button className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">View Candidates</div>
            </button>
            <button className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Analytics</div>
            </button>
            <button className="bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-700 transition-colors">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-semibold">Settings</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
