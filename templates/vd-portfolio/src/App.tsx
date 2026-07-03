import React, { useState } from 'react';
import { MapPin, ExternalLink, ChevronLeft, ChevronRight, Play, Image, Briefcase, GraduationCap, Heart, Mail, Phone, Globe, Download } from 'lucide-react';

const profile = {
  name: 'Vidhyashree Shidling',
  title: 'Aspiring Professional',
  location: 'Hassan, Karnataka',
  bio: 'A dedicated and passionate individual from Hassan, Karnataka. Known for creativity, dedication, and a strong drive to learn and grow. Always eager to explore new opportunities and make a positive impact.',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  email: 'vidhyashree@email.com',
  phone: '+91-98765-43210',
  socials: { instagram: '#', linkedin: '#', github: '#' },
};

const gallery = [
  { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', caption: 'City Walk' },
  { src: 'https://images.unsplash.com/photo-1532635242-4c5a9b3f8b5f?w=800&q=80', caption: 'Nature Escape' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', caption: 'Professional Moment' },
  { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', caption: 'Learning Session' },
  { src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', caption: 'Creative Space' },
  { src: 'https://images.unsplash.com/photo-1524508762098-fd966ffb6ef9?w=800&q=80', caption: 'Inspiration' },
];

const videos = [
  { id: 'dQw4w9WgXcQ', title: 'Creative Journey' },
  { id: 'jNQXAC9IVRw', title: 'Moments of Joy' },
  { id: 'kJQP7kiw5Fk', title: 'Life at Hassan' },
];

const timeline = [
  { year: '2025', title: 'Current Endeavor', desc: 'Pursuing new opportunities and personal growth projects.', icon: Briefcase },
  { year: '2024', title: 'Professional Development', desc: 'Completed advanced training and skill development programs.', icon: GraduationCap },
  { year: '2023', title: 'Academic Achievement', desc: 'Successfully completed higher secondary education with distinction.', icon: GraduationCap },
  { year: '2022', title: 'Creative Explorations', desc: 'Started exploring creative fields including design and content creation.', icon: Heart },
];

const skills = [
  { name: 'Communication', pct: 90 }, { name: 'Creativity', pct: 85 },
  { name: 'Problem Solving', pct: 80 }, { name: 'Teamwork', pct: 88 },
  { name: 'Adaptability', pct: 82 }, { name: 'Leadership', pct: 75 },
];

export default function App() {
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950">
      {/* Hero */}
      <section className="relative pt-16 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center animate-in">
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-rose-500/30 mb-5 shadow-xl shadow-rose-500/10">
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
          <p className="text-lg text-rose-400 mt-1 font-medium">{profile.title}</p>
          <div className="flex items-center justify-center gap-1.5 text-dark-400 text-sm mt-2">
            <MapPin className="w-4 h-4" /> {profile.location}
          </div>
          <p className="text-dark-400 max-w-xl mx-auto mt-4 text-sm leading-relaxed">{profile.bio}</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <a href={`mailto:${profile.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-all"><Mail className="w-4 h-4" /> Email</a>
            <a href={profile.socials.linkedin} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-200 text-sm font-medium transition-all"><ExternalLink className="w-4 h-4" /> LinkedIn</a>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="section-title animate-in delay-1">Skills</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {skills.map((s, i) => (
            <div key={s.name} className="animate-in" style={{ animationDelay: `${(i * 0.1) + 0.2}s` }}>
              <div className="flex justify-between text-sm mb-1"><span className="text-dark-200">{s.name}</span><span className="text-rose-400 font-medium">{s.pct}%</span></div>
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="section-title animate-in delay-2">Timeline</h2>
        <div className="space-y-4">
          {timeline.map((t, i) => (
            <div key={t.year} className="card animate-in flex items-start gap-4" style={{ animationDelay: `${(i * 0.15) + 0.3}s` }}>
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 flex items-center justify-center shrink-0"><t.icon className="w-5 h-5 text-rose-400" /></div>
              <div><div className="flex items-center gap-2"><span className="text-xs text-rose-400 font-medium">{t.year}</span><h3 className="text-base font-semibold text-white">{t.title}</h3></div><p className="text-sm text-dark-400 mt-1">{t.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="section-title animate-in delay-2">Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gallery.map((img, i) => (
            <button key={i} onClick={() => { setGalleryIdx(i); setShowLightbox(true); }} className="animate-in group relative aspect-square rounded-xl overflow-hidden bg-dark-800 border border-dark-700 hover:border-rose-500/30 transition-all" style={{ animationDelay: `${(i * 0.08) + 0.3}s` }}>
              <img src={img.src} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center"><Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" /></div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowLightbox(false)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={gallery[galleryIdx].src} alt={gallery[galleryIdx].caption} className="w-full max-h-[80vh] object-contain rounded-2xl" />
            <p className="text-center text-dark-300 text-sm mt-3">{gallery[galleryIdx].caption}</p>
            <button onClick={() => setGalleryIdx(i => i > 0 ? i - 1 : gallery.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-white" /></button>
            <button onClick={() => setGalleryIdx(i => i < gallery.length - 1 ? i + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><ChevronRight className="w-5 h-5 text-white" /></button>
            <button onClick={() => setShowLightbox(false)} className="absolute top-2 right-2 text-white/60 hover:text-white text-2xl">&times;</button>
            <div className="text-center text-dark-500 text-xs mt-2">{galleryIdx + 1} / {gallery.length}</div>
          </div>
        </div>
      )}

      {/* Videos */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="section-title animate-in delay-3">Videos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v, i) => (
            <div key={v.id} className="card animate-in p-3" style={{ animationDelay: `${(i * 0.1) + 0.4}s` }}>
              <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="aspect-video rounded-xl bg-dark-800 overflow-hidden relative">
                  <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-all"><Play className="w-12 h-12 text-white/80 group-hover:text-white transition-all" /></div>
                </div>
                <p className="text-sm text-dark-300 mt-2 font-medium flex items-center gap-1.5"><Play className="w-3.5 h-3.5 text-rose-400" />{v.title}</p>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-4xl mx-auto px-4 py-10 pb-16">
        <h2 className="section-title animate-in delay-3">Contact</h2>
        <div className="card animate-in delay-4 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`mailto:${profile.email}`} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 transition-all"><Mail className="w-4 h-4 text-rose-400" /><span className="text-sm text-dark-200">{profile.email}</span></a>
            <a href={`tel:${profile.phone}`} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 transition-all"><Phone className="w-4 h-4 text-rose-400" /><span className="text-sm text-dark-200">{profile.phone}</span></a>
            <a href={profile.socials.linkedin} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 transition-all"><ExternalLink className="w-4 h-4 text-rose-400" /><span className="text-sm text-dark-200">LinkedIn</span></a>
          </div>
          <p className="text-dark-500 text-xs mt-5">© 2025 Vidhyashree Shidling. All rights reserved.</p>
        </div>
      </section>
    </div>
  );
}
