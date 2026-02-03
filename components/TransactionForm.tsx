
import React, { useState } from 'react';
import { TransactionType, ServiceCategory, Transaction } from '../types';
import { USERS } from '../constants';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.BATH);
  const [userName, setUserName] = useState(USERS[0]);
  const [petName, setPetName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      date: new Date().toISOString().split('T')[0],
      description,
      amount: parseFloat(amount),
      type,
      category,
      userName,
      petName: petName || undefined
    });

    setDescription('');
    setAmount('');
    setPetName('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <i className="fa-solid fa-plus-circle text-indigo-500 mr-2"></i>
        Novo Lançamento
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</label>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Ex: Banho do Thor"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor (R$)</label>
          <input 
            type="number" 
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
          >
            <option value={TransactionType.INCOME}>Entrada (+)</option>
            <option value={TransactionType.EXPENSE}>Saída (-)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value as ServiceCategory)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
          >
            {Object.values(ServiceCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Responsável</label>
          <select 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
          >
            {USERS.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome do Pet (Opcional)</label>
          <input 
            type="text" 
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Nome do animalzinho"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center"
          >
            <i className="fa-solid fa-check mr-2"></i>
            Confirmar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
