import React, { useState, useEffect } from 'react';
import { Plus, ListTodo, Edit2, Trash2, X } from 'lucide-react';
import api from '../api';

export default function DailyLog() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/dailylog');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        date, 
        income: Number(income) || 0, 
        expense: Number(expense) || 0, 
        notes 
      };

      if (editingId) {
        await api.put(`/dailylog/${editingId}`, payload);
      } else {
        await api.post('/dailylog', payload);
      }
      
      resetForm();
      fetchLogs();
    } catch (err) {
      alert('Error saving daily log.');
      console.error(err);
    }
  };

  const handleEdit = (log) => {
    setEditingId(log._id);
    setDate(new Date(log.date).toISOString().split('T')[0]);
    setIncome(log.income);
    setExpense(log.expense);
    setNotes(log.notes);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this log entry?")) {
      try {
        await api.delete(`/dailylog/${id}`);
        fetchLogs();
      } catch (err) {
        alert('Failed to delete.');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setIncome('');
    setExpense('');
    setNotes('');
  };

  return (
    <div className="w-full relative z-10">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Daily Sell & Expenditure</h1>
           <p className="text-slate-500 mt-1">Track daily income, expenses, and automatically compute your running totals.</p>
        </div>
        <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition">
          {showForm ? 'Close Form' : <><Plus size={18} /> New Entry</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-fade-in-down">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <ListTodo size={20} className="text-blue-600" /> {editingId ? 'Edit Entry' : 'Create New Entry'}
             </h2>
             {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 rounded-lg p-1"><X size={20}/></button>}
          </div>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date (BS/AD)</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Income (Rs.)</label>
              <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="25000" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Expenditure (Rs.)</label>
              <input type="number" value={expense} onChange={e => setExpense(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="5000" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Remarks</label>
               <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Optional notes" />
            </div>
            <div className="md:col-span-4 mt-2">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200">
                {editingId ? 'Save Changes' : 'Save Daily Record'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">S.N.</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Date</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Income</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Exp.</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Running Total</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Remarks</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
            {logs.length === 0 ? (
               <tr>
                   <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-semibold tracking-wide">No daily sell & expenditure records found.</td>
               </tr>
            ) : logs.map((log, index) => (
              <tr key={log._id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-400">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{new Date(log.date).toISOString().split('T')[0]}</td>
                <td className="px-6 py-4 text-right text-emerald-600 font-bold">{log.income > 0 ? `Rs. ${log.income}` : '-'}</td>
                <td className="px-6 py-4 text-right text-rose-600 font-bold">{log.expense > 0 ? `Rs. ${log.expense}` : '-'}</td>
                <td className="px-6 py-4 text-right font-black text-slate-800 text-lg">Rs. {log.total}</td>
                <td className="px-6 py-4 text-slate-500 italic">{log.notes || '-'}</td>
                <td className="px-6 py-4">
                   <div className="flex justify-center items-center gap-3">
                      <button onClick={() => handleEdit(log)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(log._id)} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-lg transition"><Trash2 size={16}/></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
