import React, { useState } from 'react';
import { InventoryItem, InventoryMovement } from '../types';

interface Props {
  items: InventoryItem[];
  onUpdate: (items: InventoryItem[]) => void;
  movements: InventoryMovement[];
  onMovement: (movements: InventoryMovement[]) => void;
  currentUserId?: string;
}

const InventoryManager: React.FC<Props> = ({ items, onUpdate, movements, onMovement, currentUserId }) => {
  const [newItem, setNewItem] = useState({ name: '', quantity: '', minQuantity: '', price: '' });
  const [movementItemId, setMovementItemId] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjust'>('out');
  const [movementQty, setMovementQty] = useState('');
  const [movementNote, setMovementNote] = useState('');

  const lowStockItems = items.filter(item => item.quantity <= 3);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity) return;
    
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      userId: currentUserId,
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

  const addMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementItemId || !movementQty) return;
    const qty = Math.max(0, parseInt(movementQty));
    if (!qty) return;

    onUpdate(items.map(i => {
      if (i.id !== movementItemId) return i;
      if (movementType === 'in') return { ...i, quantity: i.quantity + qty };
      if (movementType === 'out') return { ...i, quantity: Math.max(0, i.quantity - qty) };
      return { ...i, quantity: qty };
    }));

    const newMovement: InventoryMovement = {
      id: crypto.randomUUID(),
      itemId: movementItemId,
      userId: currentUserId,
      date: new Date().toISOString(),
      type: movementType,
      quantity: qty,
      note: movementNote || undefined
    };
    onMovement([newMovement, ...movements].slice(0, 200));

    setMovementQty('');
    setMovementNote('');
  };

  const updateQuantity = (id: string, delta: number) => {
    onUpdate(items.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i));
  };

  return (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
          <div className="font-bold mb-1">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            Alerta: estoque baixo
          </div>
          <div className="text-sm">
            {lowStockItems.map(item => `${item.name} (${item.quantity} un.)`).join(' • ')}
          </div>
        </div>
      )}
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

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <i className="fa-solid fa-arrows-rotate text-indigo-500 mr-2"></i>
          Movimentação de Estoque
        </h2>
        <form onSubmit={addMovement} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Item</label>
            <select
              value={movementItemId}
              onChange={(e) => setMovementItemId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            >
              <option value="">Selecione...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as 'in' | 'out' | 'adjust')}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="in">Entrada</option>
              <option value="out">Saída</option>
              <option value="adjust">Ajuste</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Quantidade</label>
            <input
              type="number"
              value={movementQty}
              onChange={(e) => setMovementQty(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Observação</label>
            <input
              type="text"
              value={movementNote}
              onChange={(e) => setMovementNote(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: uso no banho"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
              Registrar movimentação
            </button>
          </div>
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-slate-800 font-bold">Histórico de Movimentações</h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
            {movements.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-center">Qtd</th>
                <th className="px-6 py-4">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              ) : (
                movements.slice(0, 20).map(m => {
                  const item = items.find(i => i.id === m.itemId);
                  const label = m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Saída' : 'Ajuste';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(m.date).toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{label}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">{m.quantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{m.note || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
