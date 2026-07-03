'use client';

import { useState, useEffect, useMemo } from 'react';
import { JOBS, Job } from '@/lib/jobs';
import { parseResume, matchJobs, ParsedResume } from '@/lib/resume';
import { useStore, Application } from '@/lib/store';
import { Briefcase, Upload, FileText, Search, Send, BarChart3, ExternalLink, Mail, Linkedin, CheckCircle2, Clock, Award, TrendingUp, Target, CheckCircle, XCircle, Loader2, Copy, Share2 } from 'lucide-react';

const ROLES = ['All', 'Frontend Developer', 'React Developer', 'ReactJS', 'Next.js Developer', 'UI Developer', 'UX Designer', 'UI/UX Designer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Data Analyst', 'DevOps Engineer', 'Product Manager', 'Mobile Developer', 'ML Engineer', 'Cloud Architect', 'Software Engineer', 'SRE', 'QA Engineer', 'Graphic Designer', 'Technical Lead', 'Business Analyst', 'Sales Executive', 'Marketing Manager', 'HR Manager', 'Content Writer'];
const INDUSTRIES = ['All', 'Technology', 'Finance', 'E-commerce', 'Healthcare', 'FMCG', 'Fintech', 'Consulting', 'Media', 'Education', 'Energy', 'Manufacturing'];

