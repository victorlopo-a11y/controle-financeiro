
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Fluxo de Caixa & Serviços</h2>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
          {transactions.length} Registros
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Descrição / Pet</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold">Responsável</th>
              <th className="px-6 py-4 font-semibold text-right">Valor</th>
              <th className="px-6 py-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  Nenhuma transação registrada.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-800">{t.description}</div>
                    {t.petName && (
                      <div className="text-xs text-indigo-500 font-medium">
                        <i className="fa-solid fa-paw mr-1"></i> {t.petName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.userName}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
