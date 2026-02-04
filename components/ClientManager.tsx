import React, { useState } from 'react';
import { Client } from '../types';

interface Props {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
  currentUserId?: string;
}

const ClientManager: React.FC<Props> = ({ clients, onUpdate, currentUserId }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  const addClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newClient: Client = {
      id: crypto.randomUUID(),
      userId: currentUserId,
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    onUpdate([newClient, ...clients]);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  const deleteClient = (id: string) => {
    onUpdate(clients.filter(c => c.id !== id));
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <i className="fa-solid fa-user-plus text-indigo-500 mr-2"></i>
          Novo Cliente
        </h2>
        <form onSubmit={addClient} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nome do cliente"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Telefone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="email@cliente.com"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Observações</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Preferências, cuidados, etc."
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
              Cadastrar cliente
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-slate-800">Clientes</h2>
          <div className="relative w-full md:w-72">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Buscar cliente"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Observações</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{client.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{client.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{client.notes || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteClient(client.id)} className="text-slate-300 hover:text-red-500">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientManager;
