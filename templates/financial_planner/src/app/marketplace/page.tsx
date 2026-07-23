'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Store, Eye, Code, Edit3, Trash2, X, Copy, Check, Download,
  Loader2, Plus, Search, LayoutGrid, Globe, Smartphone,
  ShoppingCart, Palette, BarChart3, Briefcase, FileCode,
} from 'lucide-react';
import { getItem, setItem, generateId } from '@/lib/storage';

interface PortfolioProject {
  id: string;
  name: string;
  category: string;
  pages: Record<string, string>;
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

function detectCategory(title: string): CategoryKey {
  const t = title.toLowerCase();
  if (t.includes('portfolio') || t.includes('developer') || t.includes('personal')) return 'portfolio';
  if (t.includes('shop') || t.includes('store') || t.includes('ecommerce') || t.includes('commerce')) return 'ecommerce';
  if (t.includes('saas') || t.includes('app') || t.includes('dashboard') || t.includes('platform')) return 'saas';
  if (t.includes('blog') || t.includes('news') || t.includes('article')) return 'blog';
  if (t.includes('landing') || t.includes('product') || t.includes('brand')) return 'landing';
  return 'other';
}

// ---- Navigation bar builder (injected into every page) ----
function buildNavHTML(pageNames: string[], activePage: string): string {
  const links = pageNames
    .map(name => {
      const href = name.toLowerCase().replace(/\s+/g, '-');
      const active = href === activePage;
      return `<a href="#${href}" onclick="window.__switchPage('${href}');return false;" style="padding:0.5rem 1rem;border-radius:8px;font-size:0.875rem;font-weight:500;text-decoration:none;color:${active ? '#fff' : '#94a3b8'};${active ? 'background:rgba(99,102,241,0.3);' : ''}transition:all 0.2s;">${name}</a>`;
    })
    .join('\n              ');
  return `<nav style="position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;padding:0.75rem 2rem;background:rgba(10,10,10,0.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.06);font-family:'Inter',sans-serif;">
  <div style="font-size:1.1rem;font-weight:700;color:#fff;">${activePage.charAt(0).toUpperCase() + activePage.slice(1).replace(/-/g, ' ')}</div>
  <div style="display:flex;gap:0.25rem;align-items:center;">
              ${links}
  </div>
</nav>`;
}

// ---- Merges navigation into a raw HTML string ----
function injectNav(html: string, pageNames: string[], activePage: string): string {
  const nav = buildNavHTML(pageNames, activePage);
  // inject after <body> and add body padding-top
  let result = html.replace(/<body([^>]*)>/i, `<body$1 style="padding-top:3.5rem;">`);
  result = result.replace(/<\/body>/i, `${nav}\n</body>`);
  return result;
}

// ---- Migration: convert old single-html projects to multi-page ----
function migrateProject(p: any): PortfolioProject {
  if (p.pages) return p as PortfolioProject;
  const pageName = 'Home';
  return {
    id: p.id,
    name: p.name,
    category: p.category || 'other',
    pages: { [pageName]: p.html || '' },
    createdAt: p.createdAt,
  } as PortfolioProject;
}

// ---- Sample multi-page projects ----
function sampleProjects(): PortfolioProject[] {
  const navCSS = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0a;color:#fff;padding-top:3.5rem}
nav{position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;padding:0.75rem 2rem;background:rgba(10,10,10,0.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.06)}
nav .brand{font-size:1.1rem;font-weight:700;color:#fff}
nav a{padding:0.5rem 1rem;border-radius:8px;font-size:0.875rem;font-weight:500;text-decoration:none;color:#94a3b8;transition:all 0.2s}
nav a:hover,nav a.active{color:#fff;background:rgba(99,102,241,0.2)}
.hero{min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(135deg,#0a0a0a,#1a1a2e,#16213e);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%);top:-200px;right:-200px}
.hero-content{position:relative;z-index:1;max-width:800px;padding:2rem}
.badge{display:inline-block;padding:6px 16px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);border-radius:9999px;font-size:.75rem;color:#818cf8;margin-bottom:1.5rem}
h1{font-size:3.5rem;font-weight:800;line-height:1.1;margin-bottom:1.5rem;background:linear-gradient(135deg,#fff,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.subtitle{font-size:1.25rem;color:#94a3b8;margin-bottom:2.5rem;max-width:600px;margin-left:auto;margin-right:auto}
.btn-primary{padding:14px 32px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,.4)}
section{padding:5rem 2rem;max-width:1100px;margin:0 auto}
section h2{font-size:2.2rem;font-weight:700;margin-bottom:1rem;text-align:center}
section .sub{text-align:center;color:#94a3b8;margin-bottom:3rem}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:2rem}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.card{padding:2rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:all .3s}
.card:hover{border-color:rgba(99,102,241,.3);transform:translateY(-4px)}
.card h3{font-size:1.1rem;font-weight:600;margin-bottom:.5rem}
.card p{color:#94a3b8;font-size:.9rem;line-height:1.6}
.tag{display:inline-block;padding:4px 10px;background:rgba(99,102,241,.15);border-radius:8px;font-size:.7rem;color:#818cf8;margin-right:4px;margin-top:8px}
footer{text-align:center;padding:3rem 2rem;color:#475569;font-size:.85rem;border-top:1px solid rgba(255,255,255,0.06)}`;

  const home = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>FinPlanner</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${navCSS}</style></head><body>
<section class="hero"><div class="hero-content">
<div class="badge">🚀 Introducing FinPlanner 2.0</div>
<h1>Build Your Financial Future with AI</h1>
<p class="subtitle">Smart financial planning, real estate insights, and AI-powered investment advice — all in one platform.</p>
<button class="btn-primary">Get Started Free →</button>
</div></section>
<section><div class="grid3">
<div class="card"><h3>📊 Smart Analytics</h3><p>Real-time market data and predictive analytics for informed decisions.</p></div>
<div class="card"><h3>🤖 AI Advisors</h3><p>Get personalized advice from our AI-powered financial advisors.</p></div>
<div class="card"><h3>🏠 Property Insights</h3><p>Deep dive into real estate trends across Hubli, Bangalore & Mysore.</p></div>
</div></section>
<footer>© 2026 FinPlanner. All rights reserved.</footer></body></html>`;

  const about = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>About - FinPlanner</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${navCSS}</style></head><body>
<section><h2>About FinPlanner</h2><p class="sub">Building the future of financial technology</p>
<div class="grid2">
<div class="card"><h3>Our Mission</h3><p>We believe everyone deserves access to intelligent financial planning tools. FinPlanner combines AI with deep market expertise to help you make smarter investment decisions.</p></div>
<div class="card"><h3>Our Team</h3><p>A passionate team of fintech engineers, data scientists, and real estate experts based in Karnataka, India, dedicated to transforming how people manage their finances.</p></div>
</div></section>
<section><h2>Why Us</h2><p class="sub">Trusted by over 10,000 users across Karnataka</p>
<div class="grid3">
<div class="card"><h3>10K+ Users</h3><p>Active monthly users trust us with their financial planning needs.</p></div>
<div class="card"><h3>₹50Cr+ Tracked</h3><p>Total assets under our smart tracking and advisory platform.</p></div>
<div class="card"><h3>98% Satisfaction</h3><p>User satisfaction rating across all our services and tools.</p></div>
</div></section>
<footer>© 2026 FinPlanner. All rights reserved.</footer></body></html>`;

  const services = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Services - FinPlanner</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${navCSS}</style></head><body>
<section><h2>Our Services</h2><p class="sub">Everything you need to manage your finances and property investments</p>
<div class="grid2">
<div class="card"><h3>🏠 Property Analysis</h3><p>Get detailed ROI analysis, price trends, and neighborhood comparisons for properties in Hubli, Bangalore, and Mysore.</p><span class="tag">Real Estate</span><span class="tag">Analytics</span></div>
<div class="card"><h3>🤖 AI Financial Advisor</h3><p>Chat with our AI-powered advisor for personalized investment recommendations, tax-saving tips, and portfolio optimization.</p><span class="tag">AI</span><span class="tag">Finance</span></div>
<div class="card"><h3>💰 EMI Calculator</h3><p>Plan your home loan with our advanced EMI calculator that factors in interest rates, tenure, and prepayment options.</p><span class="tag">Calculator</span><span class="tag">Planning</span></div>
<div class="card"><h3>📈 Investment Tracking</h3><p>Monitor your mutual funds, stocks, FDs, and real estate investments in one unified dashboard.</p><span class="tag">Portfolio</span><span class="tag">Tracking</span></div>
</div></section>
<footer>© 2026 FinPlanner. All rights reserved.</footer></body></html>`;

  const contact = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Contact - FinPlanner</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${navCSS}
.form-group{margin-bottom:1.25rem}
.form-group label{display:block;font-size:0.85rem;font-weight:500;color:#94a3b8;margin-bottom:0.4rem}
.form-group input,.form-group textarea,.form-group select{width:100%;padding:0.75rem 1rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#fff;font-size:0.9rem;font-family:inherit;outline:none;transition:border 0.2s}
.form-group input:focus,.form-group textarea:focus{border-color:rgba(99,102,241,0.5)}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;max-width:900px;margin:0 auto}
.info-item{display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.5rem}
.info-icon{width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
</style></head><body>
<section><h2>Get In Touch</h2><p class="sub">Have a question? We'd love to hear from you.</p>
<div class="contact-grid">
<div>
<div class="info-item"><div class="info-icon">📍</div><div><h3 style="font-size:0.95rem;font-weight:600;margin-bottom:0.2rem">Office</h3><p style="color:#94a3b8;font-size:0.85rem">123 Tech Park, Hubli, Karnataka 580001</p></div></div>
<div class="info-item"><div class="info-icon">📧</div><div><h3 style="font-size:0.95rem;font-weight:600;margin-bottom:0.2rem">Email</h3><p style="color:#94a3b8;font-size:0.85rem">hello@finplanner.com</p></div></div>
<div class="info-item"><div class="info-icon">📞</div><div><h3 style="font-size:0.95rem;font-weight:600;margin-bottom:0.2rem">Phone</h3><p style="color:#94a3b8;font-size:0.85rem">+91 836 123 4567</p></div></div>
<div class="info-item"><div class="info-icon">⏰</div><div><h3 style="font-size:0.95rem;font-weight:600;margin-bottom:0.2rem">Hours</h3><p style="color:#94a3b8;font-size:0.85rem">Mon - Sat: 9:00 AM - 6:00 PM</p></div></div>
</div>
<div>
<div class="form-group"><label>Full Name</label><input type="text" placeholder="John Doe"></div>
<div class="form-group"><label>Email Address</label><input type="email" placeholder="john@example.com"></div>
<div class="form-group"><label>Subject</label><select><option>General Inquiry</option><option>Support</option><option>Partnership</option></select></div>
<div class="form-group"><label>Message</label><textarea rows="4" placeholder="Tell us how we can help..."></textarea></div>
<button class="btn-primary" style="width:100%;text-align:center;">Send Message</button>
</div>
</div></section>
<footer>© 2026 FinPlanner. All rights reserved.</footer></body></html>`;

  const pages = { Home: home, About: about, Services: services, Contact: contact };
  const pageNames = Object.keys(pages);
  const patchedPages: Record<string, string> = {};
  for (const [name, raw] of Object.entries(pages)) {
    patchedPages[name] = injectNav(raw, pageNames, name.toLowerCase().replace(/\s+/g, '-'));
  }

  return [
    { id: 'demo1', name: 'FinPlanner', category: 'saas', pages: patchedPages, createdAt: new Date().toISOString() },
  ];
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
  const [editPage, setEditPage] = useState('');
  const [previewProject, setPreviewProject] = useState<PortfolioProject | null>(null);
  const [previewPage, setPreviewPage] = useState('home');
  const [copied, setCopied] = useState(false);
  const [codeTab, setCodeTab] = useState('');

  useEffect(() => {
    const raw = getItem<any[]>(STORAGE_KEY, []);
    if (raw.length > 0) {
      setProjects(raw.map(migrateProject));
    } else {
      setProjects(sampleProjects());
    }
  }, []);

  const save = (updated: PortfolioProject[]) => {
    setProjects(updated);
    setItem(STORAGE_KEY, updated);
  };

  // Save project to web-templates/ folder on disk
  const saveToDisk = async (project: PortfolioProject, action: 'save' | 'delete' = 'save') => {
    try {
      await fetch('/api/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          pages: project.pages,
          action,
        }),
      });
    } catch (err) {
      console.warn('[Marketplace] Failed to save to disk:', err);
    }
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

  // ---- Generate multi-page site ----
  const generate = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);

    try {
      const settings = getItem('settings', { openRouterKey: '' });
      const apiKey = settings.openRouterKey;
      if (!apiKey) throw new Error('Please set your OpenRouter API key in Settings first.');

      const systemPrompt = `You are an expert web developer. Generate a complete, professional multi-page website.

Return a JSON object with a "pages" key containing an object with keys "Home", "About", "Services", "Contact". Each value is a full HTML document as a string.

Structure:
{"pages":{"Home":"<!DOCTYPE html>...","About":"<!DOCTYPE html>...","Services":"<!DOCTYPE html>...","Contact":"<!DOCTYPE html>..."}}

Rules:
1. Each page must be a complete HTML file with DOCTYPE, html, head, body tags
2. Include Inter font from Google Fonts in each page
3. Dark theme: backgrounds #0a0a0a to #1e293b
4. Use FREE images from Unsplash (direct URLs)
5. Responsive and mobile-friendly
6. Modern CSS: flexbox, grid, gradients, animations, border-radius
7. Realistic content relevant to the project
8. CRITICAL: Do NOT add a navigation bar. It will be injected automatically.
9. Make it visually stunning with smooth transitions and hover effects

Content for each page:
- Home: hero with title, subtitle, CTA button, then a features grid (3 cards)
- About: company mission, team info, values with icons
- Services: service cards with descriptions and tags
- Contact: contact form, office address, email, phone info

Return ONLY the JSON. No markdown fences, no explanations.`;

      const res = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          model: 'openai/gpt-4o-mini',
          max_tokens: 16000,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create a professional multi-page website for: "${title}". Return ONLY JSON with a "pages" object containing keys: Home, About, Services, Contact — each with a full HTML string value.` },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      let raw = data.choices?.[0]?.message?.content || '';
      const finishReason = data.choices?.[0]?.finish_reason;

      if (!raw || raw.trim().length === 0) {
        throw new Error('AI returned an empty response. Please try again.');
      }

      // Detect truncation
      if (finishReason === 'length') {
        throw new Error('Response was cut off (token limit). The AI generated too much content. Please try with a simpler project name.');
      }

      console.log('[Marketplace] Raw AI response length:', raw.length, 'finish_reason:', finishReason);

      // Strip markdown code fences
      raw = raw.replace(/```(?:json|html|javascript)?\s*\n?/gi, '').replace(/\n?```\s*$/g, '').trim();
      // Extract JSON from surrounding text
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        raw = raw.substring(firstBrace, lastBrace + 1);
      }

      // Strategy 1: Parse JSON directly
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Strategy 2: Try extracting the pages object specifically
        const pagesMatch = raw.match(/"pages"\s*:\s*\{([\s\S]*)\}\s*\}/);
        if (pagesMatch) {
          try { parsed = JSON.parse(`{${pagesMatch[0]}}`); } catch {}
        }
        // Strategy 3: Try finding any JSON-like block
        if (!parsed) {
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]); } catch {}
          }
        }
      }

      let pages: Record<string, string> = {};

      if (parsed && typeof parsed === 'object') {
        const rawPages: Record<string, string> = parsed.pages || parsed;
        if (rawPages && typeof rawPages === 'object') {
          const pageNames = Object.keys(rawPages);
          for (const [name, html] of Object.entries(rawPages)) {
            if (typeof html !== 'string') continue;
            const slug = name.toLowerCase().replace(/\s+/g, '-');
            pages[name] = injectNav(html, pageNames, slug);
          }
        }
      }

      // Strategy 4: If no pages, extract standalone HTML blocks
      if (Object.keys(pages).length === 0) {
        const htmlBlocks: string[] = [];
        const doctypeRegex = /<!DOCTYPE[^>]*>[\s\S]*?<\/html>/gi;
        let match;
        while ((match = doctypeRegex.exec(raw)) !== null) {
          htmlBlocks.push(match[0]);
        }
        if (htmlBlocks.length === 0) {
          const htmlTagRegex = /<html[\s\S]*?<\/html>/gi;
          while ((match = htmlTagRegex.exec(raw)) !== null) {
            htmlBlocks.push(match[0]);
          }
        }

        if (htmlBlocks.length > 0) {
          if (htmlBlocks.length === 1) {
            const html = htmlBlocks[0];
            const sectionRegex = /<section[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/section>/gi;
            const sections: Record<string, string> = {};
            let secMatch;
            while ((secMatch = sectionRegex.exec(html)) !== null) {
              sections[secMatch[1]] = secMatch[2];
            }

            if (Object.keys(sections).length >= 2) {
              const navPageNames = ['Home', 'About', 'Services', 'Contact'];
              const mapping: Record<string, string> = { home: 'Home', about: 'About', services: 'Services', contact: 'Contact' };
              const patchedPages: Record<string, string> = {};
              for (const [id, content] of Object.entries(sections)) {
                const pageName = mapping[id.toLowerCase()] || id.charAt(0).toUpperCase() + id.slice(1);
                patchedPages[pageName] = injectNav(
                  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${pageName}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#0a0a0a;color:#fff;padding-top:3.5rem}</style></head><body>${content}</body></html>`,
                  navPageNames, pageName.toLowerCase()
                );
              }
              pages = patchedPages;
            } else {
              pages['Home'] = injectNav(html, ['Home'], 'home');
            }
          } else {
            const defaultNames = ['Home', 'About', 'Services', 'Contact'];
            const navPageNames = htmlBlocks.map((_, i) => defaultNames[i] || `Page ${i + 1}`);
            htmlBlocks.forEach((html, i) => {
              const name = navPageNames[i];
              pages[name] = injectNav(html, navPageNames, name.toLowerCase().replace(/\s+/g, '-'));
            });
          }
        }
      }

      if (Object.keys(pages).length === 0) {
        // Last resort: dump raw response for debugging
        console.error('[Marketplace] Failed to parse response:', raw.substring(0, 500));
        throw new Error(`AI returned unparseable content (${raw.length} chars). Please try again.`);
      }

      const project: PortfolioProject = {
        id: generateId(),
        name: title.trim(),
        category,
        pages,
        createdAt: new Date().toISOString(),
      };

      save([project, ...projects]);
      saveToDisk(project);
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
    const project = projects.find(p => p.id === id);
    if (project) saveToDisk(project, 'delete');
    save(projects.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
    if (editProject?.id === id) setEditProject(null);
  };

  const handleCopy = () => {
    if (!selectedProject || !codeTab) return;
    navigator.clipboard.writeText(selectedProject.pages[codeTab] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (p: PortfolioProject) => {
    const pageNames = Object.keys(p.pages);
    if (pageNames.length === 1) {
      const blob = new Blob([p.pages[pageNames[0]]], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${p.name.replace(/\s+/g, '_').toLowerCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    // Multi-page: download home page with nav links
    const homeHtml = p.pages['Home'] || p.pages[pageNames[0]] || '';
    const blob = new Blob([homeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.name.replace(/\s+/g, '_').toLowerCase()}_home.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Preview page-switching script (injected into iframe) ----
  const buildPreviewSrcDoc = useCallback((project: PortfolioProject, activeSlug: string): string => {
    const pageNames = Object.keys(project.pages);
    const slugToName: Record<string, string> = {};
    for (const n of pageNames) slugToName[n.toLowerCase().replace(/\s+/g, '-')] = n;

    const activeName = slugToName[activeSlug] || pageNames[0];
    const html = project.pages[activeName] || '';

    // Build a JS bridge for navigation
    const pagesMap = JSON.stringify(
      Object.fromEntries(pageNames.map(n => [n.toLowerCase().replace(/\s+/g, '-'), project.pages[n]]))
    );

    const script = `<script>
window.__pages=${pagesMap};
window.__currentPage='${activeSlug}';
window.__pageNames=${JSON.stringify(pageNames.map(n=>n.toLowerCase().replace(/\s+/g,'-')))};
window.__switchPage=function(slug){
  if(!window.__pages[slug])return;
  window.__currentPage=slug;
  document.documentElement.innerHTML='';
  document.open();
  document.write(window.__pages[slug]);
  document.close();
  document.documentElement.innerHTML+='<scr'+'ipt>window.__pages='+JSON.stringify(window.__pages)+';window.__currentPage=\''+slug+'\';window.__pageNames='+JSON.stringify(pageNames.map(n=>n.toLowerCase().replace(/\s+/g,'-')))+';window.__switchPage=function(s){window.parent.postMessage({type:"__nav",slug:s},\"*\");};</scr'+'ipt>';
  window.parent.postMessage({type:'__nav',slug:slug},'*');
};
window.onhashchange=function(){var s=location.hash.slice(1);if(s&&s!==window.__currentPage)window.__switchPage(s);};
</script>`;

    return html.replace(/<\/body>/i, `${script}\n</body>`);
  }, []);

  // Listen for navigation messages from preview iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === '__nav' && previewProject) {
        setPreviewPage(e.data.slug);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [previewProject]);

  const getPageNames = (p: PortfolioProject) => Object.keys(p.pages);

  const startPreview = (p: PortfolioProject) => {
    const names = getPageNames(p);
    setPreviewProject(p);
    setPreviewPage(names[0]?.toLowerCase().replace(/\s+/g, '-') || 'home');
  };

  const startEdit = (p: PortfolioProject) => {
    const names = getPageNames(p);
    setEditProject(p);
    setEditPage(names[0] || 'Home');
    setView('create');
  };

  const startCode = (p: PortfolioProject) => {
    const names = getPageNames(p);
    setSelectedProject(p);
    setCodeTab(names[0] || 'Home');
    setView('create');
  };

  // ---- Render ----
  return (
    <div className="min-h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-finance-400" /> Marketplace
          </h1>
          <p className="text-dark-400 text-sm mt-1">Browse projects by category or create a new multi-page site</p>
        </div>
        <button
          onClick={() => { setView(view === 'grid' ? 'create' : 'grid'); setSelectedProject(null); setEditProject(null); }}
          className="btn-primary text-sm"
        >
          {view === 'grid' ? <><Plus className="w-4 h-4" /> New Project</> : <>{'←'} Back to Projects</>}
        </button>
      </div>

      {/* ============ GRID VIEW ============ */}
      {view === 'grid' && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects by title..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-900/80 border border-dark-800 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 bg-dark-900/80 border border-dark-800 rounded-xl p-1 mb-6 overflow-x-auto">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeCategory === cat.key ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'}`}>
                  <Icon className="w-3.5 h-3.5" />{cat.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.key ? 'bg-white/20' : 'bg-dark-800'}`}>{categoryCounts(cat.key)}</span>
                </button>
              );
            })}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Store className="w-16 h-16 text-dark-700 mb-4" />
              <h3 className="text-lg font-semibold text-dark-400">{search ? 'No matching projects' : 'No projects in this category'}</h3>
              <p className="text-sm text-dark-500 mt-2">{search ? 'Try a different search term' : 'Create your first project'}</p>
              <button onClick={() => setView('create')} className="btn-primary mt-4 text-sm"><Plus className="w-4 h-4" /> New Project</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(p => {
                const names = getPageNames(p);
                const firstPage = p.pages[names[0]] || '';
                return (
                  <div key={p.id} className="bg-dark-900/80 border border-dark-800 rounded-2xl overflow-hidden hover:border-dark-700 transition-all group">
                    <div className="h-44 bg-dark-800 overflow-hidden relative">
                      <iframe srcDoc={firstPage} className="w-full h-full border-0 pointer-events-none origin-top-left"
                        style={{ width: '200%', height: '200%', transform: 'scale(0.5)' }} sandbox="allow-scripts" title={p.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                        <button onClick={() => startPreview(p)} className="px-3 py-1.5 bg-finance-600 hover:bg-finance-500 rounded-lg text-xs text-white font-medium flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Preview</button>
                        <button onClick={() => startCode(p)} className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-200 font-medium flex items-center gap-1 border border-dark-700"><Code className="w-3.5 h-3.5" /> Code</button>
                        <button onClick={() => startEdit(p)} className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-200 font-medium flex items-center gap-1 border border-dark-700"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-dark-800 rounded-full text-dark-400 capitalize">{p.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        {names.map(n => <span key={n} className="text-[10px] px-1.5 py-0.5 bg-finance-600/15 text-finance-400 rounded">{n}</span>)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startPreview(p)} className="flex-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-[11px] text-dark-300 flex items-center justify-center gap-1 border border-dark-700"><Eye className="w-3 h-3" /> Preview</button>
                        <button onClick={() => handleDownload(p)} className="flex-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-[11px] text-dark-300 flex items-center justify-center gap-1 border border-dark-700"><Download className="w-3 h-3" /> Download</button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-dark-800 hover:bg-red-500/10 rounded-lg text-[11px] text-dark-400 hover:text-red-400 border border-dark-700 hover:border-red-500/30"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ============ CREATE VIEW ============ */}
      {view === 'create' && (
        <>
          <div className="max-w-2xl mx-auto">
            <div className="bg-dark-900/80 border border-dark-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-2">What should we build?</h2>
              <p className="text-dark-400 text-sm mb-6">Enter a title and AI will generate a multi-page site (Home, About, Services, Contact) with navigation.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Project Title</label>
                  <input type="text" value={title} onChange={e => { setTitle(e.target.value); setCategory(detectCategory(e.target.value)); }}
                    onKeyDown={e => e.key === 'Enter' && generate()}
                    placeholder="e.g., CloudSync — Cloud Storage Platform"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all text-sm"
                    disabled={loading} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.key !== 'all').map(cat => {
                      const Icon = cat.icon;
                      return (
                        <button key={cat.key} onClick={() => setCategory(cat.key)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${category === cat.key ? 'bg-finance-600/20 border-finance-500/50 text-finance-300' : 'bg-dark-800 border-dark-700 text-dark-400 hover:text-dark-200 hover:border-dark-600'}`}>
                          <Icon className="w-3.5 h-3.5" />{cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={generate} disabled={!title.trim() || loading}
                  className="w-full btn-primary justify-center text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating multi-page site...</> : <><Plus className="w-4 h-4" /> Generate Website</>}
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-dark-800">
                <p className="text-[10px] text-dark-500 mb-3">Quick ideas:</p>
                <div className="flex flex-wrap gap-2">
                  {['FinPlanner — Financial Planning App', 'CloudSync — Cloud Storage Platform', 'DevPortfolio — Developer Showcase', 'GreenLeaf — Eco-Friendly Store', 'TaskFlow — Project Management Tool'].map((idea, i) => (
                    <button key={i} onClick={() => { setTitle(idea); setCategory(detectCategory(idea)); }}
                      className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-[11px] text-dark-300 hover:text-white hover:border-finance-500/50 transition-all">{idea}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Code View */}
          {selectedProject && (
            <div className="max-w-4xl mx-auto mt-6">
              <div className="bg-dark-900/80 border border-dark-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-finance-400" />
                    <span className="text-sm font-medium text-white">Code: {selectedProject.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-300 flex items-center gap-1 border border-dark-700">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={() => { startPreview(selectedProject); }} className="px-3 py-1.5 bg-finance-600 hover:bg-finance-500 rounded-lg text-xs text-white flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Preview</button>
                    <button onClick={() => { setSelectedProject(null); setCodeTab(''); }} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Page tabs */}
                <div className="flex gap-1 px-4 pt-3 border-b border-dark-800 overflow-x-auto">
                  {getPageNames(selectedProject).map(name => (
                    <button key={name} onClick={() => setCodeTab(name)}
                      className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all whitespace-nowrap ${codeTab === name ? 'bg-dark-800 text-white border border-b-0 border-dark-700' : 'text-dark-400 hover:text-dark-200'}`}>
                      <FileCode className="w-3 h-3 inline mr-1" />{name}
                    </button>
                  ))}
                </div>
                <div className="h-[500px] overflow-auto">
                  <pre className="p-4 text-xs text-dark-200 font-mono whitespace-pre-wrap break-words">
                    <code>{codeTab && selectedProject.pages[codeTab]}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Edit View */}
          {editProject && (
            <div className="max-w-4xl mx-auto mt-6">
              <div className="bg-dark-900/80 border border-dark-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-4 h-4 text-finance-400" />
                    <span className="text-sm font-medium text-white">Editing: {editProject.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { startPreview(editProject); }} className="px-3 py-1.5 bg-finance-600 hover:bg-finance-500 rounded-lg text-xs text-white flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Preview</button>
                    <button onClick={() => { setEditProject(null); setEditPage(''); }} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* Page tabs */}
                <div className="flex gap-1 px-4 pt-3 border-b border-dark-800 overflow-x-auto">
                  {getPageNames(editProject).map(name => (
                    <button key={name} onClick={() => setEditPage(name)}
                      className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all whitespace-nowrap ${editPage === name ? 'bg-dark-800 text-white border border-b-0 border-dark-700' : 'text-dark-400 hover:text-dark-200'}`}>
                      {name}
                    </button>
                  ))}
                </div>
                <div className="h-[500px]">
                  <textarea value={editPage && editProject.pages[editPage] ? editProject.pages[editPage] : ''}
                    onChange={e => {
                      if (!editPage) return;
                      const updated = { ...editProject, pages: { ...editProject.pages, [editPage]: e.target.value } };
                      setEditProject(updated);
                      const idx = projects.findIndex(p => p.id === editProject.id);
                      if (idx >= 0) {
                        const arr = [...projects];
                        arr[idx] = updated;
                        save(arr);
                        // Debounce disk save
                        clearTimeout((window as any).__saveToDiskTimer);
                        (window as any).__saveToDiskTimer = setTimeout(() => saveToDisk(updated), 1000);
                      }
                    }}
                    className="w-full h-full p-4 bg-dark-950 text-dark-200 font-mono text-xs resize-none focus:outline-none" spellCheck={false} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============ PREVIEW MODAL ============ */}
      {previewProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-finance-400" />
                <h3 className="text-sm font-semibold text-white">{previewProject.name}</h3>
                <div className="flex gap-1 ml-2">
                  {getPageNames(previewProject).map(name => {
                    const slug = name.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <button key={name} onClick={() => setPreviewPage(slug)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${previewPage === slug ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'}`}>
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(previewProject)} className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-300 flex items-center gap-1 border border-dark-700"><Download className="w-3.5 h-3.5" /> Download</button>
                <button onClick={() => { setPreviewProject(null); setPreviewPage('home'); }} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={buildPreviewSrcDoc(previewProject, previewPage)}
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
