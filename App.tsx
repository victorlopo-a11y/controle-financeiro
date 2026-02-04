import React, { useEffect, useMemo, useState } from 'react';
import { Transaction, TransactionType, InventoryItem, InventoryMovement, PaymentMethod, ServiceCategory, Client } from './types';
import { INITIAL_DATA, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from './constants.tsx';
import DashboardCards from './components/DashboardCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FinancialChart from './components/FinancialChart';
import InventoryManager from './components/InventoryManager';
import ClientManager from './components/ClientManager';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import companyLogo from './logo atualizada.png';

type TypeFilter = 'all' | TransactionType;
type CategoryFilter = 'all' | ServiceCategory;
type PaymentFilter = 'all' | PaymentMethod;

const BACKUP_KEY = 'petfinance_backups';
const ADMIN_PASSWORD = 'adm777';
const THEME_KEY = 'petfinance_theme';

const getToday = () => new Date().toISOString().split('T')[0];

const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getSafeDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
};

const mapLegacyCategory = (category: string, type: TransactionType): ServiceCategory => {
  const allCategories = new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as string[]);
  if (allCategories.has(category)) return category as ServiceCategory;
  return type === TransactionType.INCOME ? ServiceCategory.OTHER_SERVICE : ServiceCategory.OTHER_EXPENSE;
};

const normalizeTransaction = (raw: any): Transaction => {
  const type = raw.type === TransactionType.EXPENSE ? TransactionType.EXPENSE : TransactionType.INCOME;
  const category = mapLegacyCategory(raw.category || ServiceCategory.BATH, type);
  const paymentMethod = (PAYMENT_METHODS as string[]).includes(raw.paymentMethod)
    ? raw.paymentMethod
    : PaymentMethod.PIX;

  return {
    id: raw.id || crypto.randomUUID(),
    userId: raw.user_id || raw.userId || undefined,
    date: raw.date || getToday(),
    description: raw.description || '',
    amount: Number(raw.amount) || 0,
    type,
    category,
    paymentMethod,
    clientName: raw.clientName || undefined,
    staffName: raw.staffName || raw.userName || undefined,
    petName: raw.petName || undefined,
    recurrence: raw.recurrence === 'monthly' ? 'monthly' : 'none',
    recurrenceId: raw.recurrenceId || undefined,
    notes: raw.notes || undefined
  };
};

const normalizeClient = (raw: any): Client => {
  return {
    id: raw.id || crypto.randomUUID(),
    userId: raw.user_id || raw.userId || undefined,
    name: raw.name || '',
    phone: raw.phone || undefined,
    email: raw.email || undefined,
    notes: raw.notes || undefined,
    createdAt: raw.created_at || raw.createdAt || undefined
  };
};

const buildRecurringTransactionDate = (referenceDate: string) => {
  const now = new Date();
  const ref = getSafeDate(referenceDate);
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = ref.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, lastDay);
  return new Date(year, month, safeDay).toISOString().split('T')[0];
};

