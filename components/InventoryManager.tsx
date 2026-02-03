
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  onUpdate: (items: InventoryItem[]) => void;
}

const InventoryManager: React.FC<Props> = ({ items, onUpdate }) => {
  const [newItem, setNewItem] = useState({ name: '', quantity: '', minQuantity: '', price: '' });

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity) return;
    
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: newItem.name,
      quantity: parseInt(newItem.quantity),
      minQuantity: parseInt(newItem.minQuantity) || 5,
      price: parseFloat(newItem.price) || 0
    };
    
    onUpdate([...items, item]);
    setNewItem({ name: '', quantity: '', minQuantity: '', price: '' });
  };

  const deleteItem = (id: string) => {
    onUpdate(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    onUpdate(items.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <i className="fa-solid fa-boxes-stacked text-indigo-500 mr-2"></i>
          Novo Item no Estoque
        </h2>
        <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Nome do Produto"
            value={newItem.name}
            onChange={e => setNewItem({...newItem, name: e.target.value})}
            className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input 
            type="number" 
            placeholder="Qtd Inicial"
            value={newItem.quantity}
            onChange={e => setNewItem({...newItem, quantity: e.target.value})}
            className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input 
            type="number" 
            placeholder="Qtd Mínima"
            value={newItem.minQuantity}
            onChange={e => setNewItem({...newItem, minQuantity: e.target.value})}
            className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
            Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Quantidade</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                <td className="px-6 py-4">
                  {item.quantity <= item.minQuantity ? (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">Estoque Baixo</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">OK</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-minus"></i></button>
                    <span className="font-bold text-slate-700 w-8">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-plus"></i></button>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager;
