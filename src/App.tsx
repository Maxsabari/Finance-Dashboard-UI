import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Search, 
  Lightbulb, AlertCircle, ArrowUpRight, BarChart3, LayoutDashboard 
} from 'lucide-react';

// Types
type TransactionType = 'income' | 'expense';
type Role = 'viewer' | 'admin';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
}

// Initial Mock Data
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-01', amount: 5000, category: 'Salary', type: 'income', description: 'October Salary' },
  { id: '2', date: '2023-10-02', amount: 120, category: 'Groceries', type: 'expense', description: 'Whole Foods' },
  { id: '3', date: '2023-10-05', amount: 85, category: 'Entertainment', type: 'expense', description: 'Netflix & Spotify' },
  { id: '4', date: '2023-10-10', amount: 1500, category: 'Rent', type: 'expense', description: 'Monthly Rent' },
  { id: '5', date: '2023-10-15', amount: 300, category: 'Freelance', type: 'income', description: 'Design Project' },
  { id: '6', date: '2023-10-18', amount: 60, category: 'Transport', type: 'expense', description: 'Uber' },
  { id: '7', date: '2023-10-22', amount: 200, category: 'Dining', type: 'expense', description: 'Dinner with friends' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });
  const [role, setRole] = useState<Role>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0]
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Derived state
  const { totalBalance, totalIncome, totalExpenses } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'income') {
          acc.totalIncome += curr.amount;
          acc.totalBalance += curr.amount;
        } else {
          acc.totalExpenses += curr.amount;
          acc.totalBalance -= curr.amount;
        }
        return acc;
      },
      { totalBalance: 0, totalIncome: 0, totalExpenses: 0 }
    );
  }, [transactions]);

  // Chart data
  const chartData = useMemo(() => {
    // Sort transactions by date
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    return sorted.map(t => {
      currentBalance += t.type === 'income' ? t.amount : -t.amount;
      return {
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: currentBalance,
        amount: t.amount
      };
    });
  }, [transactions]);

  // Pie chart data
  const expensesByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => filterType === 'all' || t.type === filterType)
      .filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  // Insights
  const highestCategory = expensesByCategory[0]?.name || 'N/A';
  const saveRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date
    };

    setTransactions([...transactions, newTransaction]);
    setIsModalOpen(false);
    setFormData({
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "finance_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div className="icon-wrapper balance">
            <Wallet size={24} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>FinDash</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}>
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a href="#transactions" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: 'var(--text-secondary)', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}>
            <BarChart3 size={20} />
            Transactions
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header animate-fade-in">
          <div className="title-container">
            <h1>Overview</h1>
            <p>Track and manage your financial activity.</p>
          </div>
          <div className="user-actions">
            <select 
              className="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="admin">Admin Role</option>
              <option value="viewer">Viewer Role</option>
            </select>
            <button className="btn-secondary" onClick={handleExport}>
              Export Data
            </button>
            <button 
              className="btn-primary" 
              disabled={role === 'viewer'}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              New Transaction
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="glass-panel summary-card animate-fade-in delay-100">
              <div className="summary-card-header">
                <div className="icon-wrapper balance">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="summary-value">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="summary-label">Total Balance</div>
            </div>

            <div className="glass-panel summary-card animate-fade-in delay-200">
              <div className="summary-card-header">
                <div className="icon-wrapper income">
                  <TrendingUp size={20} />
                </div>
                <div className="summary-trend trend-positive">
                  <ArrowUpRight size={14} /> +2.5%
                </div>
              </div>
              <div className="summary-value">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="summary-label">Total Income</div>
            </div>

            <div className="glass-panel summary-card animate-fade-in delay-300">
              <div className="summary-card-header">
                <div className="icon-wrapper expense">
                  <TrendingDown size={20} />
                </div>
              </div>
              <div className="summary-value">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="summary-label">Total Expenses</div>
            </div>
          </div>

          <div className="charts-area">
            {/* Balance Trend */}
            <div className="glass-panel animate-fade-in delay-100">
              <h3 className="section-title">Balance Trend</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categorical & AI Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel animate-fade-in delay-200" style={{ flex: 1 }}>
                <h3 className="section-title">Spending by Category</h3>
                <div style={{ height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        formatter={(value: number) => `$${value}`}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', color: '#f8fafc' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel animate-fade-in delay-300">
                <h3 className="section-title">AI Insights</h3>
                <div className="insights-list">
                  <div className="insight-item">
                    <div className="insight-icon"><Lightbulb size={18} /></div>
                    <div className="insight-text">
                      <h4>Highest Spending</h4>
                      <p>You spend mostly on <strong>{highestCategory}</strong>.</p>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon"><AlertCircle size={18} /></div>
                    <div className="insight-text">
                      <h4>Savings Rate</h4>
                      <p>You're saving <strong>{saveRate}%</strong> of your income.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div id="transactions" className="glass-panel transactions-section animate-fade-in delay-300">
            <div className="transactions-header">
              <h3 className="section-title" style={{ marginBottom: 0 }}>Recent Transactions</h3>
              <div className="filters-wrapper">
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="search-input"
                    style={{ paddingLeft: '36px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="role-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No transactions found matching your criteria.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(t => (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ fontWeight: 500 }}>{t.description}</td>
                        <td><span className="category-tag">{t.category}</span></td>
                        <td className={`amount ${t.type}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {isModalOpen && role === 'admin' && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 className="section-title">Add Transaction</h3>
            <form onSubmit={handleAddTransaction}>
              <div className="form-group">
                <label>Type</label>
                <select 
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="e.g. Grocery shopping"
                />
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
