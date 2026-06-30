import { Target, Eye, Users, Zap } from 'lucide-react';

const values = [
  {
    icon: <Target size={24} />,
    title: 'Innovation First',
    description: 'We push the boundaries of what AI can do, constantly exploring new possibilities and building tools that were once thought impossible.',
  },
  {
    icon: <Eye size={24} />,
    title: 'User-Centric Design',
    description: 'Every product we build starts with the user. We believe powerful technology should be accessible, intuitive, and delightful to use.',
  },
  {
    icon: <Users size={24} />,
    title: 'Collaborative Spirit',
    description: 'We work alongside our clients as partners, not just vendors. Your success is our success, and we invest in understanding your goals.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Ship Fast, Iterate Faster',
    description: 'We move quickly, ship working products, and iterate based on real feedback. Speed and quality are not mutually exclusive.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-dark-900">About NexusAI</h1>
        <p className="text-dark-400 mt-3 text-lg leading-relaxed">
          We&apos;re a team of AI enthusiasts, developers, and creative minds building the next generation of SaaS products and services.
        </p>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <div>
          <h2 className="text-2xl font-bold text-dark-900 mb-4">Our Story</h2>
          <div className="space-y-4 text-sm text-dark-500 leading-relaxed">
            <p>
              NexusAI was born from a simple idea: make AI accessible to everyone. We started by building AI-powered
              tools for video generation and content creation, and quickly realized the vast potential of combining
              artificial intelligence with practical business solutions.
            </p>
            <p>
              Today, we offer a comprehensive suite of products and services — from automated YouTube channel management
              to AI employee assistants, from travel planning to bootcamp platforms. Our services span content marketing,
              film production, social media strategy, newsletter writing, and startup advisory.
            </p>
            <p>
              Every product we build and every service we deliver is driven by the same mission: empower businesses
              and individuals with AI tools that save time, reduce costs, and unlock new creative possibilities.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-brand-50 to-fire-50 rounded-2xl p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl font-extrabold bg-gradient-to-r from-brand-500 to-fire-500 bg-clip-text text-transparent">
              NexusAI
            </p>
            <p className="text-dark-400 mt-2 text-sm">Building the future with AI</p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-dark-900 text-center mb-10">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div key={value.title} className="bg-white rounded-2xl border border-dark-200 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                {value.icon}
              </div>
              <h3 className="text-sm font-bold text-dark-900">{value.title}</h3>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-dark-900 rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Our Tech Stack</h2>
        <p className="text-dark-400 text-sm max-w-lg mx-auto mb-8">
          We use modern technologies to build fast, reliable, and scalable AI products.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Python', 'YouTube API', 'Google Cloud', 'Vercel', 'Netlify'].map((tech) => (
            <span key={tech} className="px-4 py-2 rounded-xl bg-dark-800 text-dark-300 text-xs font-medium border border-dark-700">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
