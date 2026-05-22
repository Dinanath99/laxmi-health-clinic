import React, { useState, useEffect } from 'react';
import { BookText, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../api';

export default function Ledger() {
  const [txs, setTxs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [particulars, setParticulars] = useState('Cash');
  const [billNo, setBillNo] = useState('');
  const [amountDR, setAmountDR] = useState('');
  const [amountCR, setAmountCR] = useState('');
  const [remark, setRemark] = useState('');
  
  useEffect(() => {
    api.get('/ledger').then(res => setTxs(res.data)).catch(console.error);
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await api.get('/ledger');
      setTxs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date,
        particulars,
        billNo,
        amountDR: Number(amountDR) || 0,
        amountCR: Number(amountCR) || 0,
        remark
      };

      if (editingId) {
        await api.put(`/ledger/${editingId}`, payload);
      } else {
        await api.post('/ledger', payload);
      }
      resetForm();
      fetchLedger();
    } catch (err) {
      alert('Error saving ledger entry');
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx._id);
    setDate(new Date(tx.date).toISOString().split('T')[0]);
    setParticulars(tx.particulars);
    setBillNo(tx.billNo);
    setAmountDR(tx.amountDR);
    setAmountCR(tx.amountCR);
    setRemark(tx.remark);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this central ledger record permanently?")) {
      try {
        await api.delete(`/ledger/${id}`);
        fetchLedger();
      } catch (err) {
        alert('Failed to delete.');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setBillNo('');
    setAmountDR('');
    setAmountCR('');
    setRemark('');
  };

  return (
    <div className="w-full relative z-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account Ledger (Gunjan Medical)</h1>
          <p className="text-slate-500 mt-1">General journal of all debits, credits, and precise supplier balances.</p>
        </div>
        <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition">
          {showForm ? 'Close Form' : <><Plus size={18} /> New Entry</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-fade-in-down">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <BookText md={20} className="text-blue-600" /> {editingId ? 'Edit Entry' : 'Save New Entry'}
             </h2>
             {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 rounded-lg p-1"><X size={20}/></button>}
           </div>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date (BS/AD)</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Particulars</label>
              <select value={particulars} onChange={e => setParticulars(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none">
                <option value="Cash">Cash</option>
                <option value="Purchase">Purchase</option>
                <option value="Opening Balance">Opening Balance</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Bill No.</label>
              <input type="text" value={billNo} onChange={e => setBillNo(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="1120" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Amount DR.</label>
              <input type="number" value={amountDR} onChange={e => setAmountDR(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Amount CR.</label>
              <input type="number" value={amountCR} onChange={e => setAmountCR(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="60000" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Remark</label>
               <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div className="md:col-span-6 mt-2">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200">
                {editingId ? 'Save Changes' : 'Post to Ledger'}
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
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Particulars</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Bill No.</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Amount DR.</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Amount CR.</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Balance</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Remark</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
            {txs.length === 0 ? (
               <tr>
                   <td colSpan="9" className="px-6 py-12 text-center text-slate-400 font-semibold tracking-wide">No ledger records found.</td>
               </tr>
            ) : txs.map((tx, index) => (
              <tr key={tx._id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-400">{txs.length - index}</td>
                <td className="px-6 py-4 font-medium text-slate-600">{new Date(tx.date).toISOString().split('T')[0]}</td>
                <td className="px-6 py-4 text-slate-800 bg-slate-50/50">{tx.particulars}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tx.billNo || '-'}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-600">{tx.amountDR > 0 ? `${tx.amountDR}` : ''}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-600">{tx.amountCR > 0 ? `${tx.amountCR}` : ''}</td>
                <td className="px-6 py-4 text-right font-black text-slate-800 text-lg">
                   {tx.balance}/- <span className="text-xs text-slate-400 font-normal ml-1">CR</span>
                </td>
                <td className="px-6 py-4 text-slate-500 italic">{tx.remark || ''}</td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(tx)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded transition"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(tx._id)} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-1.5 rounded transition"><Trash2 size={16}/></button>
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
