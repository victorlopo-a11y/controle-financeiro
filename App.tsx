
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, InventoryItem } from './types';
import { INITIAL_DATA } from './constants.tsx';
import DashboardCards from './components/DashboardCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FinancialChart from './components/FinancialChart';
import InventoryManager from './components/InventoryManager';
import VoiceAssistant from './components/VoiceAssistant';
import { analyzeFinances } from './services/geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('petfinance_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('petfinance_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'inventory'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('petfinance_data', JSON.stringify(transactions));
    localStorage.setItem('petfinance_inventory', JSON.stringify(inventory));
  }, [transactions, inventory]);

  const addTransaction = (newT: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newT,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.petName && t.petName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [transactions, searchTerm]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await analyzeFinances(transactions);
      setAiAnalysis(result);
    } catch (err) {
      setAiAnalysis("Erro ao gerar análise. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceCommand = (text: string) => {
    console.log("Comando de voz detectado:", text);
    // Aqui poderíamos processar o texto com outra chamada Gemini para extrair dados estruturados
    // Por enquanto, apenas exibimos um alerta para feedback visual
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white pt-8 pb-16 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-3 rounded-2xl shadow-inner">
              <i className="fa-solid fa-paw text-indigo-600 text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">PetFinance <span className="text-indigo-200">Pro</span></h1>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Gestão Inteligente de Pet Shop</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleAiAnalysis}
              disabled={isAnalyzing}
              className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl hover:scale-105 active:scale-95 ${
                isAnalyzing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2 text-indigo-500`}></i>
              {isAnalyzing ? 'Analisando Negócio...' : 'Gerar Insight IA'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 mb-8">
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
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4">
        
        {/* AI Insight Box */}
        {aiAnalysis && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-8 rounded-3xl mb-8 relative animate-in fade-in slide-in-from-top duration-500 shadow-sm">
            <button 
              onClick={() => setAiAnalysis(null)}
              className="absolute top-6 right-6 text-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="flex items-start space-x-6">
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 shrink-0">
                <i className="fa-solid fa-brain text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-indigo-900 font-black text-lg mb-3">Relatório Estratégico da IA</h3>
                <div className="text-indigo-800 text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {aiAnalysis}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <DashboardCards transactions={transactions} />
            <FinancialChart transactions={transactions} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Buscar por descrição ou nome do pet..."
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
            <InventoryManager items={inventory} onUpdate={setInventory} />
          </div>
        )}
      </main>

      {/* Floating Voice Assistant */}
      <VoiceAssistant onCommand={handleVoiceCommand} />

      <footer className="mt-20 text-center text-slate-400 text-sm pb-12">
        <div className="flex justify-center space-x-4 mb-4">
          <i className="fa-solid fa-shield-cat text-indigo-200 text-2xl"></i>
        </div>
        <p className="font-semibold tracking-wide uppercase text-xs">© 2024 PetFinance Pro - Tecnologia para Pet Shops</p>
        <p className="mt-2 text-slate-300">Inteligência Artificial aplicada ao seu negócio.</p>
      </footer>
    </div>
  );
};

export default App;
