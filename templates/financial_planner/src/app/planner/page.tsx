'use client';
import { useState, useEffect } from 'react';
import { Wallet, Target, PiggyBank, Home, TrendingUp, Calculator, Calendar, Users, AlertCircle, Check, ChevronRight, IndianRupee, BarChart3, Shield, Sparkles, MessageSquare } from 'lucide-react';
import { getItem, setItem, FINANCIAL_KEY, generateId, CHATS_KEY, getItem as getS } from '@/lib/storage';
import { callOpenRouter, getAgentSystemPrompt } from '@/lib/openrouter';
import { calculateEMI, formatNumber } from '@/lib/utils';

export default function PlannerPage() {
  const [profile, setProfile] = useState<any>({
    monthlySalary: 75000, savings: 500000, monthlyExpenses: 30000, currentEMIs: 5000,
    emergencyFund: 200000, targetPropertyBudget: 5000000, targetSavingsPerMonth: 15000,
    investmentType: 'Moderate', riskTolerance: 5, age: 28, retirementAge: 58, dependents: 0,
  });
  const [activeTab, setActiveTab] = useState<'planner' | 'calculator' | 'ai'>('planner');
  const [aiInput, setAiInput] = useState('');
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    const saved = getItem(FINANCIAL_KEY, null);
    if (saved) setProfile(saved);
    const settings = getItem('settings', { openRouterKey: '' });
    if (settings.openRouterKey) {
      setApiKey(settings.openRouterKey);
      setAiEnabled(true);
    } else {
      setAiEnabled(true);
    }
  }, []);

  const updateProfile = (key: string, value: number) => {
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    setItem(FINANCIAL_KEY, updated);
  };

  // Calculations
  const totalIncome = profile.monthlySalary;
  const totalOutgo = profile.monthlyExpenses + profile.currentEMIs + profile.targetSavingsPerMonth;
  const disposableIncome = totalIncome - totalOutgo;
  const annualSavings = profile.targetSavingsPerMonth * 12;
  const monthsToDownPayment = profile.targetPropertyBudget * 0.2 > profile.savings
    ? Math.ceil((profile.targetPropertyBudget * 0.2 - profile.savings) / profile.targetSavingsPerMonth)
    : 0;
  const maxLoanEligible = profile.monthlySalary * 0.5 * 12 * 20; // 50% of salary, 20yr tenure
  const emiEstimate = calculateEMI(profile.targetPropertyBudget * 0.8, 8.5, 240);
  const affordabilityRatio = (emiEstimate / profile.monthlySalary * 100).toFixed(0);
  const retirementCorpus = profile.targetSavingsPerMonth * 12 * (profile.retirementAge - profile.age);
  const emergencyMonths = Math.round(profile.emergencyFund / profile.monthlyExpenses);

  const handleAiChat = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiInput('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const context = `Monthly Salary: ₹${profile.monthlySalary}, Expenses: ₹${profile.monthlyExpenses}, Savings: ₹${profile.savings}, Target Budget: ₹${profile.targetPropertyBudget}, Age: ${profile.age}`;
      const response = await callOpenRouter(apiKey, [
        { role: 'system', content: getAgentSystemPrompt('financial-planner', context) },
        ...chat.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMsg },
      ]);
      setChat(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e: any) {
      setChat(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${e.message}. Add your OpenRouter API key in Settings (click the ⚙️ gear icon in the top-right corner).` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Financial Planner</h1><p className="text-dark-400 text-sm mt-1">Plan your finances, calculate affordability, and get AI-powered advice</p></div>
        <div className="flex gap-1 bg-dark-800 rounded-xl p-1">
          {(['planner', 'calculator', 'ai'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-finance-600 text-white' : 'text-dark-400 hover:text-dark-200'}`}>
              {tab === 'planner' ? 'Profile' : tab === 'calculator' ? 'Calculator' : 'AI Advisor'}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'planner' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Users className="w-5 h-5 text-finance-400" /> Your Profile</h2>
            {[
              { key: 'monthlySalary', label: 'Monthly Salary (₹)', icon: Wallet, min: 0, max: 500000, step: 5000 },
              { key: 'savings', label: 'Current Savings (₹)', icon: PiggyBank, min: 0, max: 10000000, step: 50000 },
              { key: 'monthlyExpenses', label: 'Monthly Expenses (₹)', icon: Calendar, min: 0, max: 200000, step: 2000 },
              { key: 'currentEMIs', label: 'Current EMIs (₹)', icon: Calculator, min: 0, max: 100000, step: 1000 },
              { key: 'emergencyFund', label: 'Emergency Fund (₹)', icon: Shield, min: 0, max: 5000000, step: 25000 },
              { key: 'targetSavingsPerMonth', label: 'Target Monthly Savings (₹)', icon: Target, min: 0, max: 200000, step: 2000 },
              { key: 'targetPropertyBudget', label: 'Target Property Budget (₹)', icon: Home, min: 0, max: 50000000, step: 500000 },
              { key: 'age', label: 'Your Age', icon: Users, min: 18, max: 70, step: 1 },
              { key: 'retirementAge', label: 'Retirement Age', icon: Calendar, min: 30, max: 80, step: 1 },
              { key: 'dependents', label: 'Dependents', icon: Users, min: 0, max: 10, step: 1 },
            ].map(({ key, label, icon: Icon, min, max, step }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1"><span className="text-sm text-dark-300 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-dark-500" />{label}</span><span className="text-sm font-medium text-white">₹{formatNumber(profile[key])}</span></div>
                <input type="range" min={min} max={max} step={step} value={profile[key]} onChange={e => updateProfile(key, Number(e.target.value))} className="w-full accent-finance-500" />
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-prop-400" /> Financial Summary</h2>
              {[
                { label: 'Monthly Income', value: `₹${formatNumber(totalIncome)}`, color: 'text-prop-400' },
                { label: 'Monthly Outgo', value: `₹${formatNumber(totalOutgo)}`, color: 'text-red-400' },
                { label: 'Disposable Income', value: `₹${formatNumber(disposableIncome)}`, color: disposableIncome > 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Annual Saving Potential', value: `₹${formatNumber(annualSavings)}`, color: 'text-finance-400' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-800 last:border-0">
                  <span className="text-sm text-dark-400">{s.label}</span><span className={`text-sm font-semibold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Home className="w-5 h-5 text-finance-400" /> Home Loan Eligibility</h2>
              {[
                { label: 'Property Budget', value: `₹${formatNumber(profile.targetPropertyBudget)}` },
                { label: '20% Down Payment Needed', value: `₹${formatNumber(profile.targetPropertyBudget * 0.2)}` },
                { label: 'Loan Amount Needed', value: `₹${formatNumber(profile.targetPropertyBudget * 0.8)}` },
                { label: 'Max Loan Eligible (est.)', value: `₹${formatNumber(maxLoanEligible)}`, color: maxLoanEligible >= profile.targetPropertyBudget * 0.8 ? 'text-green-400' : 'text-red-400' },
                { label: 'Monthly EMI (est.)', value: `₹${formatNumber(emiEstimate)}` },
                { label: 'EMI-to-Income Ratio', value: `${affordabilityRatio}%`, color: Number(affordabilityRatio) <= 40 ? 'text-green-400' : 'text-red-400' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5"><span className="text-sm text-dark-400">{s.label}</span><span className={`text-sm font-semibold ${s.color || 'text-dark-200'}`}>{s.value}</span></div>
              ))}
              <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: `${Math.min(Number(affordabilityRatio), 100)}%` }} /></div>
              <p className="text-xs text-dark-500">EMI ratio: Ideal is 30-40% of income. {Number(affordabilityRatio) > 40 ? 'Consider a lower budget.' : 'Looks manageable.'}</p>
            </div>

            <div className="card space-y-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Target className="w-5 h-5 text-amber-400" /> Goals & Projections</h2>
              {[
                { label: 'Emergency Fund Coverage', value: `${emergencyMonths} months`, color: emergencyMonths >= 6 ? 'text-green-400' : 'text-red-400' },
                { label: 'Months to Down Payment', value: monthsToDownPayment > 0 ? `${monthsToDownPayment} months` : 'Already have enough!', color: monthsToDownPayment > 0 ? 'text-yellow-400' : 'text-green-400' },
                { label: 'Retirement Corpus (est.)', value: `₹${formatNumber(retirementCorpus)}`, color: 'text-finance-400' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5"><span className="text-sm text-dark-400">{s.label}</span><span className={`text-sm font-semibold ${s.color}`}>{s.value}</span></div>
              ))}
            </div>

            <div className="card bg-finance-500/5 border-finance-500/20">
              <p className="text-xs text-finance-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Tip</p>
              <p className="text-sm text-dark-300 mt-2">Based on your profile, try to save at least 20% of your income. An ideal home budget is 3-5x your annual income. Switch to the <button onClick={() => setActiveTab('ai')} className="text-finance-400 underline">AI Advisor</button> for personalized recommendations.</p>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <EMICalculator />
          <AffordabilityCalc />
        </div>
      )}

      {/* AI Advisor Tab */}
      {activeTab === 'ai' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card flex flex-col h-[600px]">
            <div className="flex items-center gap-2 pb-3 border-b border-dark-800">
              <Wallet className="w-5 h-5 text-finance-400" /><h2 className="text-lg font-semibold text-white">Financial Advisor Chat</h2>
            </div>
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-3">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-finance-600/20 text-finance-200 border border-finance-500/20' : 'bg-dark-800 text-dark-200 border border-dark-700'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-center text-dark-500 text-sm py-4 animate-pulse">Thinking...</div>}
              </div>
              <div className="flex gap-2 pt-3 border-t border-dark-800">
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiChat()} placeholder="Ask about financial planning..." className="input" />
                <button onClick={handleAiChat} disabled={loading || !aiInput.trim()} className="btn-primary shrink-0"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </>
          </div>
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-white">Suggested Questions</h3>
            {[
              'How much home loan can I afford?',
              'What\'s the best investment for first home?',
              'Calculate my tax savings on home loan',
              'How to save faster for down payment?',
              'Compare renting vs buying',
              'What government schemes can help?',
            ].map((q, i) => (
              <button key={i} onClick={() => { setAiInput(q); }} className="w-full text-left p-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-xs text-dark-300 hover:text-dark-200 transition-all">
                {q}
              </button>
            ))}
            <div className="pt-2 text-xs text-dark-500">
              <p>💡 Your financial profile data is included in the AI context for personalized advice.</p>
              <p className="mt-1">🔑 Set your OpenRouter API key in Settings (⚙️ gear icon top-right) to use AI features.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EMICalculator() {
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const emi = calculateEMI(amount, rate, tenure * 12);
  const totalPayable = emi * tenure * 12;
  const totalInterest = totalPayable - amount;

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Calculator className="w-5 h-5 text-finance-400" /> EMI Calculator</h2>
      {[
        { label: 'Loan Amount (₹)', value: amount, set: setAmount, max: 50000000, step: 100000 },
        { label: 'Interest Rate (%)', value: rate, set: setRate, max: 20, step: 0.1 },
        { label: 'Tenure (Years)', value: tenure, set: setTenure, max: 30, step: 1 },
      ].map(({ label, value, set, max, step }) => (
        <div key={label}>
          <div className="flex justify-between text-sm mb-1"><span className="text-dark-400">{label}</span><span className="text-white font-medium">{value.toLocaleString('en-IN')}{label.includes('%') ? '%' : ''}</span></div>
          <input type="range" min={0} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} className="w-full accent-finance-500" />
        </div>
      ))}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-finance-500/10"><div className="text-lg font-bold text-finance-400">₹{formatNumber(emi)}</div><div className="text-[10px] text-dark-500">Monthly EMI</div></div>
        <div className="p-3 rounded-xl bg-prop-500/10"><div className="text-lg font-bold text-prop-400">₹{formatNumber(totalInterest)}</div><div className="text-[10px] text-dark-500">Total Interest</div></div>
        <div className="p-3 rounded-xl bg-amber-500/10"><div className="text-lg font-bold text-amber-400">₹{formatNumber(totalPayable)}</div><div className="text-[10px] text-dark-500">Total Payable</div></div>
      </div>
    </div>
  );
}

function AffordabilityCalc() {
  const [income, setIncome] = useState(75000);
  const [obligations, setObligations] = useState(15000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const maxEMI = (income - obligations) * 0.5;
  const maxLoan = Math.round(maxEMI * 12 * tenure / (1 + rate / 100 * tenure));
  const affordableProperty = Math.round(maxLoan / 0.8);

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Home className="w-5 h-5 text-prop-400" /> Affordability Calculator</h2>
      {[
        { label: 'Monthly Income (₹)', value: income, set: setIncome, max: 500000, step: 5000 },
        { label: 'Existing Obligations (₹)', value: obligations, set: setObligations, max: 200000, step: 2000 },
        { label: 'Interest Rate (%)', value: rate, set: setRate, max: 20, step: 0.1 },
        { label: 'Loan Tenure (Years)', value: tenure, set: setTenure, max: 30, step: 1 },
      ].map(({ label, value, set, max, step }) => (
        <div key={label}>
          <div className="flex justify-between text-sm mb-1"><span className="text-dark-400">{label}</span><span className="text-white font-medium">{value.toLocaleString('en-IN')}{label.includes('%') ? '%' : ' yrs'}</span></div>
          <input type="range" min={0} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} className="w-full accent-finance-500" />
        </div>
      ))}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-finance-500/10"><div className="text-lg font-bold text-finance-400">₹{formatNumber(maxEMI)}</div><div className="text-[10px] text-dark-500">Max EMI</div></div>
        <div className="p-3 rounded-xl bg-prop-500/10"><div className="text-lg font-bold text-prop-400">₹{formatNumber(maxLoan)}</div><div className="text-[10px] text-dark-500">Max Loan</div></div>
        <div className="p-3 rounded-xl bg-amber-500/10"><div className="text-lg font-bold text-amber-400">₹{formatNumber(affordableProperty)}</div><div className="text-[10px] text-dark-500">Property Value</div></div>
      </div>
    </div>
  );
}
