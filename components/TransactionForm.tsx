import React, { useMemo, useState } from 'react';
import { PaymentMethod, ServiceCategory, Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.BATH);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [cardType, setCardType] = useState<'Crédito' | 'Débito'>('Crédito');
  const [clientName, setClientName] = useState('');
  const [petName, setPetName] = useState('');
  const [staffName, setStaffName] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'monthly'>('none');
  const [notes, setNotes] = useState('');

  const categories = useMemo(() => {
    return type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      date,
      description,
      amount: parseFloat(amount),
      type,
      category,
      paymentMethod,
      cardType: paymentMethod === PaymentMethod.CARD ? cardType : undefined,
      clientName: clientName || undefined,
      staffName: staffName || undefined,
      petName: petName || undefined,
      recurrence,
      recurrenceId: recurrence === 'monthly' ? crypto.randomUUID() : undefined,
      notes: notes || undefined
    });

    setDescription('');
    setAmount('');
    setClientName('');
    setPetName('');
    setStaffName('');
    setRecurrence('none');
    setNotes('');
    setCardType('Crédito');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <i className="fa-solid fa-plus-circle text-indigo-500 mr-2"></i>
        Novo Lançamento
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-calendar-days mr-2 text-indigo-500"></i>Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-pen-to-square mr-2 text-indigo-500"></i>Descrição
          </label>
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
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-coins mr-2 text-indigo-500"></i>Valor (R$)
          </label>
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
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-right-left mr-2 text-indigo-500"></i>Tipo
          </label>
          <select 
            value={type}
            onChange={(e) => {
              const newType = e.target.value as TransactionType;
              setType(newType);
              const defaultCategory = newType === TransactionType.INCOME ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
              setCategory(defaultCategory);
            }}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
          >
            <option value={TransactionType.INCOME}>Entrada (+)</option>
            <option value={TransactionType.EXPENSE}>Saída (-)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-tag mr-2 text-indigo-500"></i>Categoria
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value as ServiceCategory)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-credit-card mr-2 text-indigo-500"></i>
            Forma de Pagamento
          </label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {paymentMethod === PaymentMethod.CARD && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo do Cartão</label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value as 'Crédito' | 'Débito')}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
            >
              <option value="Crédito">Crédito</option>
              <option value="Débito">Débito</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-user mr-2 text-indigo-500"></i>Cliente (opcional)
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Nome do cliente"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-paw mr-2 text-indigo-500"></i>Pet (opcional)
          </label>
          <input 
            type="text" 
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Nome do pet"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-user-gear mr-2 text-indigo-500"></i>Responsável (opcional)
          </label>
          <input
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Atendente / responsável"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-repeat mr-2 text-indigo-500"></i>Recorrência
          </label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as 'none' | 'monthly')}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
          >
            <option value="none">Não recorrente</option>
            <option value="monthly">Mensal</option>
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            <i className="fa-solid fa-note-sticky mr-2 text-indigo-500"></i>Observações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            rows={2}
            placeholder="Detalhes adicionais do serviço ou despesa"
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
