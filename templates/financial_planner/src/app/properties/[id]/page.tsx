'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star, Home, Bed, Maximize, Shield, Check, Share2, Heart, Phone, Scale, MessageSquare, Building2, Clock, ChevronDown, ChevronUp, DollarSign, FileText, Users, Wallet, Mail, Globe, ExternalLink, Map } from 'lucide-react';
import { projects, propertyListings } from '@/lib/data';
import { stampDuty, registrationFee, gstOnUnderConstruction, totalBuyingCost, calculateEMI } from '@/lib/utils';
import { getItem, USER_KEY, setItem, generateId } from '@/lib/storage';

export default function PropertyDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showCost, setShowCost] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [buyStep, setBuyStep] = useState(0);
  const [shared, setShared] = useState(false);
  const [liked, setLiked] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => { setUser(getItem(USER_KEY, null)); }, []);

  const project = projects.find(p => p.id === id);
  const listings = propertyListings.filter(l => l.projectId === id);

  if (!project) return (
    <div className="card text-center py-16"><Building2 className="w-12 h-12 text-dark-600 mx-auto mb-4" /><p className="text-dark-400">Project not found</p><button onClick={() => router.push('/properties')} className="btn-primary mt-4"><ArrowLeft className="w-4 h-4" /> Back to Properties</button></div>
  );

  const totalCost = totalBuyingCost(project.priceMax * 100000, project.status !== 'Ready to Move', project.city);
  const emi = calculateEMI(project.priceMax * 100000 * 0.8, 8.5, 240); // 80% loan, 8.5% rate, 20yr

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: project.name, text: `${project.name} - ${project.priceRange}`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleBuy = () => {
    if (!user) { router.push('/login'); return; }
    setShowBuy(true);
    setBuyStep(1);
    setTimeout(() => setBuyStep(2), 1500);
    setTimeout(() => setBuyStep(3), 3000);
    setTimeout(() => setBuyStep(4), 4500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => router.push('/properties')} className="btn-ghost text-sm gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="w-full lg:w-96 shrink-0 relative">
            {/* Main Image */}
            <div className="h-48 lg:h-56 rounded-2xl bg-dark-800 overflow-hidden relative">
              <img
                src={project.images?.[galleryIndex] || project.image}
                alt={project.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                <span className="badge-blue text-xs">{project.city}</span>
                <span className={`badge text-xs ${project.status === 'Ready to Move' ? 'badge-green' : project.status === 'Under Construction' ? 'badge-yellow' : 'badge-gray'}`}>{project.status}</span>
              </div>
              {/* Image counter */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full z-10">
                {galleryIndex + 1} / {(project.images?.length || 1)}
              </div>
              {/* Arrows */}
              {project.images && project.images.length > 1 && (
                <>
                  <button onClick={() => setGalleryIndex(i => i > 0 ? i - 1 : (project.images!.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white z-10 transition-all">‹</button>
                  <button onClick={() => setGalleryIndex(i => i < (project.images!.length - 1) ? i + 1 : 0)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white z-10 transition-all">›</button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {project.images && project.images.length > 1 && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {project.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setGalleryIndex(i)} className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === galleryIndex ? 'border-finance-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-80'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.style.background = '#1e293b'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-dark-400 text-sm mt-1">{project.builder}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="text-lg font-bold text-white">{project.rating}</span><span className="text-xs text-dark-500">({project.reviews})</span></div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-dark-400 mt-2"><MapPin className="w-4 h-4" /> {project.location}, {project.city}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { icon: Home, label: 'Type', value: project.type },
                { icon: Bed, label: 'Config', value: project.bedrooms },
                { icon: Maximize, label: 'Area', value: project.areaRange },
                { icon: Shield, label: 'RERA', value: 'Registered' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-dark-800/50 border border-dark-800">
                  <s.icon className="w-4 h-4 text-dark-400 shrink-0" />
                  <div><div className="text-xs text-dark-500">{s.label}</div><div className="text-sm font-medium text-dark-200">{s.value}</div></div>
                </div>
              ))}
            </div>

            {/* Price & Actions */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="text-2xl font-bold text-prop-400">{project.priceRange}</div>
              <button onClick={handleBuy} className="btn-primary text-sm"><DollarSign className="w-4 h-4" /> Buy Now</button>
              <button onClick={handleShare} className="btn-secondary text-sm">{shared ? <><Check className="w-4 h-4" /> Copied</> : <><Share2 className="w-4 h-4" /> Share</>}</button>
              <button onClick={() => setLiked(!liked)} className={`btn-ghost p-2 ${liked ? 'text-red-400' : ''}`}><Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} /></button>
              <button onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })} className="btn-ghost text-sm"><Phone className="w-4 h-4" /> Contact</button>
              {user && <button onClick={() => router.push(`/legal?property=${project.id}`)} className="btn-ghost text-sm"><Scale className="w-4 h-4" /> Legal Check</button>}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">About This Project</h2>
          <p className="text-sm text-dark-300 leading-relaxed">{project.description}</p>
          <div>
            <h3 className="text-sm font-semibold text-dark-200 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {project.amenities.map(a => <span key={a} className="badge-blue text-[10px]">{a}</span>)}
            </div>
          </div>
          <div className="pt-3 border-t border-dark-800">
            <div className="text-xs text-dark-500"><Shield className="w-3 h-3 inline mr-1" />RERA No: {project.rera}</div>
            {project.possession && <div className="text-xs text-dark-500 mt-1"><Clock className="w-3 h-3 inline mr-1" />Possession: {project.possession}</div>}
            <div className="flex flex-wrap gap-1.5 mt-2">{project.tags.map(t => <span key={t} className="badge-gray text-[10px]">{t}</span>)}</div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Cost Calculator</h2>
          <p className="text-xs text-dark-400">Based on max price: <span className="text-white font-medium">{project.priceRange}</span></p>

          <div className="space-y-2">
            {[
              { label: 'Base Price', value: project.priceMax * 100000, calc: (v: number) => `₹${(v/100000).toFixed(1)} L` },
              { label: 'Stamp Duty (5%)', value: stampDuty(project.priceMax * 100000), calc: (v: number) => `₹${(v/100000).toFixed(2)} L` },
              { label: 'Registration (1%)', value: registrationFee(project.priceMax * 100000), calc: (v: number) => `₹${(v/100000).toFixed(2)} L` },
              ...(project.status !== 'Ready to Move' ? [{ label: 'GST (5%)', value: gstOnUnderConstruction(project.priceMax * 100000, true), calc: (v: number) => `₹${(v/100000).toFixed(2)} L` }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5"><span className="text-sm text-dark-400">{item.label}</span><span className="text-sm font-medium text-dark-200">{item.calc(item.value)}</span></div>
            ))}
            <div className="pt-2 border-t border-dark-700 flex items-center justify-between"><span className="text-sm font-semibold text-white">Total Cost</span><span className="text-lg font-bold text-prop-400">₹{(totalCost / 100000).toFixed(1)} L</span></div>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-finance-500/10 border border-finance-500/20">
            <p className="text-xs text-finance-400 font-medium">💰 EMI Estimate (80% loan, 8.5%, 20yr)</p>
            <p className="text-lg font-bold text-white mt-1">₹{emi.toLocaleString('en-IN')}/mo</p>
          </div>

          <button onClick={() => router.push('/planner')} className="btn-secondary w-full text-sm justify-center"><Wallet className="w-4 h-4" /> Full Financial Planner</button>
        </div>
      </div>

      {/* Listings */}
      {listings.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Available Listings</h2>
          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${l.type === 'Sale' ? 'badge-green' : 'badge-blue'} text-[10px]`}>{l.type}</span>
                    <span className="text-sm font-semibold text-white">₹{(l.price / 100000).toFixed(1)} L</span>
                  </div>
                  <p className="text-xs text-dark-400 mt-1">{l.bedrooms}BHK • {l.area} sqft • Floor {l.floor} • {l.facing}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{l.listedBy} • {l.postedDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-primary text-xs py-1.5 px-3">Inquire</button>
                  <button className="btn-ghost p-1.5"><Phone className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div id="contact-section" className="card border-finance-500/20 bg-gradient-to-br from-finance-900/20 to-dark-900">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-finance-600/20 flex items-center justify-center"><Phone className="w-5 h-5 text-finance-400" /></div>
          <div><h2 className="text-lg font-semibold text-white">Contact & Location</h2><p className="text-xs text-dark-400">Get in touch with the builder for inquiries and site visits</p></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Phone */}
          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-finance-500/30 transition-all">
            <div className="flex items-center gap-2 text-finance-400 mb-2"><Phone className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Sales Phone</span></div>
            <a href={`tel:${project.contact.salesPhone}`} className="text-lg font-bold text-white hover:text-finance-400 transition-colors">{project.contact.salesPhone}</a>
            <p className="text-[10px] text-dark-500 mt-1">Call for pricing, site visits & inquiries</p>
          </div>

          {/* Email */}
          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-finance-500/30 transition-all">
            <div className="flex items-center gap-2 text-finance-400 mb-2"><Mail className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Email</span></div>
            <a href={`mailto:${project.contact.email}`} className="text-sm font-medium text-white hover:text-finance-400 transition-colors break-all">{project.contact.email}</a>
            <p className="text-[10px] text-dark-500 mt-1">Send your inquiries and document requests</p>
          </div>

          {/* Website */}
          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-finance-500/30 transition-all">
            <div className="flex items-center gap-2 text-finance-400 mb-2"><Globe className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Website</span></div>
            <a href={`https://${project.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-finance-400 hover:text-finance-300 transition-colors flex items-center gap-1">
              {project.contact.website} <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[10px] text-dark-500 mt-1">Visit website for brochures & virtual tours</p>
          </div>

          {/* Office Address */}
          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-finance-500/30 transition-all">
            <div className="flex items-center gap-2 text-finance-400 mb-2"><Building2 className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Corporate Office</span></div>
            <p className="text-sm text-white">{project.contact.officeAddress}</p>
          </div>

          {/* Sales Office / Site Address */}
          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-finance-500/30 transition-all">
            <div className="flex items-center gap-2 text-finance-400 mb-2"><Map className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Sales Office</span></div>
            <p className="text-sm text-white">{project.contact.salesOffice}</p>
            <p className="text-[10px] text-dark-500 mt-1">Visit the sales office for project tour</p>
          </div>

          {/* Site Timings */}
          <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700 hover:border-finance-500/30 transition-all">
            <div className="flex items-center gap-2 text-finance-400 mb-2"><Clock className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Site Visit Timings</span></div>
            <p className="text-sm text-white">{project.contact.siteTimings}</p>
            <p className="text-[10px] text-dark-500 mt-1">Walk-ins welcome | Prior booking recommended</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-dark-700">
          <a href={`tel:${project.contact.salesPhone}`} className="btn-primary text-sm"><Phone className="w-4 h-4" /> Call Now</a>
          <a href={`mailto:${project.contact.email}?subject=Inquiry about ${project.name} - FinPlanner`} className="btn-secondary text-sm"><Mail className="w-4 h-4" /> Send Email</a>
          <a href={`https://${project.contact.website}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm"><Globe className="w-4 h-4" /> Visit Website</a>
          {user && <button onClick={() => router.push(`/legal?property=${project.id}`)} className="btn-ghost text-sm"><Scale className="w-4 h-4" /> Legal Check</button>}
        </div>
      </div>

      {/* Buy Flow */}
      {showBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowBuy(false)}>
          <div className="max-w-md w-full card border-finance-500/30 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white">
              {buyStep === 1 ? 'Processing Your Request...' : buyStep === 2 ? 'Verifying Details...' : buyStep === 3 ? 'Generating Agreement...' : 'Purchase Initiated!'}
            </h2>
            {buyStep < 4 ? (
              <div className="space-y-3">
                {[
                  { label: 'Property selected', done: buyStep >= 1 },
                  { label: 'Price confirmed', done: buyStep >= 2 },
                  { label: 'Documents verified', done: buyStep >= 3 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s.done ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-500'}`}>{s.done ? <Check className="w-3.5 h-3.5" /> : i + 1}</div>
                    <span className={`text-sm ${s.done ? 'text-dark-200' : 'text-dark-500'}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="w-7 h-7 text-green-400" /></div>
                <p className="text-dark-300 text-sm">Our agent will contact you within 24 hours to complete the purchase.</p>
                <p className="text-xs text-dark-500 mt-2">Reference: FP-{Date.now().toString(36).toUpperCase()}</p>
                <button onClick={() => setShowBuy(false)} className="btn-primary mt-4">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
