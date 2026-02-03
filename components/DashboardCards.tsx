
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
}

const DashboardCards: React.FC<Props> = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const profit = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="bg-green-100 p-3 rounded-full">
          <i className="fa-solid fa-arrow-up text-green-600 text-xl"></i>
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Total Entradas</p>
          <h3 className="text-2xl font-bold text-slate-800">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="bg-red-100 p-3 rounded-full">
          <i className="fa-solid fa-arrow-down text-red-600 text-xl"></i>
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Total Saídas</p>
          <h3 className="text-2xl font-bold text-slate-800">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className={`p-6 rounded-2xl shadow-sm border flex items-center space-x-4 ${profit >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100'}`}>
        <div className={`${profit >= 0 ? 'bg-indigo-100' : 'bg-orange-100'} p-3 rounded-full`}>
          <i className={`fa-solid ${profit >= 0 ? 'fa-wallet text-indigo-600' : 'fa-triangle-exclamation text-orange-600'} text-xl`}></i>
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Saldo / Lucro</p>
          <h3 className={`text-2xl font-bold ${profit >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>
            R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
