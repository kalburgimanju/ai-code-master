'use client';
import { useState, useEffect } from 'react';
import {
  Store,
  Eye,
  Code,
  Edit3,
  Trash2,
  X,
  Copy,
  Check,
  Download,
  Loader2,
  Plus,
  Search,
  LayoutGrid,
  Globe,
  Smartphone,
  ShoppingCart,
  Palette,
  BarChart3,
  Briefcase,
} from 'lucide-react';
import { getItem, setItem, generateId } from '@/lib/storage';

interface PortfolioProject {
  id: string;
  name: string;
  category: string;
  html: string;
  createdAt: string;
}

type CategoryKey = 'all' | 'landing' | 'portfolio' | 'saas' | 'ecommerce' | 'blog' | 'other';

const categories: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: LayoutGrid },
  { key: 'landing', label: 'Landing Page', icon: Globe },
  { key: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { key: 'saas', label: 'SaaS / App', icon: BarChart3 },
  { key: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
  { key: 'blog', label: 'Blog', icon: Palette },
  { key: 'other', label: 'Other', icon: Smartphone },
];

const STORAGE_KEY = 'marketplace_projects';

const sampleProjects: PortfolioProject[] = [
  {
    id: 'demo1',
    name: 'FinPlanner',
    category: 'saas',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FinPlanner</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0a;color:#fff}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(135deg,#0a0a0a,#1a1a2e,#16213e);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%);top:-200px;right:-200px}
.hero-content{position:relative;z-index:1;max-width:800px;padding:2rem}
.badge{display:inline-block;padding:6px 16px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);border-radius:9999px;font-size:.75rem;color:#818cf8;margin-bottom:1.5rem}
h1{font-size:3.5rem;font-weight:800;line-height:1.1;margin-bottom:1.5rem;background:linear-gradient(135deg,#fff,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.subtitle{font-size:1.25rem;color:#94a3b8;margin-bottom:2.5rem;max-width:600px;margin-left:auto;margin-right:auto}
.cta-group{display:flex;gap:1rem;justify-content:center}
.btn-primary{padding:14px 32px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.4)}
.btn-secondary{padding:14px 32px;background:rgba(255,255,255,.05);color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s}
.btn-secondary:hover{background:rgba(255,255,255,.1)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;max-width:900px;margin:4rem auto 0;padding:2rem}
.stat{text-align:center}
.stat-value{font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,#6366f1,#22c55e);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-label{font-size:.875rem;color:#64748b;margin-top:.25rem}
.features{padding:6rem 2rem;max-width:1200px;margin:0 auto}
.features h2{text-align:center;font-size:2.5rem;font-weight:700;margin-bottom:3rem}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
.feature-card{padding:2rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:all .3s}
.feature-card:hover{border-color:rgba(99,102,241,.3);transform:translateY(-4px)}
.feature-icon{width:48px;height:48px;background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(34,197,94,.2));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1rem}
.feature-card h3{font-size:1.25rem;font-weight:600;margin-bottom:.5rem}
.feature-card p{color:#94a3b8;font-size:.9rem;line-height:1.6}
.gallery{padding:6rem 2rem;max-width:1200px;margin:0 auto}
.gallery h2{text-align:center;font-size:2.5rem;font-weight:700;margin-bottom:3rem}
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.gallery-item{border-radius:16px;overflow:hidden;aspect-ratio:4/3;position:relative;cursor:pointer}
.gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.gallery-item:hover img{transform:scale(1.1)}
.gallery-item::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)}
</style>
</head>
<body>
<section class="hero">
<div class="hero-content">
<div class="badge">🚀 Introducing FinPlanner 2.0</div>
<h1>Build Your Financial Future with AI</h1>
<p class="subtitle">Smart financial planning, real estate insights, and AI-powered investment advice — all in one platform.</p>
<div class="cta-group">
<button class="btn-primary">Get Started Free →</button>
<button class="btn-secondary">Watch Demo</button>
</div>
<div class="stats">
<div class="stat"><div class="stat-value">10K+</div><div class="stat-label">Active Users</div></div>
<div class="stat"><div class="stat-value">₹50Cr+</div><div class="stat-label">Assets Tracked</div></div>
<div class="stat"><div class="stat-value">98%</div><div class="stat-label">Satisfaction</div></div>
<div class="stat"><div class="stat-value">24/7</div><div class="stat-label">AI Support</div></div>
</div>
</div>
</section>
<section class="features">
<h2>Why Choose FinPlanner</h2>
<div class="features-grid">
<div class="feature-card"><div class="feature-icon">📊</div><h3>Smart Analytics</h3><p>Real-time market data and predictive analytics for informed decisions.</p></div>
<div class="feature-card"><div class="feature-icon">🤖</div><h3>AI Advisors</h3><p>Get personalized advice from our AI-powered financial advisors.</p></div>
<div class="feature-card"><div class="feature-icon">🏠</div><h3>Property Insights</h3><p>Deep dive into real estate trends across Hubli, Bangalore & Mysore.</p></div>
<div class="feature-card"><div class="feature-icon">📈</div><h3>Investment Tracking</h3><p>Monitor your portfolio performance with beautiful dashboards.</p></div>
<div class="feature-card"><div class="feature-icon">🔒</div><h3>Bank-Grade Security</h3><p>Your financial data is encrypted and never shared with third parties.</p></div>
<div class="feature-card"><div class="feature-icon">💰</div><h3>EMI Calculator</h3><p>Plan your home loan with our advanced EMI and affordability tools.</p></div>
</div>
</section>
<section class="gallery">
<h2>Featured Properties</h2>
<div class="gallery-grid">
<div class="gallery-item"><img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" alt="Luxury Home"></div>
<div class="gallery-item"><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" alt="Modern Villa"></div>
<div class="gallery-item"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800" alt="Apartment"></div>
</div>
</section>
</body>
</html>`,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo2',
    name: 'Portfolio',
    category: 'portfolio',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0a;color:#fff}
.hero{min-height:100vh;display:flex;align-items:center;background:linear-gradient(135deg,#0f172a,#1e1b4b);padding:4rem}
.hero-content{max-width:600px}
.badge{display:inline-block;padding:6px 16px;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);border-radius:9999px;font-size:.75rem;color:#4ade80;margin-bottom:1.5rem}
h1{font-size:3rem;font-weight:800;line-height:1.1;margin-bottom:1rem}
h1 span{background:linear-gradient(135deg,#6366f1,#22c55e);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.subtitle{font-size:1.1rem;color:#94a3b8;margin-bottom:2rem;line-height:1.7}
.btn{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.4)}
.hero-image{position:absolute;right:10%;top:50%;transform:translateY(-50%);width:400px;height:500px;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.hero-image img{width:100%;height:100%;object-fit:cover}
.projects{padding:6rem 2rem;max-width:1200px;margin:0 auto}
.projects h2{font-size:2.5rem;font-weight:700;margin-bottom:3rem}
.project-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2rem}
.project-card{border-radius:20px;overflow:hidden;background:#1e293b;border:1px solid rgba(255,255,255,.06);transition:all .3s}
.project-card:hover{transform:translateY(-8px);box-shadow:0 20px 60px rgba(0,0,0,.4)}
.project-card img{width:100%;height:250px;object-fit:cover}
.project-info{padding:1.5rem}
.project-info h3{font-size:1.25rem;font-weight:600;margin-bottom:.5rem}
.project-info p{color:#94a3b8;font-size:.9rem;margin-bottom:1rem}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{padding:4px 12px;background:rgba(99,102,241,.15);border-radius:8px;font-size:.75rem;color:#818cf8}
.contact{padding:6rem 2rem;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(34,197,94,.1))}
.contact h2{font-size:2.5rem;font-weight:700;margin-bottom:1rem}
.contact p{color:#94a3b8;margin-bottom:2rem}
</style>
</head>
<body>
<section class="hero">
<div class="hero-content">
<div class="badge">👋 Welcome to my portfolio</div>
<h1>Hi, I'm <span>Alex Chen</span></h1>
<p class="subtitle">A full-stack developer passionate about creating beautiful, functional digital experiences. Specializing in React, Next.js, and modern web technologies.</p>
<button class="btn">View My Work →</button>
</div>
<div class="hero-image"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600" alt="Profile"></div>
</section>
<section class="projects">
<h2>Featured Projects</h2>
<div class="project-grid">
<div class="project-card"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" alt="Project 1"><div class="project-info"><h3>E-Commerce Platform</h3><p>A full-stack e-commerce solution with real-time inventory management.</p><div class="tags"><span class="tag">React</span><span class="tag">Node.js</span><span class="tag">MongoDB</span></div></div></div>
<div class="project-card"><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" alt="Project 2"><div class="project-info"><h3>Analytics Dashboard</h3><p>Real-time analytics dashboard with interactive charts and reports.</p><div class="tags"><span class="tag">Next.js</span><span class="tag">D3.js</span><span class="tag">PostgreSQL</span></div></div></div>
</div>
</section>
<section class="contact">
<h2>Let's Work Together</h2>
<p>Have a project in mind? Let's discuss how I can help.</p>
<button class="btn">Get In Touch →</button>
</section>
</body>
</html>`,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo3',
    name: 'CloudSync',
    category: 'landing',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CloudSync</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0a;color:#fff}
.hero{min-height:100vh;display:flex;align-items:center;text-align:center;justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#0c0a2a 50%,#1a0a2e 100%);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;width:800px;height:800px;background:radial-gradient(circle,rgba(56,189,248,.08) 0%,transparent 70%);top:-300px;left:50%;transform:translateX(-50%)}
.hero-content{position:relative;z-index:1;max-width:700px;padding:2rem}
h1{font-size:3.5rem;font-weight:800;line-height:1.1;margin-bottom:1.5rem}
h1 span{background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.subtitle{font-size:1.15rem;color:#94a3b8;margin-bottom:2.5rem;line-height:1.7}
.cta-group{display:flex;gap:1rem;justify-content:center}
.btn{padding:14px 32px;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s;border:none}
.btn-primary{background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(14,165,233,.4)}
.btn-ghost{background:transparent;color:#94a3b8;border:1px solid rgba(255,255,255,.1)}
.btn-ghost:hover{background:rgba(255,255,255,.05);color:#fff}
.pricing{padding:6rem 2rem;max-width:1000px;margin:0 auto}
.pricing h2{text-align:center;font-size:2.5rem;font-weight:700;margin-bottom:1rem}
.pricing .sub{text-align:center;color:#94a3b8;margin-bottom:3rem}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.price-card{padding:2rem;border-radius:20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);transition:all .3s}
.price-card.featured{border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.05)}
.price-card:hover{transform:translateY(-4px)}
.price-card h3{font-size:1.1rem;font-weight:600;margin-bottom:.5rem}
.price{font-size:2.5rem;font-weight:800;margin:1rem 0}
.price span{font-size:.9rem;font-weight:400;color:#64748b}
.price-card ul{list-style:none;margin:1.5rem 0}
.price-card li{padding:.5rem 0;color:#94a3b8;font-size:.9rem;border-bottom:1px solid rgba(255,255,255,.04)}
.price-card li::before{content:'✓ ';color:#22c55e}
.price-card .btn{width:100%;margin-top:1rem}
</style>
</head>
<body>
<section class="hero">
<div class="hero-content">
<h1>Sync Everything<br><span>in the Cloud</span></h1>
<p class="subtitle">CloudSync makes it easy to store, share, and collaborate on files from anywhere. Enterprise-grade security with consumer-level simplicity.</p>
<div class="cta-group">
<button class="btn btn-primary">Start Free Trial</button>
<button class="btn btn-ghost">Learn More</button>
</div>
</div>
</section>
<section class="pricing">
<h2>Simple Pricing</h2>
<p class="sub">No hidden fees. Cancel anytime.</p>
<div class="pricing-grid">
<div class="price-card"><h3>Starter</h3><p style="color:#94a3b8;font-size:.85rem">For individuals</p><div class="price">Free</div><ul><li>5GB Storage</li><li>Basic Sync</li><li>1 Device</li></ul><button class="btn btn-ghost">Get Started</button></div>
<div class="price-card featured"><h3>Pro</h3><p style="color:#94a3b8;font-size:.85rem">For professionals</p><div class="price">₹499<span>/mo</span></div><ul><li>100GB Storage</li><li>Advanced Sync</li><li>Unlimited Devices</li><li>Priority Support</li></ul><button class="btn btn-primary">Start Free Trial</button></div>
<div class="price-card"><h3>Team</h3><p style="color:#94a3b8;font-size:.85rem">For teams</p><div class="price">₹999<span>/mo</span></div><ul><li>1TB Storage</li><li>Admin Dashboard</li><li>Unlimited Devices</li><li>Dedicated Support</li></ul><button class="btn btn-ghost">Contact Sales</button></div>
</div>
</section>
</body>
</html>`,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

function detectCategory(title: string): CategoryKey {
  const t = title.toLowerCase();
  if (t.includes('portfolio') || t.includes('developer') || t.includes('personal')) return 'portfolio';
  if (t.includes('shop') || t.includes('store') || t.includes('ecommerce') || t.includes('commerce')) return 'ecommerce';
  if (t.includes('saas') || t.includes('app') || t.includes('dashboard') || t.includes('platform')) return 'saas';
  if (t.includes('blog') || t.includes('news') || t.includes('article')) return 'blog';
  if (t.includes('landing') || t.includes('product') || t.includes('brand')) return 'landing';
  return 'other';
}

export default function MarketplacePage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryKey>('other');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'create'>('grid');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [editProject, setEditProject] = useState<PortfolioProject | null>(null);
  const [previewProject, setPreviewProject] = useState<PortfolioProject | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = getItem<PortfolioProject[]>(STORAGE_KEY, []);
    setProjects(saved.length > 0 ? saved : sampleProjects);
  }, []);

  const save = (updated: PortfolioProject[]) => {
    setProjects(updated);
    setItem(STORAGE_KEY, updated);
  };

  const filteredProjects = projects.filter(p => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categoryCounts = (cat: CategoryKey) => {
    if (cat === 'all') return projects.length;
    return projects.filter(p => p.category === cat).length;
  };

  const generate = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);

    try {
      const settings = getItem('settings', { openRouterKey: '' });
      const apiKey = settings.openRouterKey;

      if (!apiKey) {
        throw new Error('Please set your OpenRouter API key in Settings first.');
      }

      const systemPrompt = `You are an expert web developer. Generate a complete, professional website as a single HTML file.

RULES:
1. Generate ONLY valid HTML with inline <style> tags
2. Use the Inter font from Google Fonts
3. Use a dark theme (backgrounds #0a0a0a to #1e293b range)
4. Include hero section, features/about section, gallery/projects section, and footer
5. Use FREE images from Unsplash (use direct URLs like https://images.unsplash.com/photo-XXXXX?w=800)
6. Make it responsive and mobile-friendly
7. Use modern CSS (flexbox, grid, gradients, animations, backdrop-filter, border-radius)
8. Include realistic content based on the project title
9. Make it visually stunning with smooth transitions and hover effects
10. Return ONLY the HTML code, no explanations

Return ONLY the raw HTML starting with <!DOCTYPE html>. No markdown, no code fences.`;

      const res = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create a professional website for: "${title}"` },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      let html = data.choices?.[0]?.message?.content || '';

      html = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim();

      if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
        throw new Error('The AI did not return valid HTML. Please try again.');
      }

      const project: PortfolioProject = {
        id: generateId(),
        name: title.trim(),
        category,
        html,
        createdAt: new Date().toISOString(),
      };

      save([project, ...projects]);
      setTitle('');
      setCategory('other');
      setView('grid');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    save(projects.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
    if (editProject?.id === id) setEditProject(null);
  };

  const handleCopy = () => {
    if (selectedProject) {
      navigator.clipboard.writeText(selectedProject.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (p: PortfolioProject) => {
    const blob = new Blob([p.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.name.replace(/\s+/g, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-finance-400" /> Marketplace
          </h1>
          <p className="text-dark-400 text-sm mt-1">Browse projects by category or create a new one</p>
        </div>
        <button
          onClick={() => setView(view === 'grid' ? 'create' : 'grid')}
          className="btn-primary text-sm"
        >
          {view === 'grid' ? <><Plus className="w-4 h-4" /> New Project</> : <>← Back to Projects</>}
        </button>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects by title..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-900/80 border border-dark-800 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 bg-dark-900/80 border border-dark-800 rounded-xl p-1 mb-6 overflow-x-auto">
            {categories.map(cat => {
              const Icon = cat.icon;
              const count = categoryCounts(cat.key);
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat.key
                      ? 'bg-finance-600 text-white'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.key ? 'bg-white/20' : 'bg-dark-800'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Store className="w-16 h-16 text-dark-700 mb-4" />
              <h3 className="text-lg font-semibold text-dark-400">
                {search ? 'No matching projects' : 'No projects in this category'}
              </h3>
              <p className="text-sm text-dark-500 mt-2">
                {search ? 'Try a different search term' : 'Create your first project'}
              </p>
              <button onClick={() => setView('create')} className="btn-primary mt-4 text-sm">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(p => (
                <div key={p.id} className="bg-dark-900/80 border border-dark-800 rounded-2xl overflow-hidden hover:border-dark-700 transition-all group">
                  {/* Thumbnail */}
                  <div className="h-44 bg-dark-800 overflow-hidden relative">
                    <iframe
                      srcDoc={p.html}
                      className="w-full h-full border-0 pointer-events-none origin-top-left"
                      style={{ width: '200%', height: '200%', transform: 'scale(0.5)' }}
                      sandbox="allow-scripts"
                      title={p.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                      <button
                        onClick={() => setPreviewProject(p)}
                        className="px-3 py-1.5 bg-finance-600 hover:bg-finance-500 rounded-lg text-xs text-white font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => { setSelectedProject(p); setView('create'); }}
                        className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-200 font-medium flex items-center gap-1 border border-dark-700"
                      >
                        <Code className="w-3.5 h-3.5" /> Code
                      </button>
                      <button
                        onClick={() => { setEditProject(p); setView('create'); }}
                        className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-200 font-medium flex items-center gap-1 border border-dark-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 bg-dark-800 rounded-full text-dark-400 capitalize">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setPreviewProject(p)}
                        className="flex-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-[11px] text-dark-300 flex items-center justify-center gap-1 border border-dark-700"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button
                        onClick={() => handleDownload(p)}
                        className="flex-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-[11px] text-dark-300 flex items-center justify-center gap-1 border border-dark-700"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 bg-dark-800 hover:bg-red-500/10 rounded-lg text-[11px] text-dark-400 hover:text-red-400 border border-dark-700 hover:border-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create View */}
      {view === 'create' && (
        <>
          <div className="max-w-2xl mx-auto">
            <div className="bg-dark-900/80 border border-dark-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-2">What should we build?</h2>
              <p className="text-dark-400 text-sm mb-6">
                Enter a title, pick a category, and AI will generate a complete website with images.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value);
                      setCategory(detectCategory(e.target.value));
                    }}
                    onKeyDown={e => e.key === 'Enter' && generate()}
                    placeholder="e.g., CloudSync — Cloud Storage Platform"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all text-sm"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.key !== 'all').map(cat => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => setCategory(cat.key)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            category === cat.key
                              ? 'bg-finance-600/20 border-finance-500/50 text-finance-300'
                              : 'bg-dark-800 border-dark-700 text-dark-400 hover:text-dark-200 hover:border-dark-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={generate}
                  disabled={!title.trim() || loading}
                  className="w-full btn-primary justify-center text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating your website...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Generate Website</>
                  )}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-dark-800">
                <p className="text-[10px] text-dark-500 mb-3">Quick ideas:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'FinPlanner — Financial Planning App',
                    'CloudSync — Cloud Storage Platform',
                    'DevPortfolio — Developer Showcase',
                    'GreenLeaf — Eco-Friendly Store',
                    'TaskFlow — Project Management Tool',
                  ].map((idea, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTitle(idea);
                        setCategory(detectCategory(idea));
                      }}
                      className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-[11px] text-dark-300 hover:text-white hover:border-finance-500/50 transition-all"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Code / Edit View */}
          {(selectedProject || editProject) && (
            <div className="max-w-4xl mx-auto mt-6">
              <div className="bg-dark-900/80 border border-dark-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-finance-400" />
                    <span className="text-sm font-medium text-white">
                      {editProject ? `Editing: ${editProject.name}` : `Code: ${selectedProject?.name}`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {selectedProject && (
                      <button onClick={handleCopy} className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-300 flex items-center gap-1 border border-dark-700">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                    {selectedProject && (
                      <button onClick={() => setPreviewProject(selectedProject)} className="px-3 py-1.5 bg-finance-600 hover:bg-finance-500 rounded-lg text-xs text-white flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                    <button onClick={() => { setSelectedProject(null); setEditProject(null); }} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editProject ? (
                  <div className="h-[500px]">
                    <textarea
                      value={editProject.html}
                      onChange={e => {
                        const updated = { ...editProject, html: e.target.value };
                        setEditProject(updated);
                        const idx = projects.findIndex(p => p.id === editProject.id);
                        if (idx >= 0) {
                          const arr = [...projects];
                          arr[idx] = updated;
                          save(arr);
                        }
                      }}
                      className="w-full h-full p-4 bg-dark-950 text-dark-200 font-mono text-xs resize-none focus:outline-none"
                      spellCheck={false}
                    />
                  </div>
                ) : selectedProject ? (
                  <div className="h-[500px] overflow-auto">
                    <pre className="p-4 text-xs text-dark-200 font-mono whitespace-pre-wrap break-words">
                      <code>{selectedProject.html}</code>
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-finance-400" />
                <h3 className="text-sm font-semibold text-white">{previewProject.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(previewProject)} className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-300 flex items-center gap-1 border border-dark-700">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={() => setPreviewProject(null)} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={previewProject.html}
                className="w-full h-full border-0"
                title={previewProject.name}
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
