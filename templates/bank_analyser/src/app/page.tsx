'use client';

import { useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { Building2, Users, Wallet, TrendingUp, TrendingDown, Search, Download, Filter, BarChart3, PieChart, Banknote, CreditCard, IndianRupee, ArrowUpRight, ArrowDownRight, Calendar, ChevronDown, ChevronRight, Eye, EyeOff, DownloadCloud, Printer, SortAsc, SortDesc } from 'lucide-react';

// ─── BANK DATA ──────────────────────────────────────────
const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank', 'Bank of Baroda', 'Punjab National Bank', 'Canara Bank', 'Union Bank of India', 'IDFC First Bank', 'IndusInd Bank', 'Federal Bank', 'South Indian Bank', 'Bank of India', 'Central Bank of India', 'Indian Bank', 'UCO Bank', 'Bandhan Bank', 'Jammu & Kashmir Bank', 'Corporation Bank', 'Karnataka Bank', 'Karnataka Vikas Grameena Bank', 'Syndicate Bank', 'Vijaya Bank'];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Bhopal', 'Indore', 'Nagpur', 'Patna', 'Vadodara', 'Guwahati', 'Chandigarh', 'Thiruvananthapuram', 'Coimbatore', 'Hubli', 'Dharwad', 'Belgaum', 'Mysore', 'Mangalore'];
const OCCUPATIONS = ['Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Employee', 'Lawyer', 'Accountant', 'Marketing Manager', 'Data Analyst', 'Consultant', 'Architect', 'Professor', 'Entrepreneur', 'Banker', 'Engineer', 'Designer', 'Nurse', 'Pharmacist', 'Civil Engineer', 'Chef', 'Pilot', 'Journalist', 'Artist', 'Fitness Trainer', 'HR Manager', 'Sales Manager', 'Electrician', 'Plumber', 'Social Worker', 'Researcher', 'Agricultural Scientist', 'Textile Worker', 'Small Business Owner', 'Auto Driver', 'Shopkeeper', 'Farmer', 'Weaver', 'Potter'];
const EXPENSE_CATEGORIES = ['Rent', 'Groceries', 'Transportation', 'Utilities', 'Healthcare', 'Entertainment', 'Education', 'Dining', 'Shopping', 'Insurance', 'EMI', 'Savings', 'Travel', 'Miscellaneous'];