const applyMonthlyRecurrence = (items: Transaction[]) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const existingByRecurrence = new Set(
    items
      .filter(t => t.recurrenceId)
      .map(t => `${t.recurrenceId}-${t.date.slice(0, 7)}`)
  );

  const additions: Transaction[] = [];
  items.forEach((t) => {
    if (t.recurrence === 'monthly' && t.recurrenceId) {
      const key = `${t.recurrenceId}-${currentMonth}`;
      if (!existingByRecurrence.has(key)) {
        additions.push({
          ...t,
          id: crypto.randomUUID(),
          date: buildRecurringTransactionDate(t.date)
        });
      }
    }
  });

  return additions.length ? [...additions, ...items] : items;
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const currentUserId = session?.user?.id;
  const displayName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    '';
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('petfinance_data');
    const base = saved ? JSON.parse(saved).map(normalizeTransaction) : INITIAL_DATA.map(normalizeTransaction);
    return applyMonthlyRecurrence(base);
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('petfinance_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('petfinance_inventory_movements');
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('petfinance_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSyncing, setIsSyncing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'inventory' | 'clients'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(getMonthStart());
  const [dateTo, setDateTo] = useState(getToday());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const loadSupabase = async () => {
      setIsSyncing(true);
      try {
        const [transactionsRes, inventoryRes, movementRes, clientsRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
          supabase.from('inventory_items').select('*').eq('user_id', session.user.id).order('name'),
          supabase.from('inventory_movements').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
          supabase.from('clients').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
        ]);

        if (!transactionsRes.error && transactionsRes.data) {
          setTransactions(transactionsRes.data.map(normalizeTransaction));
        }
        if (!inventoryRes.error && inventoryRes.data) {
          setInventory(inventoryRes.data);
        }
        if (!movementRes.error && movementRes.data) {
          setInventoryMovements(movementRes.data);
        }
        if (!clientsRes.error && clientsRes.data) {
          setClients(clientsRes.data.map(normalizeClient));
        }
      } catch (err) {
        console.error('Supabase load error', err);
      } finally {
        setIsSyncing(false);
      }
    };

    loadSupabase();
  }, [session]);

  useEffect(() => {
    localStorage.setItem('petfinance_data', JSON.stringify(transactions));
    localStorage.setItem('petfinance_inventory', JSON.stringify(inventory));
    localStorage.setItem('petfinance_inventory_movements', JSON.stringify(inventoryMovements));
    localStorage.setItem('petfinance_clients', JSON.stringify(clients));
  }, [transactions, inventory, inventoryMovements, clients]);

  const addTransaction = (newT: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newT,
      id: crypto.randomUUID(),
      userId: currentUserId
    };
    setTransactions(prev => [transaction, ...prev]);
    if (!currentUserId) return;
    const payload = {
      ...transaction,
      user_id: currentUserId
    };
    supabase.from('transactions').insert(payload).then(({ error }) => {
      if (error) console.error('Supabase insert transaction error', error);
    });
  };

  const deleteTransaction = (id: string) => {
    const input = window.prompt('Digite a senha de administrador para excluir:');
    if (!input) return;
    if (input !== ADMIN_PASSWORD) {
      alert('Senha incorreta. Exclusão cancelada.');
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (!currentUserId) return;
    supabase.from('transactions').delete().eq('id', id).eq('user_id', currentUserId).then(({ error }) => {
      if (error) console.error('Supabase delete transaction error', error);
    });
  };

  const updateInventory = (items: InventoryItem[]) => {
    setInventory(items);
    if (!currentUserId) return;
    const payload = items.map(item => ({
      ...item,
      user_id: item.userId || currentUserId
    }));
    supabase.from('inventory_items').upsert(payload, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('Supabase upsert inventory error', error);
    });
  };

  const updateMovements = (items: InventoryMovement[]) => {
    setInventoryMovements(items);
    if (!currentUserId) return;
    const payload = items.map(item => ({
      ...item,
      user_id: item.userId || currentUserId
    }));
    supabase.from('inventory_movements').upsert(payload, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('Supabase upsert movements error', error);
    });
  };

  const updateClients = (items: Client[]) => {
    const removed = clients.filter(c => !items.find(i => i.id === c.id));
    setClients(items);
    if (!currentUserId) return;
    const payload = items.map(item => ({
      ...item,
      user_id: item.userId || currentUserId,
      created_at: item.createdAt || new Date().toISOString()
    }));
    supabase.from('clients').upsert(payload, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('Supabase upsert clients error', error);
    });
    if (removed.length) {
      const ids = removed.map(r => r.id);
      supabase.from('clients').delete().in('id', ids).eq('user_id', currentUserId).then(({ error }) => {
        if (error) console.error('Supabase delete clients error', error);
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const inRange = t.date >= dateFrom && t.date <= dateTo;
      if (!inRange) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

      const query = searchTerm.toLowerCase();
      if (!query) return true;
      return (
        t.description.toLowerCase().includes(query) ||
        (t.petName && t.petName.toLowerCase().includes(query)) ||
        (t.clientName && t.clientName.toLowerCase().includes(query))
      );
    });
  }, [transactions, dateFrom, dateTo, typeFilter, categoryFilter, paymentFilter, searchTerm]);

  const summaryByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const summaryByPayment = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach(t => {
      map.set(t.paymentMethod, (map.get(t.paymentMethod) || 0) + t.amount);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const bestService = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    const top = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];
    return top ? { category: top[0], value: top[1] } : null;
  }, [filteredTransactions]);

  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const months: Array<{ key: string; label: string; income: number; expense: number; profit: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push({ key, label, income: 0, expense: 0, profit: 0 });
    }
    const map = new Map(months.map(m => [m.key, m]));
    transactions.forEach(t => {
      const key = t.date.slice(0, 7);
      const entry = map.get(key);
      if (!entry) return;
      if (t.type === TransactionType.INCOME) entry.income += t.amount;
      else entry.expense += t.amount;
      entry.profit = entry.income - entry.expense;
    });
    return months;
  }, [transactions]);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = [
      'Data',
      'Descrição',
      'Tipo',
      'Categoria',
      'Forma de Pagamento',
      'Valor',
      'Cliente',
      'Pet',
      'Responsável',
      'Recorrência',
      'Observações'
    ];
    const rows = filteredTransactions.map(t => ([
      t.date,
      t.description,
      t.type === TransactionType.INCOME ? 'Entrada' : 'Saída',
      t.category,
      t.paymentMethod,
      t.amount.toFixed(2),
      t.clientName || '',
      t.petName || '',
      t.staffName || '',
      t.recurrence === 'monthly' ? 'Mensal' : 'Não',
      t.notes || ''
    ]));
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    downloadFile(csv, `petfinance-${dateFrom}-a-${dateTo}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      dateFrom,
      dateTo,
      transactions: filteredTransactions,
      inventory
    };
    downloadFile(JSON.stringify(payload, null, 2), `petfinance-${dateFrom}-a-${dateTo}.json`, 'application/json');
  };

  const createBackup = () => {
    const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
    const newBackup = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      transactions,
      inventory
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify([newBackup, ...backups].slice(0, 10)));
    alert('Backup criado com sucesso.');
  };

  const restoreBackupFromFile = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      alert('Arquivo inválido.');
      return;
    }
    setTransactions(data.transactions.map(normalizeTransaction));
    setInventory(data.inventory || []);
    alert('Backup restaurado.');
  };

  const recentBackups = useMemo(() => {
    return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]') as Array<{ id: string; createdAt: string }>;
  }, [transactions]);

  if (!session) {
    return (
      <div className="min-h-screen login-gradient text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-3 rounded-2xl glow-ring">
                <i className="fa-solid fa-paw text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">PetFinance Pro</h1>
                <p className="text-indigo-100 text-sm uppercase tracking-widest">Gestão inteligente de pet shop</p>
              </div>
            </div>
            <p className="text-indigo-100/80 text-lg leading-relaxed max-w-md">
              Controle profissional de lançamentos e estoque. Acesse com segurança para
              acompanhar a rotina do seu pet shop.
            </p>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="text-xs uppercase tracking-widest text-indigo-100">Seguro</div>
                <div className="text-lg font-semibold">Supabase Auth</div>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="text-xs uppercase tracking-widest text-indigo-100">Tempo real</div>
                <div className="text-lg font-semibold">Dados protegidos</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{authMode === 'login' ? 'Entrar' : 'Criar conta'}</h2>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm text-indigo-200 hover:text-white transition-colors"
              >
                {authMode === 'login' ? 'Criar conta' : 'Já tenho conta'}
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!authEmail || !authPassword) return;
                if (authMode === 'login') {
                  const { error } = await supabase.auth.signInWithPassword({
                    email: authEmail,
                    password: authPassword
                  });
                  if (error) alert(error.message);
                } else {
                  const { error } = await supabase.auth.signUp({
                    email: authEmail,
                    password: authPassword,
                    options: {
                      data: {
                        full_name: authName || undefined
                      }
                    }
                  });
                  if (error) alert(error.message);
                  else alert('Conta criada. Verifique seu e-mail para confirmação, se necessário.');
                }
              }}
              className="space-y-5"
            >
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-indigo-100 uppercase mb-2">Nome</label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200"></i>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white placeholder:text-indigo-200/70 focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                      placeholder="Nome do usuário"
                      required
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-indigo-100 uppercase mb-2">Email</label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200"></i>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white placeholder:text-indigo-200/70 focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                    placeholder="email@empresa.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-100 uppercase mb-2">Senha</label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200"></i>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white placeholder:text-indigo-200/70 focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
              >
                {authMode === 'login' ? 'Entrar agora' : 'Criar conta'}
              </button>
            </form>

            <div className="mt-6 text-xs text-indigo-100/70">
              Ao continuar, você concorda com o uso seguro dos dados pela sua equipe.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white pt-10 pb-28 px-4 shadow-lg relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative">
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4">
            <img
              src={companyLogo}
              alt="Logo da empresa"
              className="w-40 h-40 rounded-full shadow-2xl border-4 border-white object-cover"
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white p-3 rounded-2xl shadow-inner">
              <i className="fa-solid fa-paw text-indigo-600 text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">PetFinance <span className="text-indigo-200">Pro</span></h1>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Gestão Inteligente de Pet Shop</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:ml-auto">
            <div className="hidden md:flex items-center bg-white/20 text-white px-3 py-2 rounded-full text-sm font-semibold">
              <i className="fa-solid fa-user mr-2"></i>
              {displayName || 'Defina seu nome'}
            </div>
            {!displayName && (
              <button
                onClick={async () => {
                  const name = window.prompt('Digite o nome que deseja exibir:');
                  if (!name) return;
                  const { error } = await supabase.auth.updateUser({
                    data: { full_name: name }
                  });
                  if (error) {
                    alert('Erro ao salvar nome.');
                  } else {
                    setSession((prev) => (prev ? { ...prev, user: { ...prev.user, user_metadata: { ...prev.user.user_metadata, full_name: name } } } : prev));
                  }
                }}
                className="hidden md:inline-flex bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Definir nome
              </button>
            )}
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center"
              title={isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} mr-2`}></i>
              {isDarkMode ? 'Modo claro' : 'Modo escuro'}
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
        <div className="md:hidden flex justify-center mt-6">
          <img
            src={companyLogo}
            alt="Logo da empresa"
            className="w-32 h-32 rounded-full shadow-2xl border-4 border-white object-cover"
          />
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 -mt-4 mb-6 relative z-10">
        <div className="bg-white p-1 rounded-2xl shadow-md border border-slate-100 flex overflow-hidden">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${activeTab === 'transactions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-list-check"></i>
            <span>Lançamentos</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-boxes-stacked"></i>
            <span>Estoque</span>
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-users"></i>
            <span>Clientes</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
            >
              <option value="all">Todos</option>
              <option value={TransactionType.INCOME}>Entrada</option>
              <option value={TransactionType.EXPENSE}>Saída</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
            >
              <option value="all">Todas</option>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pagamento</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
            >
              <option value="all">Todos</option>
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFrom(getMonthStart());
                setDateTo(getToday());
                setTypeFilter('all');
                setCategoryFilter('all');
                setPaymentFilter('all');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <DashboardCards transactions={filteredTransactions} />
            <FinancialChart transactions={filteredTransactions} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-slate-800 font-bold mb-4">Resumo do Período</h3>
                {bestService ? (
                  <div className="text-sm text-slate-600">
                    Serviço mais rentável: <span className="font-semibold text-indigo-700">{bestService.category}</span>
                    <div className="text-slate-400 text-xs mt-1">R$ {bestService.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Sem dados suficientes no período.</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-slate-800 font-bold mb-4">Por Categoria</h3>
                <div className="space-y-2 text-sm">
                  {summaryByCategory.slice(0, 5).map(([category, value]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-slate-600">{category}</span>
                      <span className="font-semibold text-slate-800">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-slate-800 font-bold mb-4">Por Pagamento</h3>
                <div className="space-y-2 text-sm">
                  {summaryByPayment.map(([method, value]) => (
                    <div key={method} className="flex justify-between">
                      <span className="text-slate-600">{method}</span>
                      <span className="font-semibold text-slate-800">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-slate-800 font-bold mb-4">Comparativo mês a mês</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-2">Mês</th>
                      <th className="py-2 text-right">Entradas</th>
                      <th className="py-2 text-right">Saídas</th>
                      <th className="py-2 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyComparison.map((m) => (
                      <tr key={m.key} className="text-sm">
                        <td className="py-2 font-semibold text-slate-700">{m.label}</td>
                        <td className="py-2 text-right text-green-600">
                          R$ {m.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 text-right text-red-600">
                          R$ {m.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-2 text-right font-semibold ${m.profit >= 0 ? 'text-indigo-700' : 'text-orange-600'}`}>
                          R$ {m.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Buscar por descrição, cliente ou pet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm bg-white"
                />
              </div>
            </div>
            <TransactionForm onAdd={addTransaction} />
            <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="animate-in fade-in duration-700">
            <InventoryManager
              items={inventory}
              onUpdate={updateInventory}
              movements={inventoryMovements}
              onMovement={updateMovements}
              currentUserId={currentUserId}
            />
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="animate-in fade-in duration-700">
            <ClientManager
              clients={clients}
              onUpdate={updateClients}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </main>

      <footer className="mt-20 text-center text-slate-400 text-sm pb-12">
        <div className="flex justify-center space-x-4 mb-4">
          <i className="fa-solid fa-shield-cat text-indigo-200 text-2xl"></i>
        </div>
        <p className="font-semibold tracking-wide uppercase text-xs">© 2024 PetFinance Pro - Tecnologia para Pet Shops</p>
        <p className="mt-2 text-slate-300">Controle financeiro inteligente para serviços.</p>
        {isSyncing && <p className="mt-2 text-xs text-indigo-200">Sincronizando com o banco de dados...</p>}
      </footer>
    </div>
  );
};

export default App;
