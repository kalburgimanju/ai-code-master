'use client';
import { useState, useEffect, useRef } from 'react';
import { Store, Send, Bot, User, Code, Eye, Edit3, Trash2, Plus, X, Copy, Check, Download, Play, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getItem, setItem, generateId } from '@/lib/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  prompt: string;
  html: string;
  css: string;
  js: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const STORAGE_KEY = 'marketplace_projects';
const CHAT_STORAGE_KEY = 'marketplace_chat';

const sampleProjects: PortfolioProject[] = [
  {
    id: 'demo1',
    name: 'Modern Landing Page',
    description: 'A sleek, dark-themed landing page with gradient backgrounds, animated stats, and a call-to-action section.',
    prompt: 'Create a modern dark-themed landing page with hero section, stats counters, features grid, and CTA',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Modern Landing Page</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0a; color: #fff; }
  .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%); position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); top: -200px; right: -200px; }
  .hero::after { content: ''; position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%); bottom: -100px; left: -100px; }
  .hero-content { position: relative; z-index: 1; max-width: 800px; padding: 2rem; }
  .badge { display: inline-block; padding: 6px 16px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); border-radius: 9999px; font-size: 0.75rem; color: #818cf8; margin-bottom: 1.5rem; }
  h1 { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; background: linear-gradient(135deg, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { font-size: 1.25rem; color: #94a3b8; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto; }
  .cta-group { display: flex; gap: 1rem; justify-content: center; }
  .btn-primary { padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.4); }
  .btn-secondary { padding: 14px 32px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; max-width: 900px; margin: 4rem auto 0; padding: 2rem; }
  .stat { text-align: center; }
  .stat-value { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, #6366f1, #22c55e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .stat-label { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
  .features { padding: 6rem 2rem; max-width: 1200px; margin: 0 auto; }
  .features h2 { text-align: center; font-size: 2.5rem; font-weight: 700; margin-bottom: 3rem; }
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
  .feature-card { padding: 2rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; transition: all 0.3s; }
  .feature-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-4px); }
  .feature-icon { width: 48px; height: 48px; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,197,94,0.2)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem; }
  .feature-card h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
  .feature-card p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; }
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
</body>
</html>`,
    css: '',
    js: '',
    thumbnail: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['landing', 'dark-theme', 'gradient'],
  },
  {
    id: 'demo2',
    name: 'Property Card Component',
    description: 'A beautiful property listing card with image, pricing, amenities, and action buttons.',
    prompt: 'Create a property listing card with image, pricing, amenities badges, and CTA buttons',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Property Card</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
  .card { width: 380px; background: #1e293b; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
  .card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
  .card-image { height: 220px; background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .card-image::after { content: '🏠'; font-size: 4rem; opacity: 0.3; }
  .badge-row { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; }
  .badge { padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 600; }
  .badge-blue { background: rgba(99,102,241,0.9); color: #fff; }
  .badge-green { background: rgba(34,197,94,0.9); color: #fff; }
  .card-body { padding: 1.5rem; }
  .card-title { font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; }
  .card-location { font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; display: flex; align-items: center; gap: 4px; }
  .price { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #22c55e, #4ade80); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
  .amenities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.25rem; }
  .amenity { padding: 4px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-size: 0.7rem; color: #94a3b8; }
  .card-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); margin-bottom: 1.25rem; }
  .card-stat { text-align: center; }
  .card-stat-value { font-size: 0.9rem; font-weight: 700; color: #fff; }
  .card-stat-label { font-size: 0.65rem; color: #64748b; }
  .card-actions { display: flex; gap: 0.75rem; }
  .btn { flex: 1; padding: 10px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; text-align: center; }
  .btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; }
  .btn-primary:hover { box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
  .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; }
  .btn-outline:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
</style>
</head>
<body>
<div class="card">
  <div class="card-image">
    <div class="badge-row">
      <span class="badge badge-blue">Premium</span>
      <span class="badge badge-green">Ready to Move</span>
    </div>
  </div>
  <div class="card-body">
    <div class="card-title">Sobha City</div>
    <div class="card-location">📍 Gokul Road, Hubli</div>
    <div class="price">₹35 Lakh - ₹65 Lakh</div>
    <div class="amenities">
      <span class="amenity">🏊 Pool</span>
      <span class="amenity">💪 Gym</span>
      <span class="amenity">🌳 Garden</span>
      <span class="amenity">🔒 Security</span>
      <span class="amenity">🅿️ Parking</span>
    </div>
    <div class="card-stats">
      <div class="card-stat"><div class="card-stat-value">2-3 BHK</div><div class="card-stat-label">Config</div></div>
      <div class="card-stat"><div class="card-stat-value">980-1650</div><div class="card-stat-label">Sq Ft</div></div>
      <div class="card-stat"><div class="card-stat-value">4.3 ★</div><div class="card-stat-label">Rating</div></div>
    </div>
    <div class="card-actions">
      <button class="btn btn-primary">Schedule Visit</button>
      <button class="btn btn-outline">View Details</button>
    </div>
  </div>
</div>
</body>
</html>`,
    css: '',
    js: '',
    thumbnail: '',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['property', 'card', 'component'],
  },
];

