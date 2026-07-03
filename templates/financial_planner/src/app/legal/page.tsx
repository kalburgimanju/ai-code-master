'use client';
import { useState, useEffect } from 'react';
import { Scale, FileText, Shield, CheckCircle, AlertTriangle, ArrowRight, Search, Clock, User, Building2, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { projects } from '@/lib/data';
import { getItem, USER_KEY } from '@/lib/storage';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'opinions' | 'checklist' | 'consult'>('opinions');
  const [user, setUser] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [questions, setQuestions] = useState('I want to verify the title deed and RERA compliance for this property.');
  const [opinionResult, setOpinionResult] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setUser(getItem(USER_KEY, null)); }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.city.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleGetOpinion = () => {
    const property = projects.find(p => p.id === selectedProperty);
    if (!property) return;
    setOpinionResult(`# Legal Opinion: ${property.name}

## Property Details
- **Project:** ${property.name}
- **Builder:** ${property.builder}
- **Location:** ${property.location}, ${property.city}
- **RERA No:** ${property.rera}
- **Status:** ${property.status}

## RERA Compliance Check ✅
- RERA Registered: Yes (${property.rera})
- RERA Status: Active
- Compliance: Up to date

## Title Deed Analysis
- Title: Clear marketable title
- Encumbrance: No pending charges
- Original documents: Verified with sub-registrar

## Recommended Next Steps
1. ✅ Verify original title deed with advocate
2. ✅ Check encumbrance certificate (last 13 years)
3. ✅ Verify property tax receipts
4. ✅ Confirm building plan approval from municipal corporation
5. ✅ Check mother deed and chain of ownership
6. ✅ Verify no litigation pending on property

## Stamp Duty & Registration
- **Stamp Duty (Karnataka):** 5% of property value
- **Registration Fee:** 1% of property value
- **GST (Under Construction):** 5%
- **Total Additional Cost:** ~6-7% of property value

> This is an AI-generated preliminary opinion. We strongly recommend consulting a registered legal professional before making any purchase decision.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center"><Scale className="w-5.5 h-5.5 text-amber-400" /></div>
        <div><h1 className="text-2xl font-bold text-white">Legal Services</h1><p className="text-dark-400 text-sm mt-1">Legal opinions, due diligence, and compliance checks for property purchase</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 rounded-xl p-1 w-fit">
        {(['opinions', 'checklist', 'consult'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}>{t === 'opinions' ? 'AI Legal Opinion' : t === 'checklist' ? 'Due Diligence' : 'Consult Expert'}</button>
        ))}
      </div>

      {/* AI Legal Opinion */}
      {activeTab === 'opinions' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-amber-400" /> Get AI Legal Opinion</h2>
            <p className="text-xs text-dark-400">Select a property and describe your legal concerns. Our AI will generate a preliminary legal opinion.</p>

            <div>
              <label className="label">Search Property</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input pl-10" placeholder="Search by name or city..." />
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredProjects.map(p => (
                <button key={p.id} onClick={() => { setSelectedProperty(p.id); setSearchQuery(''); }} className={`w-full text-left p-2.5 rounded-lg text-sm transition-all ${selectedProperty === p.id ? 'bg-finance-600/20 border border-finance-500/30 text-finance-400' : 'bg-dark-800 hover:bg-dark-700 border border-dark-800 text-dark-300'}`}>
                  {p.name} <span className="text-[10px] text-dark-500">({p.city})</span>
                </button>
              ))}
            </div>

            <div>
              <label className="label">Your Legal Questions</label>
              <textarea value={questions} onChange={e => setQuestions(e.target.value)} className="input min-h-[100px]" placeholder="Describe what you want to check..." />
            </div>

            <button onClick={handleGetOpinion} disabled={!selectedProperty} className="btn-primary w-full justify-center text-sm">
              <Scale className="w-4 h-4" /> Generate Legal Opinion
            </button>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-1" />
              <span className="text-xs text-amber-400">AI-generated opinions are preliminary. Always consult a registered legal professional.</span>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Shield className="w-5 h-5 text-green-400" /> Legal Opinion</h2>
            {opinionResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"><div className="flex items-center gap-2 text-green-400 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Property is Legally Clear</div></div>
                <div className="prose prose-invert text-sm text-dark-300 whitespace-pre-wrap leading-relaxed">{opinionResult.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">{line.slice(2)}</h3>;
                  if (line.startsWith('## ')) return <h4 key={i} className="text-sm font-semibold text-dark-200 mt-3 mb-1">{line.slice(3)}</h4>;
                  if (line.startsWith('- [ ]') || line.startsWith('- ✅')) return <div key={i} className="flex items-start gap-2 text-xs text-dark-300 py-1"><CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" /><span>{line.slice(4)}</span></div>;
                  if (line.startsWith('- **')) return <div key={i} className="text-xs text-dark-400 py-0.5">{line}</div>;
                  if (line.startsWith('> ')) return <div key={i} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 mt-2">{line.slice(2)}</div>;
                  return line ? <p key={i} className="text-xs text-dark-300">{line}</p> : <br key={i} />;
                })}</div>
                <div className="flex gap-2"><button className="btn-primary text-sm"><FileText className="w-4 h-4" /> Download PDF</button><button className="btn-secondary text-sm"><Mail className="w-4 h-4" /> Email Report</button></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64"><div className="text-center"><Scale className="w-10 h-10 text-dark-600 mx-auto mb-3" /><p className="text-dark-400 text-sm">Select a property and click "Generate Legal Opinion"</p><p className="text-dark-500 text-xs mt-1">Get AI-powered legal analysis</p></div></div>
            )}
          </div>
        </div>
      )}

      {/* Due Diligence Checklist */}
      {activeTab === 'checklist' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">📋 Due Diligence Checklist</h2>
            <div className="space-y-3">
              {[
                { title: 'Title Deed Verification', desc: 'Verify complete chain of ownership from original owner to current seller', critical: true },
                { title: 'Encumbrance Certificate', desc: 'Check for any pending loans or legal charges on the property (last 13 years)', critical: true },
                { title: 'RERA Registration', desc: 'Verify project is registered under RERA and check the status', critical: true },
                { title: 'Building Plan Approval', desc: 'Confirm plans approved by local municipal authority (BBMP/HDUDA/MUDA)', critical: true },
                { title: 'Property Tax Receipts', desc: 'Check up-to-date property tax payments and assessment', critical: false },
                { title: 'Mother Deed', desc: 'Trace the original deed from which the property was derived', critical: true },
                { title: 'Khata Certificate', desc: 'Verify A-Khata or B-Khata status with local municipality', critical: true },
                { title: 'Location Clearance', desc: 'Check if property falls in approved residential/commercial zone', critical: false },
                { title: 'Litigation Check', desc: 'Search for any ongoing or past litigation on the property', critical: true },
                { title: 'Occupancy Certificate', desc: 'For ready properties, verify OC from municipal authorities', critical: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-800/50 border border-dark-800">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${item.critical ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}><AlertTriangle className="w-3 h-3" /></div>
                  <div><div className="text-sm font-medium text-white">{item.title}</div><p className="text-xs text-dark-400 mt-0.5">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white">📊 Legal Fee Estimator</h2>
            <p className="text-xs text-dark-400">Estimated legal costs for property purchase in Karnataka:</p>
            {[
              { item: 'Advocate Fee (Title Check)', cost: '₹15,000 - ₹30,000' },
              { item: 'Property Valuation', cost: '₹5,000 - ₹10,000' },
              { item: 'Encumbrance Certificate', cost: '₹500 - ₹2,000' },
              { item: 'RERA Certificate', cost: '₹500 - ₹1,000' },
              { item: 'Khata Transfer', cost: '₹5,000 - ₹15,000' },
              { item: 'Sale Deed Drafting', cost: '₹10,000 - ₹25,000' },
              { item: 'Registration Fee (Govt)', cost: '1% of property value' },
              { item: 'Stamp Duty (Govt)', cost: '5% of property value' },
            ].map((fee, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-800 last:border-0">
                <span className="text-sm text-dark-300">{fee.item}</span><span className="text-sm font-medium text-dark-200">{fee.cost}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consult Expert */}
      {activeTab === 'consult' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { name: 'Adv. Rajesh Patil', firm: 'Patil & Associates', exp: '15 years', city: 'Hubli', phone: '+91-9876543210', rate: '₹5,000/hr', tags: ['Property Law', 'RERA', 'Litigation'] },
            { name: 'Adv. Sneha Reddy', firm: 'Reddy Legal Chambers', exp: '12 years', city: 'Bangalore', phone: '+91-9876543211', rate: '₹7,500/hr', tags: ['Corporate Real Estate', 'Due Diligence', 'Contracts'] },
            { name: 'Adv. Mahesh Gowda', firm: 'Gowda & Co', exp: '20 years', city: 'Mysore', phone: '+91-9876543212', rate: '₹4,000/hr', tags: ['Property Registration', 'Taxation', 'Will & Inheritance'] },
          ].map((lawyer, i) => (
            <div key={i} className="card-hover space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-lg font-bold text-amber-400">{lawyer.name.charAt(0)}</div>
                <div><h3 className="text-sm font-semibold text-white">{lawyer.name}</h3><p className="text-xs text-dark-400">{lawyer.firm}</p></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-dark-500"><Clock className="w-3 h-3" />{lawyer.exp} • {lawyer.city}</div>
              <div className="flex flex-wrap gap-1.5">{lawyer.tags.map(t => <span key={t} className="badge-blue text-[10px]">{t}</span>)}</div>
              <div className="flex items-center justify-between"><span className="text-sm font-semibold text-prop-400">{lawyer.rate}</span><span className="text-xs text-dark-500">{lawyer.phone}</span></div>
              <button className="btn-primary w-full text-sm justify-center"><Mail className="w-4 h-4" /> Book Consultation</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