export default function Home() {
  const { resume, applications, setResume, addApplication, updateApplication, loadState } = useStore();
  const [tab, setTab] = useState<'upload' | 'jobs' | 'analytics'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [promptSearch, setPromptSearch] = useState('');
  const [promptMatches, setPromptMatches] = useState<number[]>([]);
  const [promptSearching, setPromptSearching] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'score' | 'salary'>('score');
  const [page, setPage] = useState(1);
  const [minSalary, setMinSalary] = useState(0);
  const [applying, setApplying] = useState<number | null>(null);
  const [showApplyModal, setShowApplyModal] = useState<Job | null>(null);
  const [copied, setCopied] = useState(false);
  // Shuffle jobs on each page load for fresh results
  const [shuffledJobs] = useState(() => {
    const arr = [...JOBS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  useEffect(() => { loadState(); }, []);

  const matchedJobs = useMemo(() => {
    if (!resume && !promptMatches.length) return [];
    let base = resume ? matchJobs(resume, shuffledJobs) : shuffledJobs.map((j) => ({ job: j, score: 50, matchedSkills: [] }));
    let filtered = base.filter((m) => {
      // Filter by prompt matches if active
      if (promptMatches.length > 0 && !promptMatches.includes(m.job.id)) return false;
      if (roleFilter !== 'All' && !m.job.role.includes(roleFilter)) return false;
      if (industryFilter !== 'All' && m.job.industry !== industryFilter) return false;
      if (minSalary > 0) {
        const m2 = m.job.salary.match(/₹(\d+)/);
        const sal = m2 ? parseInt(m2[1]) : 0;
        if (sal < minSalary) return false;
      }
      if (searchQuery) {
        const sq = searchQuery.toLowerCase();
        return m.job.title.toLowerCase().includes(sq) || m.job.company.toLowerCase().includes(sq) || m.job.skills.some((s) => s.toLowerCase().includes(sq));
      }
      return true;
    });
    if (sortBy === 'salary') {
      filtered.sort((a, b) => parseSalary(b.job.salary) - parseSalary(a.job.salary));
    }
    return filtered;
  }, [resume, roleFilter, industryFilter, searchQuery, sortBy, promptMatches]);

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(matchedJobs.length / PAGE_SIZE));
  const paginatedJobs = matchedJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const appliedJobs = applications.filter((a) => a.status === 'applied' || a.status === 'referred');
  const roleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    applications.forEach((a) => { stats[a.role] = (stats[a.role] || 0) + 1; });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [applications]);

  function handleUpload() {
    const parsed = parseResume(resumeText);
    setResume(parsed, resumeText);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setResumeText(text);
      const parsed = parseResume(text);
      setResume(parsed, text);
    };
    reader.readAsText(file);
  }

  function handleApply(job: Job) {
    setShowApplyModal(job);
  }

  function confirmApply() {
    if (!showApplyModal) return;
    addApplication({
      jobId: showApplyModal.id, title: showApplyModal.title, company: showApplyModal.company, role: showApplyModal.role,
      appliedAt: new Date().toISOString(), status: 'applied', salary: showApplyModal.salary,
      referrerName: showApplyModal.hrName, referrerEmail: showApplyModal.hrEmail,
    });
    setShowApplyModal(null);
  }

  function handleReferral(job: Job) {
    const message = encodeURIComponent(job.linkedinReferralMessage);
    window.open(job.linkedinManagerUrl, '_blank');
    setTimeout(() => {
      navigator.clipboard.writeText(job.linkedinReferralMessage).then(() => setCopied(true));
    }, 1000);
  }

  function parseSalary(s: string): number {
    const m = s.match(/₹(\d+)/);
    return m ? parseInt(m[1]) : 0;
  }

  function handlePromptSearch() {
    if (!promptSearch.trim()) return;
    setPromptSearching(true);
    const words = promptSearch.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const scored = JOBS.map((job) => {
      const searchable = `${job.title} ${job.company} ${job.role} ${job.description} ${job.skills.join(' ')} ${job.industry} ${job.location} ${job.type}`.toLowerCase();
      let score = 0;
      for (const word of words) {
        if (searchable.includes(word)) {
          score += 1;
          // Bonus for matching in title, skills, or company
          if (job.title.toLowerCase().includes(word)) score += 2;
          if (job.skills.some((s) => s.toLowerCase().includes(word))) score += 2;
          if (job.company.toLowerCase().includes(word)) score += 1;
          if (job.industry.toLowerCase().includes(word)) score += 1;
        }
      }
      // Bonus for matching multiple words
      const matchRatio = words.length > 0 ? words.filter((w) => searchable.includes(w)).length / words.length : 0;
      score += matchRatio * 5;
      return { id: job.id, score };
    });

    const topIds = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 50).map((s) => s.id);
    setPromptMatches(topIds);
    setPromptSearching(false);
  }

  const totalSalary = applications.reduce((sum, a) => sum + parseSalary(a.salary), 0) * 100000;

  if (tab === 'upload') {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col">
        <nav className="border-b border-dark-500/50 bg-dark-900/80 sticky top-0 z-50"><div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3"><Briefcase className="w-5 h-5 text-primary-400" /><span className="font-bold text-white">JobFinder AI</span><span className="text-xs text-gray-600 ml-auto">AI-powered job matching</span></div></nav>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full space-y-6">
            <div className="text-center mb-4"><h1 className="text-3xl font-bold text-white mb-2">Find Jobs Matching Your Resume</h1><p className="text-gray-400">Upload your resume and our AI will find the best job matches from 200+ opportunities</p></div>
            <div className="card-glow"><h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-primary-400" />Upload Resume</h3>
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-dark-400 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors bg-dark-800/50" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => { const t = ev.target?.result as string; setResumeText(t); const p = parseResume(t); setResume(p, t); }; r.readAsText(f); }}}>
                  <input type="file" accept=".txt,.doc,.docx,.pdf" className="hidden" onChange={handleFileUpload} />
                  <FileText className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-400">Drop your resume (.txt, .docx) or click to browse</span>
                </label>
                <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} className="input-field min-h-[120px] resize-y text-sm font-mono" placeholder="Or paste your resume text here...&#10;Name: John Doe&#10;Email: john@example.com&#10;Skills: React, Python, AWS..." />
                <button onClick={handleUpload} disabled={!resumeText.trim()} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"><Search className="w-4 h-4" />Find Matching Jobs</button>
              </div>
            </div>
            {resume && (<div className="card"><h3 className="font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Resume Parsed</h3><div className="grid grid-cols-2 gap-3 text-sm"><div><span className="text-gray-500">Name:</span><p className="text-white">{resume.name}</p></div><div><span className="text-gray-500">Email:</span><p className="text-white">{resume.email}</p></div><div><span className="text-gray-500">Experience:</span><p className="text-white">{resume.experience}</p></div><div><span className="text-gray-500">Skills found:</span><p className="text-primary-400">{resume.skills.length}</p></div></div>{resume.skills.length > 0 && (<div className="flex flex-wrap gap-1.5 mt-3">{resume.skills.map((s) => <span key={s} className="badge-blue text-[10px]">{s}</span>)}</div>)}<button onClick={() => setTab('jobs')} className="btn-primary w-full mt-4"><Search className="w-4 h-4 inline mr-1" />View {matchJobs(resume, JOBS).filter(m => m.score > 0).length} Matching Jobs</button></div>)}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">&larr; Previous</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 7) {
                  if (page > 4) p = page - 4 + i;
                  if (p > totalPages - 3) p = totalPages - 6 + i;
                  if (p < 1) p = 1;
                }
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Next &rarr;</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'jobs') {
    return (
      <div className="min-h-screen bg-dark-900">
        <nav className="border-b border-dark-500/50 bg-dark-900/80 sticky top-0 z-50"><div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-primary-400" /><span className="font-bold text-white">JobFinder AI</span>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setTab('upload')} className="btn-secondary text-xs py-1.5 px-3">Upload</button>
            <button onClick={() => setTab('jobs')} className="btn-primary text-xs py-1.5 px-3">Jobs <span className="text-primary-200 ml-1">({matchedJobs.length})</span></button>
            <button onClick={() => setTab('analytics')} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><BarChart3 className="w-3 h-3" />Analytics</button>
          </div></div></nav>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Prompt Search - natural language job search */}
          <div className="card mb-4 border-primary-500/30 bg-gradient-to-br from-primary-600/5 to-transparent">
            <div className="flex items-center gap-2 mb-2"><Search className="w-4 h-4 text-primary-400" /><span className="text-sm font-medium text-white">AI Prompt Search</span><span className="text-[10px] text-gray-500">Describe the job you want in plain English</span></div>
            <div className="flex gap-2">
              <textarea value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} className="input-field flex-1 text-sm min-h-[50px] resize-none" placeholder='e.g. "remote Python jobs in fintech paying over 30 LPA" or "frontend React roles in Bangalore"' onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePromptSearch(); } }} />
              <button onClick={handlePromptSearch} disabled={!promptSearch.trim() || promptSearching} className="btn-primary px-4 flex items-center gap-2 self-end h-[42px]">
                {promptSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
            {promptMatches.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="badge-green text-[10px]">{promptMatches.length} matches</span>
                <button onClick={() => { setPromptMatches([]); setPromptSearch(""); }} className="text-[10px] text-gray-500 hover:text-white">Clear</button>
              </div>
            )}
          </div>
          {/* Filters */}
          <div className="card mb-6"><div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]"><label className="text-xs text-gray-500 mb-1 block">Search</label><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field text-sm" placeholder="Search jobs..." /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Role</label><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field text-sm w-40">{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Industry</label><select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="input-field text-sm w-36">{INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Min Salary</label>
              <select value={minSalary} onChange={(e) => setMinSalary(parseInt(e.target.value))} className="input-field text-sm w-28">
                <option value="0">Any</option>
                <option value="20">20 LPA+</option>
                <option value="30">30 LPA+</option>
                <option value="40">40 LPA+</option>
                <option value="50">50 LPA+</option>
                <option value="60">60 LPA+</option>
                <option value="80">80 LPA+</option>
                <option value="100">1 Cr+</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Sort by</label><select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="input-field text-sm w-28"><option value="score">Best Match</option><option value="salary">Highest Pay</option></select></div>
          </div></div>
          {/* Pagination info */}
          {matchedJobs.length > 0 && (
            <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
              <span>Showing <strong className="text-white">{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, matchedJobs.length)}</strong> of <strong className="text-white">{matchedJobs.length}</strong> jobs</span>
              <span className="text-gray-600">Page {page} of {totalPages}</span>
            </div>
          )}
          {/* Stats bar */}
          {resume && (<div className="flex items-center gap-4 mb-4 text-xs text-gray-500"><Award className="w-3 h-3 text-yellow-400" /> Matched: <strong className="text-white">{matchedJobs.filter(m => m.score > 0).length}</strong> jobs · {appliedJobs.length} applied</div>)}
          {/* Job Cards */}
          <div className="space-y-3">
            {paginatedJobs.length === 0 && <div className="card text-center py-12"><Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No matching jobs found. Upload your resume for better matches.</p></div>}
            {paginatedJobs.map(({ job, score, matchedSkills }) => {
              const applied = applications.find((a) => a.jobId === job.id);
              return (<div key={job.id} className={`card-glow ${applied ? 'border-emerald-500/20' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-white truncate">{job.title}</h3>
                      <span className={`badge ${score >= 80 ? 'badge-green' : score >= 50 ? 'badge-yellow' : 'badge-blue'} text-[10px]`}>{score}% match</span>
                      {applied && <span className="badge-green text-[10px]"><CheckCircle2 className="w-3 h-3 inline mr-0.5" />Applied</span>}
                    </div>
                    <p className="text-sm text-gray-400">{job.company} · {job.location} · {job.type}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-medium text-primary-400">{job.salary}</span>
                      <span className="text-xs text-gray-600">· {job.experience}</span>
                      <span className="badge-purple text-[10px]">{job.industry}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{job.description}</p>
                    {matchedSkills.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{matchedSkills.map((s) => <span key={s} className="bg-primary-600/15 text-primary-300 text-[10px] px-1.5 py-0.5 rounded border border-primary-500/20">{s}</span>)}</div>)}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-600">
                      <span>👤 {job.hrName}</span>
                      <span>· 📧 {job.hrEmail}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!applied && <button onClick={() => handleApply(job)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"><Send className="w-3 h-3" />Apply</button>}
                    <button onClick={() => handleReferral(job)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><Linkedin className="w-3 h-3" />Referral</button>
                    <a href={job.applyUrl} target="_blank" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><ExternalLink className="w-3 h-3" />Job Page</a>
                  </div>
                </div>
              </div>);
            })}
          </div>
        </div>
        {/* Apply Modal */}
        {showApplyModal && (<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowApplyModal(null)}>
          <div className="bg-dark-700 rounded-2xl border border-dark-500 max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Application</h3>
            <p className="text-sm text-gray-400 mb-4">Apply for <strong className="text-white">{showApplyModal.title}</strong> at <strong className="text-white">{showApplyModal.company}</strong></p>
            <div className="space-y-2 text-sm mb-4"><div className="flex justify-between"><span className="text-gray-500">Salary:</span><span className="text-primary-400">{showApplyModal.salary}</span></div><div className="flex justify-between"><span className="text-gray-500">HR:</span><span>{showApplyModal.hrName}</span></div><div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="text-blue-400">{showApplyModal.hrEmail}</span></div><div className="flex justify-between"><span className="text-gray-500">LinkedIn:</span><a href={showApplyModal.linkedinManagerUrl} target="_blank" className="text-blue-400 truncate max-w-[200px]">Profile</a></div></div>
            <div className="bg-dark-800 rounded-lg p-3 text-xs text-gray-400 mb-4"><p className="font-medium text-gray-300 mb-1">📋 Referral message to {showApplyModal.hrName}:</p><p className="italic">{showApplyModal.linkedinReferralMessage}</p></div>
            <div className="flex gap-3"><button onClick={confirmApply} className="btn-primary flex-1 flex items-center justify-center gap-2"><Send className="w-4 h-4" />Confirm Apply</button><button onClick={() => { navigator.clipboard.writeText(showApplyModal.linkedinReferralMessage); setCopied(true); }} className="btn-secondary flex items-center gap-2"><Copy className="w-3 h-3" />{copied ? 'Copied!' : 'Copy Msg'}</button></div>
          </div></div>)}
      </div>
    );
  }

  // Analytics Tab
  const appCount = applications.length;
  const referredCount = applications.filter(a => a.status === 'referred' || a.status === 'applied').length;
  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="border-b border-dark-500/50 bg-dark-900/80 sticky top-0 z-50"><div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-primary-400" /><span className="font-bold text-white">JobFinder AI</span>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setTab('upload')} className="btn-secondary text-xs py-1.5 px-3">Upload</button>
          <button onClick={() => setTab('jobs')} className="btn-secondary text-xs py-1.5 px-3">Jobs</button>
          <button onClick={() => setTab('analytics')} className="btn-primary text-xs py-1.5 px-3"><BarChart3 className="w-3 h-3 inline mr-1" />Analytics</button>
        </div></div></nav>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-2xl font-bold text-white">Application Analytics</h2>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center"><Briefcase className="w-8 h-8 text-primary-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{appCount}</p><p className="text-xs text-gray-500">Jobs Applied</p></div>
          <div className="card text-center"><Send className="w-8 h-8 text-blue-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{referredCount}</p><p className="text-xs text-gray-500">Referred</p></div>
          <div className="card text-center"><Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{roleStats.length}</p><p className="text-xs text-gray-500">Roles Targeted</p></div>
          <div className="card text-center"><TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{totalSalary > 0 ? `₹${(totalSalary / 10000000).toFixed(1)}Cr+` : '₹0'}</p><p className="text-xs text-gray-500">Total Salary Value</p></div>
        </div>
        {/* Bar Chart - Roles Applied */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary-400" /> Applications by Role</h3>
          {roleStats.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No applications yet. Start applying to see analytics.</p> : (
            <div className="space-y-3">
              {roleStats.map(([role, count]) => {
                const max = roleStats[0][1];
                const pct = (count / max) * 100;
                return (<div key={role}><div className="flex items-center justify-between text-sm mb-1"><span className="text-gray-300 truncate">{role}</span><span className="text-primary-400 font-medium">{count}</span></div>
                  <div className="h-5 bg-dark-600 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all" style={{ width: `${pct}%` }} /></div></div>);
              })}
            </div>
          )}
        </div>
        {/* Company Distribution */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" /> Companies Applied To</h3>
          <div className="flex flex-wrap gap-2">
            {[...new Set(applications.map(a => a.company))].map((c) => <span key={c} className="badge-blue text-xs">{c}</span>)}
            {appCount === 0 && <p className="text-gray-500 text-sm">No applications yet</p>}
          </div>
        </div>
        {/* Application Timeline */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Recent Applications</h3>
          {applications.slice(-10).reverse().map((app) => (
            <div key={app.jobId} className="flex items-center gap-3 py-2 border-b border-dark-500/50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center"><Briefcase className="w-4 h-4 text-primary-400" /></div>
              <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{app.title}</p><p className="text-xs text-gray-500">{app.company} · {new Date(app.appliedAt).toLocaleDateString()}</p></div>
              <span className={`badge ${app.status === 'applied' ? 'badge-green' : app.status === 'referred' ? 'badge-blue' : 'badge-yellow'} text-[10px]`}>{app.status}</span>
            </div>
          ))}
          {appCount === 0 && <p className="text-gray-500 text-sm py-4 text-center">No applications yet</p>}
        </div>
      </div>
    </div>
  );
}
