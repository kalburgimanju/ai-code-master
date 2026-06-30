'use client';

import { useState } from 'react';
import { Send, Mail, MessageSquare, MapPin, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, this would POST to an API endpoint
    setSubmitted(true);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-dark-900">Get in Touch</h1>
        <p className="text-dark-400 mt-3 max-w-xl mx-auto">
          Have a project in mind? Need AI solutions for your business? Let&apos;s talk.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-dark-200 p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <Mail size={20} />
            </div>
            <h3 className="text-sm font-bold text-dark-900">Email</h3>
            <p className="text-sm text-dark-400 mt-1">manjunathkhubli85@gmail.com</p>
          </div>
          <div className="bg-white rounded-2xl border border-dark-200 p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-sm font-bold text-dark-900">Response Time</h3>
            <p className="text-sm text-dark-400 mt-1">We typically reply within 24 hours.</p>
          </div>
          <div className="bg-white rounded-2xl border border-dark-200 p-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <MapPin size={20} />
            </div>
            <h3 className="text-sm font-bold text-dark-900">Location</h3>
            <p className="text-sm text-dark-400 mt-1">Remote-first / Worldwide</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="bg-white rounded-2xl border border-neon-200 p-10 text-center">
              <CheckCircle size={48} className="text-neon-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-900">Message Sent!</h3>
              <p className="text-dark-400 mt-2">Thank you for reaching out. We&apos;ll get back to you soon.</p>
              <button
                onClick={() => { setSubmitted(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-dark-200 p-8 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-dark-700 mb-1.5">
                    Name <span className="text-fire-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-dark-200 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-dark-700 mb-1.5">
                    Email <span className="text-fire-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-dark-200 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-xs font-medium text-dark-700 mb-1.5">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-medium text-dark-700 mb-1.5">
                  Message <span className="text-fire-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-dark-200 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
