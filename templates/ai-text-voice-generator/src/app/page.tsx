'use client';

import { useRouter } from 'next/navigation';
import { Mic, Video, User, Sparkles, ArrowRight, Play } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Nav */}
      <nav className="border-b border-dark-500/50 backdrop-blur-sm bg-dark-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AI Video Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/auth/login')} className="btn-secondary text-sm">
              Log In
            </button>
            <button onClick={() => router.push('/auth/signup')} className="btn-primary text-sm">
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-primary-800/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">Powered by Multi-Agent AI</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Turn Text Into
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Stunning Videos
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Write a script, and our AI agents will generate voiceovers, avatars, and
              complete videos — all from a single prompt.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/auth/signup')}
                className="btn-primary text-base px-8 py-3 flex items-center gap-2"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="btn-secondary text-base px-8 py-3"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Meet the AI Agents</h2>
        <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
          Four specialized agents work together to bring your scripts to life
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Mic,
              title: 'VoiceCraft TTS',
              desc: 'Neural text-to-speech with emotion control, multiple languages, and voice cloning',
              color: 'from-blue-500 to-cyan-500',
              badge: 'Voice Agent',
            },
            {
              icon: Video,
              title: 'SceneWeaver',
              desc: 'Dynamic video generation from scripts with scene composition and transitions',
              color: 'from-purple-500 to-pink-500',
              badge: 'Video Agent',
            },
            {
              icon: User,
              title: 'PersonaForge',
              desc: 'AI avatar creation with lip-sync animation and expressive gestures',
              color: 'from-emerald-500 to-teal-500',
              badge: 'Avatar Agent',
            },
            {
              icon: Sparkles,
              title: 'DirectorAI',
              desc: 'Orchestrates all agents to produce complete projects from one prompt',
              color: 'from-amber-500 to-orange-500',
              badge: 'Orchestrator',
            },
          ].map((feature) => (
            <div key={feature.title} className="card-glow group">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <span className="badge-blue text-xs mb-3">{feature.badge}</span>
              <h3 className="text-lg font-semibold text-white mt-2 mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-dark-800/50 border-y border-dark-500/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-14">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Write Your Script', desc: 'Enter your text, choose a voice, and select an avatar style' },
              { step: '2', title: 'AI Agents Generate', desc: 'Our agents work in parallel — TTS, video rendering, avatar animation' },
              { step: '3', title: 'Download & Share', desc: 'Preview your video, download in HD, or share directly' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-5">
                  <span className="text-xl font-bold text-primary-400">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card-glow bg-gradient-to-br from-primary-600/10 to-primary-800/10 border-primary-500/20 text-center py-16 px-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Start generating professional videos with AI agents. No credit card required.
          </p>
          <button
            onClick={() => router.push('/auth/signup')}
            className="btn-primary text-base px-10 py-3.5 flex items-center gap-2 mx-auto"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-500/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          AI Video Studio — Multi-Agent Video Generation Platform
        </div>
      </footer>
    </div>
  );
}