export default function MarketplacePage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'chat'>('grid');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [previewProject, setPreviewProject] = useState<PortfolioProject | null>(null);
  const [editProject, setEditProject] = useState<PortfolioProject | null>(null);
  const [codeView, setCodeView] = useState<'html' | 'css' | 'js'>('html');
  const [copied, setCopied] = useState(false);
  const [expandedChat, setExpandedChat] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getItem<PortfolioProject[]>(STORAGE_KEY, []);
    if (saved.length > 0) {
      setProjects(saved);
    } else {
      setProjects(sampleProjects);
      setItem(STORAGE_KEY, sampleProjects);
    }
    const savedChat = getItem<Message[]>(CHAT_STORAGE_KEY, []);
    if (savedChat.length > 0) {
      setMessages(savedChat);
    } else {
      const welcome: Message = {
        id: generateId(),
        role: 'assistant',
        content: `👋 Welcome to the Marketplace! I'm your AI portfolio builder.

Tell me what kind of project you'd like to create, and I'll generate the code for you. For example:

• "Create a modern pricing page with 3 tiers"
• "Build a team section with photos and bios"
• "Design a contact form with validation"
• "Make a dashboard with charts and stats"
• "Build a restaurant menu page"

What would you like to build today?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveProjects = (updated: PortfolioProject[]) => {
    setProjects(updated);
    setItem(STORAGE_KEY, updated);
  };

  const saveChat = (updated: Message[]) => {
    setMessages(updated);
    setItem(CHAT_STORAGE_KEY, updated);
  };

  const generateCode = async (prompt: string): Promise<{ html: string; name: string; description: string; tags: string[] }> => {
    const settings = getItem('settings', { openRouterKey: '' });
    const apiKey = settings.openRouterKey;

    if (!apiKey) {
      throw new Error('Please set your OpenRouter API key in Settings first.');
    }

    const systemPrompt = `You are an expert web developer and portfolio builder. When the user describes a project, you generate a complete, self-contained HTML file with embedded CSS and JavaScript.

RULES:
1. Generate ONLY valid HTML with inline <style> and <script> tags
2. Use modern CSS (flexbox, grid, gradients, animations, backdrop-filter)
3. Use a dark theme (backgrounds: #0a0a0a to #1e293b range)
4. Make it responsive and mobile-friendly
5. Include realistic content (not lorem ipsum)
6. Use Inter font from Google Fonts
7. Make it visually stunning with gradients, shadows, and smooth transitions
8. Return ONLY the HTML code, no explanations
9. The HTML should be complete and self-contained (DOCTYPE, html, head, body tags)

RESPONSE FORMAT - return JSON with these fields:
{
  "name": "Project Name",
  "description": "One-line description",
  "tags": ["tag1", "tag2", "tag3"],
  "html": "the complete HTML code here"
}`;

    const res = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try to parse JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          name: parsed.name || 'Untitled Project',
          description: parsed.description || prompt,
          tags: parsed.tags || ['custom'],
          html: parsed.html || content,
        };
      }
    } catch {
      // If JSON parsing fails, use the raw content as HTML
    }

    return {
      name: prompt.slice(0, 50).replace(/[\?!,]/g, ''),
      description: prompt,
      tags: ['custom'],
      html: content.includes('<html') ? content : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Project</title>
<style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
.content { max-width: 800px; text-align: center; } h1 { font-size: 2rem; margin-bottom: 1rem; } p { color: #94a3b8; }</style></head>
<body><div class="content"><h1>${prompt}</h1><p>${content}</p></div></body></html>`,
    };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    saveChat(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const result = await generateCode(input);

      const newProject: PortfolioProject = {
        id: generateId(),
        name: result.name,
        description: result.description,
        prompt: input,
        html: result.html,
        css: '',
        js: '',
        thumbnail: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: result.tags,
      };

      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: `✅ **${result.name}** has been created!\n\n${result.description}\n\nTags: ${result.tags.join(', ')}\n\nYou can now preview, edit, or view the code from the Projects tab.`,
        timestamp: new Date().toISOString(),
      };

      saveProjects([...projects, newProject]);
      saveChat([...updatedMessages, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: `❌ Error: ${err.message}\n\nMake sure you have set your OpenRouter API key in Settings (click the gear icon in the top-right corner).`,
        timestamp: new Date().toISOString(),
      };
      saveChat([...updatedMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (project: PortfolioProject) => {
    const blob = new Blob([project.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-finance-400" /> Marketplace
          </h1>
          <p className="text-dark-400 text-sm mt-1">AI-powered portfolio builder — describe your project and watch it come to life</p>
        </div>
        <div className="flex gap-1 bg-dark-800 rounded-xl p-1">
          <button
            onClick={() => setActiveView('grid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'grid' ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'chat' ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" /> AI Builder
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Grid View */}
        {activeView === 'grid' && (
          <div className="flex-1 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Store className="w-16 h-16 text-dark-700 mb-4" />
                <h3 className="text-lg font-semibold text-dark-400">No projects yet</h3>
                <p className="text-sm text-dark-500 mt-2">Switch to AI Builder to create your first project</p>
                <button
                  onClick={() => setActiveView('chat')}
                  className="btn-primary mt-4 text-sm"
                >
                  <Sparkles className="w-4 h-4" /> Start Building
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="card-hover group">
                    {/* Thumbnail */}
                    <div className="h-40 rounded-xl bg-gradient-to-br from-finance-900/40 to-prop-900/40 border border-dark-700 mb-3 overflow-hidden relative">
                      <iframe
                        srcDoc={project.html}
                        className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
                        style={{ width: '200%', height: '200%' }}
                        sandbox="allow-scripts"
                        title={project.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                        <button
                          onClick={() => setPreviewProject(project)}
                          className="px-3 py-1.5 bg-finance-600 hover:bg-finance-500 rounded-lg text-xs text-white font-medium flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => { setSelectedProject(project); setActiveView('chat'); }}
                          className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-200 font-medium flex items-center gap-1 transition-all border border-dark-700"
                        >
                          <Code className="w-3.5 h-3.5" /> Code
                        </button>
                        <button
                          onClick={() => { setEditProject(project); setActiveView('chat'); }}
                          className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 rounded-lg text-xs text-dark-200 font-medium flex items-center gap-1 transition-all border border-dark-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-sm font-semibold text-white mb-1">{project.name}</h3>
                    <p className="text-xs text-dark-400 line-clamp-2 mb-2">{project.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-dark-800 rounded-md text-[10px] text-dark-400">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-dark-800">
                      <span className="text-[10px] text-dark-600">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDownload(project)}
                          className="p-1.5 text-dark-500 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1.5 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat View */}
        {activeView === 'chat' && (
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Chat Panel */}
            <div className={`flex flex-col \${selectedProject || editProject ? 'w-1/2' : 'w-full'} transition-all`}>
              <div className="flex-1 flex flex-col bg-dark-900/80 border border-dark-800 rounded-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-finance-500 to-prop-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">AI Builder</p>
                      <p className="text-[10px] text-dark-500">Describe your project and I'll build it</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedChat(!expandedChat)}
                    className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"
                  >
                    {expandedChat ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm \${
                        msg.role === 'user'
                          ? 'bg-finance-600/20 text-finance-200 border border-finance-500/20 rounded-br-md'
                          : 'bg-dark-800 text-dark-200 border border-dark-700 rounded-bl-md'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-dark-500">
                            <Bot className="w-3 h-3" /> AI Builder
                          </div>
                        )}
                        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                            .replace(/\n/g, '<br/>')
                        }} />
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="p-3 rounded-2xl bg-dark-800 border border-dark-700 rounded-bl-md">
                        <div className="flex items-center gap-2 text-dark-400 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" /> Generating code...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-dark-800">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Describe your project... e.g., 'Create a pricing page with 3 tiers'"
                      className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="px-4 py-2.5 bg-finance-600 hover:bg-finance-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Code/Preview Panel */}
            {(selectedProject || editProject) && (
              <div className="w-1/2 flex flex-col bg-dark-900/80 border border-dark-800 rounded-2xl overflow-hidden">
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 bg-dark-800 rounded-lg p-0.5">
                      <button
                        onClick={() => setCodeView('html')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all \${
                          codeView === 'html' ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setCodeView('css')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all \${
                          codeView === 'css' ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'
                        }`}
                      >
                        CSS
                      </button>
                      <button
                        onClick={() => setCodeView('js')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all \${
                          codeView === 'js' ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'
                        }`}
                      >
                        JS
                      </button>
                    </div>
                    <span className="text-xs text-dark-500">{selectedProject?.name || editProject?.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const project = selectedProject || editProject;
                        if (project) handleCopyCode(project.html);
                      }}
                      className="p-1.5 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all"
                      title="Copy code"
                    >
                      {copied ? <Check className="w-4 h-4 text-prop-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        const project = selectedProject || editProject;
                        if (project) handleDownload(project);
                      }}
                      className="p-1.5 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedProject(null); setEditProject(null); }}
                      className="p-1.5 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Code Editor / Preview */}
                <div className="flex-1 overflow-hidden">
                  {editProject ? (
                    /* Edit Mode */
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-hidden">
                        <textarea
                          value={codeView === 'html' ? editProject.html : codeView === 'css' ? editProject.css : editProject.js}
                          onChange={e => {
                            const updated = { ...editProject, updatedAt: new Date().toISOString() };
                            if (codeView === 'html') updated.html = e.target.value;
                            else if (codeView === 'css') updated.css = e.target.value;
                            else updated.js = e.target.value;
                            setEditProject(updated);
                            // Also update in projects list
                            const idx = projects.findIndex(p => p.id === editProject.id);
                            if (idx >= 0) {
                              const newProjects = [...projects];
                              newProjects[idx] = updated;
                              saveProjects(newProjects);
                            }
                          }}
                          className="w-full h-full p-4 bg-dark-950 text-dark-200 font-mono text-xs resize-none focus:outline-none"
                          spellCheck={false}
                        />
                      </div>
                      <div className="px-4 py-2 border-t border-dark-800 flex items-center justify-between">
                        <button
                          onClick={() => setEditProject(null)}
                          className="text-xs text-dark-400 hover:text-dark-200 transition-all"
                        >
                          Close Editor
                        </button>
                        <button
                          onClick={() => { setPreviewProject(editProject); }}
                          className="btn-primary text-xs py-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                      </div>
                    </div>
                  ) : selectedProject ? (
                    /* Code View */
                    <div className="h-full overflow-auto">
                      <pre className="p-4 text-xs text-dark-200 font-mono whitespace-pre-wrap break-words">
                        <code>{codeView === 'html' ? selectedProject.html : codeView === 'css' ? selectedProject.css : selectedProject.js}</code>
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-finance-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{previewProject.name}</h3>
                  <p className="text-[10px] text-dark-500">{previewProject.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewProject)}
                  className="btn-ghost text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"
                >
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
