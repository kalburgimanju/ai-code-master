'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Wallet, TrendingUp, Scale, Megaphone, Users, BarChart3, MessageSquare, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { AGENTS } from '@/lib/types';

const iconMap: Record<string, React.ElementType> = { Wallet, TrendingUp, Scale, Megaphone, Users, BarChart3 };

export default function AgentsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-finance-600/20 flex items-center justify-center"><Bot className="w-5.5 h-5.5 text-finance-400" /></div>
        <div><h1 className="text-2xl font-bold text-white">AI Agent Agency</h1><p className="text-dark-400 text-sm mt-1">Intelligent agents to help you with finance, legal, marketing, and more</p></div>
      </div>

      <div className="card bg-gradient-to-br from-finance-900/30 to-prop-900/30 border-finance-500/20 p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="w-8 h-8 text-finance-400 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-white">Your Personal AI Agency</h2>
            <p className="text-sm text-dark-300 mt-1 max-w-2xl">Our AI agents are powered by OpenRouter. Each agent specializes in a specific domain — from financial planning to property analysis. Chat with any agent for expert advice, then use their insights across the platform.</p>
            <div className="flex gap-2 mt-3">
              <Link href="/planner?tab=ai" className="btn-primary text-sm"><Wallet className="w-4 h-4" /> Financial Advisor</Link>
              <Link href="/legal" className="btn-secondary text-sm"><Scale className="w-4 h-4" /> Legal Expert</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const Icon = iconMap[agent.icon] || Bot;
          return (
            <Link key={agent.id} href={`/agents/${agent.id}`} className="card-hover group overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${agent.color}20` }}>
                  <Icon className="w-6 h-6" style={{ color: agent.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-white group-hover:text-finance-400 transition-colors">{agent.name}</h3>
                  <p className="text-xs text-dark-400 mt-0.5">{agent.title}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-finance-400 transition-colors shrink-0 mt-1" />
              </div>
              <p className="text-xs text-dark-500 mt-3 leading-relaxed">{agent.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {agent.expertise.map(e => <span key={e} className="badge-blue text-[10px]">{e}</span>)}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-finance-400 font-medium"><MessageSquare className="w-3 h-3" /> Start Chatting <ArrowRight className="w-3 h-3" /></div>
            </Link>
          );
        })}
      </div>

      {/* Integration Notes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-3">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Choose an Agent', desc: 'Select from 6 specialized AI agents for your specific need.' },
            { step: '2', title: 'Describe Your Situation', desc: 'Tell the agent about your requirements in natural language.' },
            { step: '3', title: 'Get AI-Powered Advice', desc: 'Receive detailed analysis, recommendations, and actionable steps.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-finance-600/20 flex items-center justify-center text-sm font-bold text-finance-400 shrink-0">{step}</div>
              <div><h4 className="text-sm font-medium text-white">{title}</h4><p className="text-xs text-dark-400 mt-0.5">{desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