function generateCustomers(): any[] {
  const customers = [];
  for (let i = 0; i < 200; i++) {
    const salary = Math.round((30000 + Math.random() * 250000) / 1000) * 1000;
    const rent = Math.round((5000 + Math.random() * 30000) / 500) * 500;
    const groceries = Math.round((3000 + Math.random() * 15000) / 500) * 500;
    const transport = Math.round((1000 + Math.random() * 8000) / 500) * 500;
    const utilities = Math.round((1000 + Math.random() * 5000) / 500) * 500;
    const healthcare = Math.round((500 + Math.random() * 5000) / 500) * 500;
    const entertainment = Math.round((500 + Math.random() * 8000) / 500) * 500;
    const education = Math.round((0 + Math.random() * 10000) / 500) * 500;
    const dining = Math.round((1000 + Math.random() * 6000) / 500) * 500;
    const shopping = Math.round((1000 + Math.random() * 10000) / 500) * 500;
    const insurance = Math.round((1000 + Math.random() * 8000) / 500) * 500;
    const emi = Math.round((0 + Math.random() * 20000) / 1000) * 1000;
    const travel = Math.round((0 + Math.random() * 10000) / 500) * 500;
    const miscellaneous = Math.round((500 + Math.random() * 5000) / 500) * 500;

    const totalExpenses = rent + groceries + transport + utilities + healthcare + entertainment + education + dining + shopping + insurance + emi + travel + miscellaneous;
    const savings = Math.max(0, salary - totalExpenses);
    const savingsPct = salary > 0 ? Math.round((savings / salary) * 100) : 0;

    const accounts = Math.floor(1 + Math.random() * 3);
    const creditScore = Math.floor(650 + Math.random() * 200);
    const loanActive = Math.random() > 0.6;
    const loanAmount = loanActive ? Math.round((200000 + Math.random() * 1500000) / 100000) * 100000 : 0;

    const age = Math.floor(22 + Math.random() * 45);
    const tenure = Math.floor(1 + Math.random() * 10);

    customers.push({
      id: i + 1,
      name: getRandomName(i),
      age,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      occupation: OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)],
      bank: BANKS[Math.floor(Math.random() * BANKS.length)],
      accountType: Math.random() > 0.7 ? 'Premium' : Math.random() > 0.4 ? 'Savings' : 'Current',
      accountNumber: 'XXXXXX' + String(100000 + i).slice(-6),
      tenure,
      creditScore,
      salary,
      totalExpenses,
      savings,
      savingsPct,
      accounts,
      loanActive,
      loanAmount,
      loanType: loanActive ? (['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Business Loan'][Math.floor(Math.random() * 5)]) : 'None',
      monthlyBudget: Math.round(salary * 0.7 / 1000) * 1000,
      rent, groceries, transport, utilities, healthcare, entertainment, education, dining, shopping, insurance, emi, travel, miscellaneous,
      riskProfile: creditScore > 750 ? 'Low Risk' : creditScore > 700 ? 'Medium Risk' : 'High Risk',
      customerSince: `${2016 + Math.floor(Math.random() * 8)}`,
      lastTransaction: ['Today', 'Yesterday', '3 days ago', '1 week ago', '2 weeks ago'][Math.floor(Math.random() * 5)],
      phone: '+91 ' + ['98765', '87654', '76543', '65432', '54321'][Math.floor(Math.random() * 5)] + String(100000 + i).slice(-5),
      dataSource: ['Bank API Gateway', 'KYC Records', 'Credit Bureau Report', 'UPI Transaction History', 'Branch Collection', 'Mobile Banking App'][Math.floor(Math.random() * 6)],
    });
  }
  return customers;
}

const nameFirst = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Pranav', 'Dhruv', 'Krishna', 'Shaurya', 'Reyansh', 'Ayaan', 'Ananya', 'Diya', 'Ishita', 'Aadhya', 'Pari', 'Sara', 'Myra', 'Anaya', 'Aarushi', 'Kavya', 'Sanya', 'Tanvi', 'Advik', 'Kabir', 'Rudra', 'Ranveer', 'Yash', 'Dev', 'Aarush', 'Rohan', 'Siddharth', 'Virat', 'Amit', 'Rajesh', 'Suresh', 'Priya', 'Neha', 'Pooja', 'Shankar', 'Manjunath', 'Basavaraj', 'Kiran', 'Vinay', 'Naveen', 'Ravi', 'Sachin', 'Umesh', 'Girish', 'Shweta', 'Spoorthi', 'Pallavi', 'Deepa', 'Ankita'];

const nameLast = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Verma', 'Gupta', 'Joshi', 'Reddy', 'Nair', 'Kapoor', 'Malhotra', 'Mehta', 'Shah', 'Das', 'Bose', 'Choudhury', 'Banerjee', 'Iyer', 'Menon', 'Desai', 'Hegde', 'Shetty', 'Pai', 'Kamath', 'Rao', 'Acharya', 'Naik', 'Gouda', 'Patil', 'Kulkarni'];

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? <span key={i} className="bg-primary-600/30 text-primary-200 font-semibold rounded px-0.5">{part}</span> : part
  );
}

function getRandomName(i: number): string {
  return `${nameFirst[i % nameFirst.length]} ${nameLast[i % nameLast.length]}`;
}



// ─── HELPER FUNCTIONS ────────────────────────────────────
function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

function getRiskColor(risk: string): string {
  if (risk === 'Low Risk') return 'badge-green';
  if (risk === 'Medium Risk') return 'badge-yellow';
  return 'badge-red';
}

// ─── MAIN COMPONENT ─────────────────────────────────────
export default function Home() {
  const [customers, setCustomers] = useState(() => generateCustomers());
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'salary' | 'savings' | 'expenses' | 'name'>('salary');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);



  // Scheduler: Check last refresh date and auto-refresh if needed
  useEffect(() => {
    const stored = localStorage.getItem('bank_analyser_last_refresh');
    const now = new Date();
    const today = now.toDateString();
    
    if (stored !== today) {
      // Generate fresh data
      setCustomers(generateCustomers());
      localStorage.setItem('bank_analyser_last_refresh', today);
    }
    
    setLastUpdated(now.toLocaleString('en-IN', { hour12: false }));
    
    // Auto-refresh every 5 minutes while page is open
    const interval = setInterval(() => {
      setCustomers(generateCustomers());
      setLastUpdated(new Date().toLocaleString('en-IN', { hour12: false }));
      // Track refresh count
      const count = parseInt(localStorage.getItem('bank_analyser_refresh_count') || '0') + 1;
      localStorage.setItem('bank_analyser_refresh_count', String(count));
      setRefreshKey((k) => k + 1);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  function handleRefresh() {
    setCustomers(generateCustomers());
    setLastUpdated(new Date().toLocaleString('en-IN', { hour12: false }));
    localStorage.setItem('bank_analyser_last_refresh', new Date().toDateString());
    setRefreshKey((k) => k + 1);
  }
  
  // 9am scheduler check - runs on page load
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    // If it's past 9am and not yet refreshed today, refresh
    if ((hours > 9 || (hours === 9 && mins >= 0)) && localStorage.getItem('bank_analyser_last_refresh') !== now.toDateString()) {
      setCustomers(generateCustomers());
      setLastUpdated(now.toLocaleString('en-IN', { hour12: false }));
      localStorage.setItem('bank_analyser_last_refresh', now.toDateString());
      setRefreshKey((k) => k + 1);
    }
  }, []);
  const [showDetails, setShowDetails] = useState(false);
  const [view, setView] = useState<'customers' | 'analysis'>('customers');

  const filtered = useMemo(() => {
    let result = [...customers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.bank.toLowerCase().includes(q) || c.occupation.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.accountNumber.includes(q));
    }
    if (bankFilter !== 'All') result = result.filter((c) => c.bank === bankFilter);
    if (cityFilter !== 'All') result = result.filter((c) => c.city === cityFilter);
    if (riskFilter !== 'All') result = result.filter((c) => c.riskProfile === riskFilter);
    result.sort((a, b) => {
      const mul = sortDir === 'desc' ? -1 : 1;
      if (sortBy === 'name') return mul * a.name.localeCompare(b.name);
      return mul * (a[sortBy] - b[sortBy]);
    });
    return result;
  }, [search, bankFilter, cityFilter, riskFilter, sortBy, sortDir, refreshKey, customers]);

  // Analysis data
  const analysis = useMemo(() => {
    const bankStats: Record<string, { customers: number; avgSalary: number; avgExpenses: number; avgSavings: number; totalLoans: number }> = {};
    const cityStats: Record<string, number> = {};
    const riskDistribution = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
    const occupationStats: Record<string, number> = {};
    let totalSalary = 0, totalExpenses = 0, totalSavings = 0, totalLoans = 0;

    customers.forEach((c) => {
      if (!bankStats[c.bank]) bankStats[c.bank] = { customers: 0, avgSalary: 0, avgExpenses: 0, avgSavings: 0, totalLoans: 0 };
      bankStats[c.bank].customers++;
      bankStats[c.bank].avgSalary += c.salary;
      bankStats[c.bank].avgExpenses += c.totalExpenses;
      bankStats[c.bank].avgSavings += c.savings;
      if (c.loanActive) bankStats[c.bank].totalLoans += c.loanAmount;

      cityStats[c.city] = (cityStats[c.city] || 0) + 1;
      riskDistribution[c.riskProfile as keyof typeof riskDistribution]++;
      occupationStats[c.occupation] = (occupationStats[c.occupation] || 0) + 1;
      totalSalary += c.salary;
      totalExpenses += c.totalExpenses;
      totalSavings += c.savings;
      if (c.loanActive) totalLoans += c.loanAmount;
    });

    Object.keys(bankStats).forEach((b) => {
      const s = bankStats[b];
      s.avgSalary = Math.round(s.avgSalary / s.customers);
      s.avgExpenses = Math.round(s.avgExpenses / s.customers);
      s.avgSavings = Math.round(s.avgSavings / s.customers);
    });

    const avgBudget = Math.round(customers.reduce((s, c) => s + c.monthlyBudget, 0) / customers.length);
    const avgExpense = Math.round(customers.reduce((s, c) => s + c.totalExpenses, 0) / customers.length);

    return { bankStats, cityStats, riskDistribution, occupationStats, totalSalary, totalExpenses, totalSavings, totalLoans, avgBudget, avgExpense };
  }, []);

  // ─── CUSTOMER DETAIL MODAL ─────────────────────────────
  function CustomerModal({ customer }: { customer: any }) {
    const expenses = [
      { label: 'Rent', value: customer.rent, icon: '🏠' },
      { label: 'Groceries', value: customer.groceries, icon: '🛒' },
      { label: 'Transport', value: customer.transport, icon: '🚗' },
      { label: 'Utilities', value: customer.utilities, icon: '💡' },
      { label: 'Healthcare', value: customer.healthcare, icon: '🏥' },
      { label: 'Entertainment', value: customer.entertainment, icon: '🎬' },
      { label: 'Education', value: customer.education, icon: '📚' },
      { label: 'Dining', value: customer.dining, icon: '🍽️' },
      { label: 'Shopping', value: customer.shopping, icon: '🛍️' },
      { label: 'Insurance', value: customer.insurance, icon: '🛡️' },
      { label: 'EMI', value: customer.emi, icon: '🏦' },
      { label: 'Travel', value: customer.travel, icon: '✈️' },
    ];
    const maxExpense = Math.max(...expenses.map((e) => e.value));

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedCustomer(null)}>
        <div className="bg-dark-700 rounded-2xl border border-dark-500 max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="p-6 border-b border-dark-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 border-2 border-primary-400/30 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary-500/20">
                  {customer.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{customer.name}</h2>
                  <p className="text-sm text-gray-400">{customer.occupation} · {customer.city}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>📱 {customer.phone}</span>
                    <span>·</span>
                    <span>📋 {customer.dataSource}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-400">{formatINR(customer.salary)}</p>
                <p className="text-xs text-gray-500">Monthly Income</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Left: Profile */}
            <div className="col-span-1 space-y-4">
              <div className="card py-3 px-4 space-y-2">
                <h4 className="text-xs font-medium text-gray-400 uppercase">Account Details</h4>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Bank</span><span className="text-white">{customer.bank}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Account</span><span className="text-white">{customer.accountType} {customer.accountNumber}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="text-white">{customer.phone}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Since</span><span className="text-white">{customer.customerSince}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Accounts</span><span className="text-white">{customer.accounts}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Gender</span><span className="text-white">{customer.gender}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Age</span><span className="text-white">{customer.age}</span></div>
                <div className="mt-2 pt-2 border-t border-dark-500">
                  <p className="text-[10px] text-gray-600">Data Source: <span className="text-gray-400">{customer.dataSource}</span></p>
                </div>
              </div>

              <div className="card py-3 px-4 space-y-2">
                <h4 className="text-xs font-medium text-gray-400 uppercase">Credit</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Score</span>
                  <span className={`text-sm font-semibold ${customer.creditScore > 750 ? 'text-emerald-400' : customer.creditScore > 700 ? 'text-amber-400' : 'text-red-400'}`}>{customer.creditScore}</span>
                </div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Risk</span><span className={`text-xs ${getRiskColor(customer.riskProfile)}`}>{customer.riskProfile}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Loan Active</span><span className={customer.loanActive ? 'text-amber-400' : 'text-gray-500'}>{customer.loanActive ? 'Yes' : 'No'}</span></div>
                {customer.loanActive && (<><div className="flex justify-between text-sm"><span className="text-gray-500">Loan Type</span><span className="text-white">{customer.loanType}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Loan Amount</span><span className="text-red-400">{formatINR(customer.loanAmount)}</span></div></>)}
                <div className="flex justify-between text-sm"><span className="text-gray-500">Last Tx</span><span className="text-white">{customer.lastTransaction}</span></div>
              </div>
            </div>

            {/* Right: Budget + Expenses */}
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="card text-center py-3"><p className="text-xs text-gray-500">Budget</p><p className="text-lg font-bold text-white">{formatINR(customer.monthlyBudget)}</p></div>
                <div className="card text-center py-3"><p className="text-xs text-gray-500">Spent</p><p className="text-lg font-bold text-amber-400">{formatINR(customer.totalExpenses)}</p></div>
                <div className="card text-center py-3"><p className="text-xs text-gray-500">Saved</p><p className="text-lg font-bold text-emerald-400">{formatINR(customer.savings)}</p></div>
              </div>

              <div className="card py-3 px-4">
                <h4 className="text-xs font-medium text-gray-400 uppercase mb-3">Expense Breakdown</h4>
                {expenses.filter((e) => e.value > 0).map((exp) => (
                  <div key={exp.label} className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span><span className="mr-1">{exp.icon}</span>{exp.label}</span>
                      <span className="text-gray-300">{formatINR(exp.value)}</span>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(exp.value / maxExpense) * 100}%`, backgroundColor: exp.value > 10000 ? '#ef4444' : exp.value > 5000 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card py-3 px-4">
                <h4 className="text-xs font-medium text-gray-400 uppercase">Insights</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">{customer.savingsPct > 20 ? '✅' : '⚠️'} Savings rate: <strong>{customer.savingsPct}%</strong> {customer.savingsPct > 20 ? '(Good)' : '(Needs improvement)'}</li>
                  <li className="flex items-center gap-2">{customer.creditScore > 700 ? '✅' : '⚠️'} Credit score: <strong>{customer.creditScore}</strong> {customer.creditScore > 750 ? '(Excellent)' : customer.creditScore > 700 ? '(Fair)' : '(Poor)'}</li>
                  {customer.loanActive && <li className="flex items-center gap-2">💰 Active {customer.loanType} of <strong>{formatINR(customer.loanAmount)}</strong></li>}
                  {customer.totalExpenses > customer.monthlyBudget && <li className="flex items-center gap-2 text-red-400">🔴 Exceeding monthly budget by <strong>{formatINR(customer.totalExpenses - customer.monthlyBudget)}</strong></li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: ANALYSIS VIEW ────────────────────────────
  if (view === 'analysis') {
    const topBanks = Object.entries(analysis.bankStats).sort((a, b) => b[1].avgSalary - a[1].avgSalary);
    const maxBankSalary = topBanks[0]?.[1].avgSalary || 1;
    const topOccupations = Object.entries(analysis.occupationStats).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxOcc = topOccupations[0]?.[1] || 1;

    return (
      <div className="min-h-screen bg-dark-900">
        <nav className="border-b border-dark-500/50 bg-dark-900/80 sticky top-0 z-40"><div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary-400" /><span className="font-bold text-white">Bank Analyzer</span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setView('customers')} className="btn-secondary text-xs py-1.5 px-3"><Users className="w-3 h-3 inline mr-1" />Customers</button>
            <button className="btn-primary text-xs py-1.5 px-3"><BarChart3 className="w-3 h-3 inline mr-1" />Analysis</button>
          </div></div></nav>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <h2 className="text-2xl font-bold text-white">Bank Portfolio Analysis</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="card text-center py-3"><IndianRupee className="w-5 h-5 text-primary-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{formatINR(analysis.totalSalary)}</p><p className="text-[10px] text-gray-500">Total Monthly Income</p></div>
            <div className="card text-center py-3"><TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{formatINR(analysis.totalExpenses)}</p><p className="text-[10px] text-gray-500">Total Expenses</p></div>
            <div className="card text-center py-3"><TrendingDown className="w-5 h-5 text-emerald-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{formatINR(analysis.totalSavings)}</p><p className="text-[10px] text-gray-500">Total Savings</p></div>
            <div className="card text-center py-3"><Banknote className="w-5 h-5 text-red-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{formatINR(analysis.totalLoans)}</p><p className="text-[10px] text-gray-500">Total Loan Portfolio</p></div>
            <div className="card text-center py-3"><Wallet className="w-5 h-5 text-blue-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{formatINR(analysis.avgBudget)}</p><p className="text-[10px] text-gray-500">Avg Budget</p></div>
          </div>

          {/* Bank-wise Analysis */}
          <div className="card py-4 px-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Bank-wise Average Salary</h3>
            <div className="space-y-2.5">
              {topBanks.map(([bank, stats]) => (
                <div key={bank}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-gray-300 truncate">{bank}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-primary-400">{formatINR(stats.avgSalary)}</span>
                      <span className="text-gray-500">{stats.customers} cust</span>
                    </div>
                  </div>
                  <div className="h-4 bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all" style={{ width: `${(stats.avgSalary / maxBankSalary) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Occupation & Risk Distribution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card py-4 px-5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Occupation Distribution</h3>
              <div className="space-y-2">
                {topOccupations.map(([occ, count]) => (
                  <div key={occ} className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 w-32 truncate">{occ}</span>
                    <div className="flex-1 h-3 bg-dark-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: `${(count / maxOcc) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card py-4 px-5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Risk Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analysis.riskDistribution).map(([risk, count]) => {
                  const pct = Math.round((count / customers.length) * 100);
                  const colors: Record<string, string> = { 'Low Risk': 'from-emerald-600 to-emerald-400', 'Medium Risk': 'from-amber-600 to-amber-400', 'High Risk': 'from-red-600 to-red-400' };
                  return (
                    <div key={risk}>
                      <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-300">{risk}</span><span className="text-gray-400">{count} ({pct}%)</span></div>
                      <div className="h-5 bg-dark-600 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${colors[risk]} rounded-full`} style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* City Distribution */}
          <div className="card py-4 px-5">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">City-wise Customer Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysis.cityStats).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                <div key={city} className="bg-dark-600/50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-sm text-white">{city}</span>
                  <span className="badge-blue text-[10px]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: customers VIEW ───────────────────────────
  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="border-b border-dark-500/50 bg-dark-900/80 sticky top-0 z-40"><div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <Building2 className="w-5 h-5 text-primary-400" /><span className="font-bold text-white">Bank Analyzer</span>
        <div className="ml-auto flex gap-2">
          <button className="btn-primary text-xs py-1.5 px-3"><Users className="w-3 h-3 inline mr-1" />Customers</button>
          <button onClick={() => setView('analysis')} className="btn-secondary text-xs py-1.5 px-3"><BarChart3 className="w-3 h-3 inline mr-1" />Analysis</button>
        </div>
      </div></nav>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="card text-center py-2"><p className="text-lg font-bold text-white">{customers.length}</p><p className="text-[10px] text-gray-500">Customers</p></div>
          <div className="card text-center py-2"><p className="text-lg font-bold text-white">{BANKS.length}</p><p className="text-[10px] text-gray-500">Banks</p></div>
          <div className="card text-center py-2"><p className="text-lg font-bold text-primary-400">{formatINR(analysis.avgBudget)}</p><p className="text-[10px] text-gray-500">Avg Budget</p></div>
          <div className="card text-center py-2"><p className="text-lg font-bold text-amber-400">{formatINR(analysis.avgExpense)}</p><p className="text-[10px] text-gray-500">Avg Expense</p></div>
          <div className="card text-center py-2"><p className="text-lg font-bold text-emerald-400">{customers.filter(c => c.savingsPct > 20).length}</p><p className="text-[10px] text-gray-500">High Savers</p></div>
          <div className="card text-center py-2"><p className="text-lg font-bold text-red-400">{customers.filter(c => c.loanActive).length}</p><p className="text-[10px] text-gray-500">Active Loans</p></div>
        </div>

        {/* Live Search - Custom User Search by Name */}
        <div className="card-glow py-4 px-5 border-primary-500/30 bg-gradient-to-br from-primary-600/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-dark-800 border border-primary-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="🔍 Search by name, bank, occupation, city, phone..." autoFocus />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-primary-600/20 text-primary-300 px-3 py-1.5 rounded-full font-medium border border-primary-500/20">
                {filtered.length} results
              </span>
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-500 hover:text-white px-2 py-1 rounded-lg hover:bg-dark-600 transition-all">
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Suggestions */}
          {search && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map((c) => (
                <button key={c.id} onClick={() => setSearch(c.name)} 
                  className="px-2.5 py-1 rounded-full text-[11px] bg-primary-600/10 border border-primary-500/20 text-primary-300 hover:bg-primary-600/20 transition-all">
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Filter Row */}
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} className="input-field text-xs py-1.5 w-28"><option value="All">All Banks</option>{BANKS.map((b) => <option key={b} value={b}>{b}</option>)}</select>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="input-field text-xs py-1.5 w-28"><option value="All">All Cities</option>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input-field text-xs py-1.5 w-24"><option value="All">All Risk</option><option value="Low Risk">Low Risk</option><option value="Medium Risk">Medium Risk</option><option value="High Risk">High Risk</option></select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="input-field text-xs py-1.5 w-24"><option value="salary">Salary</option><option value="savings">Savings</option><option value="expenses">Expenses</option><option value="name">Name</option></select>
            <button onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')} className="btn-secondary text-xs py-1.5 px-2">{sortDir === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />}</button>
          </div>
          
          {/* Search Summary */}
          {search && (
            <div className="mt-2 text-[10px] text-gray-600">
              Searching for "<strong className="text-primary-400">{search}</strong>" across {customers.length} live customer records
              · Matches found in: {customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length} names, {customers.filter(c => c.bank.toLowerCase().includes(search.toLowerCase())).length} banks, {customers.filter(c => c.occupation.toLowerCase().includes(search.toLowerCase())).length} occupations
            </div>
          )}
        </div>

        {/* Customer Cards */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="card text-center py-10"><Users className="w-10 h-10 text-gray-600 mx-auto mb-2" /><p className="text-gray-400 text-sm">No customers matching filters</p></div>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className="card-glow cursor-pointer py-3 px-4 hover:border-primary-500/50 transition-all" onClick={() => setSelectedCustomer(c)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md ring-2 ring-primary-400/20">
                    {c.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-6 gap-1 text-sm items-center">
                    <div className="col-span-1">
                      <p className="text-white font-medium truncate">{search ? highlightText(c.name, search) : c.name}</p>
                      <p className="text-[10px] text-gray-500">{c.occupation}</p>
                    </div>
                    <div className="hidden md:block col-span-1">
                      <p className="text-gray-400 text-xs">{c.phone}</p>
                      <p className="text-[9px] text-gray-600">{c.dataSource}</p>
                    </div>
                    <div><p className="text-primary-400 text-xs">{formatINR(c.salary)}</p><p className="text-[9px] text-gray-500">Salary</p></div>
                    <div><p className="text-amber-400 text-xs">{formatINR(c.totalExpenses)}</p><p className="text-[9px] text-gray-500">Expenses</p></div>
                    <div><p className="text-emerald-400 text-xs">{formatINR(c.savings)}</p><p className="text-[9px] text-gray-500">Sav {c.savingsPct}%</p></div>
                    <div className="hidden lg:block col-span-1">
                      <p className="text-gray-300 text-xs truncate">{c.bank}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9px] ${getRiskColor(c.riskProfile)}`}>{c.riskProfile}</span>
                        <span className="text-[9px] text-gray-600">{c.city}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <button onClick={() => {
            const csv = [['Name', 'Phone', 'Bank', 'Occupation', 'City', 'Salary', 'Expenses', 'Savings', 'Budget', 'Risk', 'Credit Score', 'Loan Active', 'Loan Amount', 'Data Source'].join(','),
              ...filtered.map((c: any) => [c.name, c.phone, c.bank, c.occupation, c.city, c.salary, c.totalExpenses, c.savings, c.monthlyBudget, c.riskProfile, c.creditScore, c.loanActive, c.loanAmount, c.dataSource].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bank_customers.csv'; a.click();
          }} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><DownloadCloud className="w-3 h-3" /> Export CSV</button>
        </div>
      </div>

      {selectedCustomer && <CustomerModal customer={selectedCustomer} />}
    </div>
  );
}
