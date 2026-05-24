import React, { useState, useEffect } from 'react';
import { Users, FileText, ArrowLeft, Plus, Edit2, Trash2, X, Printer } from 'lucide-react';
import api from '../api';
import NepaliDate from 'nepali-datetime';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

export default function Suppliers() {
  const [summary, setSummary] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // Ledger View State
  const [ledgerTxs, setLedgerTxs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [date, setDate] = useState(new NepaliDate().format('YYYY-MM-DD'));
  const [type, setType] = useState('Bill (Debit)');
  const [description, setDescription] = useState('');
  const [debit, setDebit] = useState('');
  const [credit, setCredit] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [notes, setNotes] = useState('');

  // New Supplier Form State
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [supplierData, setSupplierData] = useState({ name: '', address: '', phone: '', email: '' });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/suppliers/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openLedger = async (supplier) => {
    setSelectedSupplier(supplier);
    fetchLedger(supplier._id);
  };

  const fetchLedger = async (id) => {
    try {
      const res = await api.get(`/suppliers/${id}/ledger`);
      setLedgerTxs(res.data.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrUpdateTx = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        date, 
        type, 
        description, 
        debit: Number(debit) || 0, 
        credit: Number(credit) || 0, 
        openingBalance: openingBalance !== '' ? Number(openingBalance) : null,
        notes 
      };
      if (editingId) {
        await api.put(`/suppliers/${selectedSupplier._id}/ledger/${editingId}`, payload);
      } else {
        await api.post(`/suppliers/${selectedSupplier._id}/ledger`, payload);
      }
      resetForm();
      fetchLedger(selectedSupplier._id);
      fetchSummary(); // Refresh summary in background
    } catch (err) {
      alert('Failed saving transaction');
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx._id);
    setDate(tx.date.split('T')[0]);
    setType(tx.type);
    setDescription(tx.description);
    setDebit(tx.debit);
    setCredit(tx.credit);
    setOpeningBalance(tx.openingBalance !== null && tx.openingBalance !== undefined ? tx.openingBalance : '');
    setNotes(tx.notes);
    setShowForm(true);
  };

  const handleDelete = async (txId) => {
    if (window.confirm('Delete this ledger record?')) {
      try {
        await api.delete(`/suppliers/${selectedSupplier._id}/ledger/${txId}`);
        fetchLedger(selectedSupplier._id);
        fetchSummary();
      } catch (err) {
        alert('Failed deleting transaction');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setDebit('');
    setCredit('');
    setOpeningBalance('');
    setDescription('');
    setNotes('');
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!supplierData.name) return alert('Name is required');
    try {
      if (editSupplierId) {
        await api.put(`/suppliers/${editSupplierId}`, supplierData);
      } else {
        await api.post('/suppliers', supplierData);
      }
      setShowSupplierForm(false);
      setEditSupplierId(null);
      setSupplierData({ name: '', address: '', phone: '', email: '' });
      fetchSummary();
    } catch (err) {
      alert('Failed saving supplier');
    }
  };

  const handleEditSupplier = (e, sup) => {
    e.stopPropagation();
    // Assuming summary endpoint returns these fields, need fetching raw from API or we can just hope we have everything? 
    // Wait, the /summary API does not return phone/address/email! So we need to re-fetch the single supplier. Wait, we don't have GET /:id. We can just fill name and leave others blank or they will wipe.
    // Actually wait, let's get the master supplier data. If we click a row to fetch summary, we just have sup.name in the summary loop.
    // Let's implement fetch from ledger endpoint which returns supplier data!
    api.get(`/suppliers/${sup._id}/ledger`).then(res => {
        const s = res.data.supplier;
        setSupplierData({ name: s.name || '', address: s.address || '', phone: s.phone || '', email: s.email || '' });
        setEditSupplierId(s._id);
        setShowSupplierForm(true);
    });
  };

  const handleDeleteSupplier = async (e, supId) => {
    e.stopPropagation();
    if (window.confirm('Delete this supplier completely? This acts permanently on all their ledge records too!')) {
      try {
        await api.delete(`/suppliers/${supId}`);
        fetchSummary();
      } catch (err) {
        alert('Failed to delete supplier');
      }
    }
  };

  if (selectedSupplier) {
    const totalDr = ledgerTxs.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const totalCr = ledgerTxs.reduce((sum, tx) => sum + (tx.credit || 0), 0);
    const finalBalance = ledgerTxs.length > 0 ? ledgerTxs[0].balance : 0;

    return (
      <div className="w-full relative z-10 animate-fade-in-down">
        <button onClick={() => setSelectedSupplier(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition print:hidden">
           <ArrowLeft size={18} /> Back to Supplier Summary
        </button>

        <div className="flex justify-between items-center mb-6 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{selectedSupplier.name}</h1>
            <p className="text-slate-500 mt-1">Detailed Supplier Ledger Sheet</p>
          </div>
          <div className="flex gap-3">
             <button
               onClick={() => window.print()}
               className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm transition"
             >
               <Printer size={20} /> Print Ledger
             </button>
             <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition">
               {showForm ? 'Cancel Form' : <><Plus size={18} /> New Entry</>}
             </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-fade-in-down">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText md={20} className="text-blue-600" /> {editingId ? 'Edit Transaction' : 'New Transaction Record'}
                </h2>
                {editingId && <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"><X size={20}/></button>}
             </div>
            <form onSubmit={handleCreateOrUpdateTx} className="grid grid-cols-1 md:grid-cols-8 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500">Date</label>
                <NepaliDatePicker
                  inputClassName="w-full p-2 border rounded-lg focus:ring-blue-500"
                  className=""
                  value={date}
                  onChange={(value) => setDate(value)}
                  options={{ calenderLocale: "ne", valueLocale: "en" }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-blue-500">
                  <option value="Bill (Debit)">Bill (Debit)</option>
                  <option value="Payment (Credit)">Payment (Credit)</option>
                  <option value="Opening Balance">Opening Balance</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="text-xs font-bold text-slate-500">Description / Details</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Bill SI-0819" className="w-full p-2 border rounded-lg focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                 <label className="text-xs font-bold text-slate-500 flex items-center gap-1">Op. Bal <span className="text-slate-400 text-[9px] lowercase font-semibold">(optional)</span></label>
                 <input type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} placeholder="0" className="w-full p-2 border rounded-lg focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500">Debit (NPR)</label>
                <input type="number" value={debit} onChange={e => setDebit(e.target.value)} placeholder="0" className="w-full p-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500">Credit (NPR)</label>
                <input type="number" value={credit} onChange={e => setCredit(e.target.value)} placeholder="0" className="w-full p-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500">Notes (Date ref)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="md:col-span-8 mt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200">
                  {editingId ? 'Save Changes' : 'Post Entry'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden print:hidden">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-800 backdrop-blur-md border-b border-slate-700">
              <tr>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Date (BS)</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Type</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Description / Details</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em] text-right">Debit (NPR)</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em] text-right">Credit (NPR)</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-rose-300 uppercase tracking-[0.15em] text-right border-l border-slate-700/50 hover:bg-slate-800/80 transition-colors">Balance (NPR)</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Notes</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {ledgerTxs.length === 0 ? (
                <tr><td colSpan="8" className="p-12 text-center text-slate-400 font-semibold tracking-wide">No entries recorded for this supplier.</td></tr>
              ) : ledgerTxs.map((tx) => (
                <tr key={tx._id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-5 py-3 font-medium">{tx.date.split('T')[0]}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type.includes('Debit') ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">{tx.description}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-600">{tx.debit > 0 ? tx.debit.toLocaleString() : '0'}</td>
                  <td className="px-5 py-3 text-right font-bold text-emerald-600">{tx.credit > 0 ? tx.credit.toLocaleString() : '0'}</td>
                  <td className="px-5 py-3 text-right font-black text-rose-600 bg-rose-50/30 border-l border-slate-100">{tx.balance.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs italic">{tx.notes}</td>
                  <td className="px-5 py-3">
                     <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(tx)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded transition"><Edit2 size={15}/></button>
                        <button onClick={() => handleDelete(tx._id)} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-1.5 rounded transition"><Trash2 size={15}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Print View: Dot Matrix Style summary ledger */}
      <div className="hidden print:block font-mono text-xs w-full bg-white text-black bg-transparent">
        <div className="text-left mb-2 leading-tight">
          GARUDA -4 RAUTAHAT<br/>
          GARUDA<br/>
          LEDGER<br/>
          {selectedSupplier.name.toUpperCase()} A/C<br/>
          garuda nagarpalika,shivnagar<br/>
        </div>
        <div className="border-t-2 border-b-2 border-dashed border-black py-1 my-1 flex">
          <div className="w-[15%]">MITI</div>
          <div className="w-[45%] text-center">PARTICULARS</div>
          <div className="w-[15%] text-right pr-4">AMOUNT DR.</div>
          <div className="w-[15%] text-right pr-4">AMOUNT CR.</div>
          <div className="w-[10%] text-right">BALANCE</div>
        </div>
        
        {/* Reversed because txs are normally sorted descending for UI */}
        {[...ledgerTxs].reverse().map((tx) => (
          <div key={tx._id} className="flex py-0.5 whitespace-pre">
            <div className="w-[15%]">{tx.date.split("T")[0]}</div>
            <div className="w-[45%] truncate">{tx.type === 'Opening Balance' ? "Opening Balance..B/F" : (tx.description || "To SUPPLIER BILL")}</div>
            <div className="w-[15%] text-right pr-4">{tx.debit > 0 ? tx.debit.toFixed(2) : ''}</div>
            <div className="w-[15%] text-right pr-4">{tx.credit > 0 ? tx.credit.toFixed(2) : ''}</div>
            <div className="w-[10%] text-right">{tx.balance.toFixed(2)} Dr</div>
          </div>
        ))}
        
        <div className="border-t-2 border-b-2 border-dashed border-black py-1 my-2 flex font-bold mt-4">
          <div className="w-[60%] text-right pr-8 font-black">TOTALS ........................</div>
          <div className="w-[15%] text-right pr-4">{totalDr.toFixed(2)}</div>
          <div className="w-[15%] text-right pr-4">{totalCr.toFixed(2)}</div>
          <div className="w-[10%] text-right">{finalBalance.toFixed(2)} Dr</div>
        </div>
      </div>

    </div>
  );
  }

  // --- Summary View ---
  const grandDebit = summary.reduce((a, b) => a + b.totalDebit, 0);
  const grandCredit = summary.reduce((a, b) => a + b.totalCredit, 0);
  const grandDue = summary.reduce((a, b) => a + b.balanceDue, 0);

  return (
    <div className="w-full relative z-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">All Supplier Dues Summary</h1>
          <p className="text-slate-500 mt-1">Master view of all supplier payable relationships and sheet history.</p>
        </div>
        <button onClick={() => setShowSupplierForm(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition">
          <Plus size={18} /> New Supplier
        </button>
      </div>
      
      {showSupplierForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-down">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Users className="text-emerald-600" size={24} /> {editSupplierId ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <button onClick={() => { setShowSupplierForm(false); setEditSupplierId(null); setSupplierData({ name: '', address: '', phone: '', email: '' }); }} className="text-slate-400 hover:text-rose-500 transition"><X size={24}/></button>
             </div>
            <form onSubmit={handleCreateSupplier} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Supplier Name *</label>
                <input type="text" value={supplierData.name} onChange={e => setSupplierData({...supplierData, name: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Enter supplier name" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Address</label>
                <input type="text" value={supplierData.address} onChange={e => setSupplierData({...supplierData, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Supplier address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Phone</label>
                  <input type="text" value={supplierData.phone} onChange={e => setSupplierData({...supplierData, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Phone number" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Email</label>
                  <input type="email" value={supplierData.email} onChange={e => setSupplierData({...supplierData, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Email address" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 mt-4 rounded-xl transition shadow-lg shadow-emerald-200">
                {editSupplierId ? 'Save Changes' : 'Save Supplier'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Supplier / Party</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right border-l border-slate-200/50">Total Debit</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Total Credit</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-rose-500 uppercase tracking-[0.15em] text-right bg-blue-50/30">Balance Due</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Entries</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
            {summary.length === 0 ? (
               <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-semibold tracking-wide">No suppliers configured.</td></tr>
            ) : summary.map((sup, index) => (
              <tr key={sup._id} onClick={() => openLedger(sup)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                <td className="px-6 py-4 font-bold text-blue-600 flex items-center gap-2">
                  <Users size={16} /> {sup.name}
                  <span className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 ml-2 transition">View Sheet →</span>
                </td>
                <td className="px-6 py-4 text-right border-l border-slate-100">{sup.totalDebit.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">{sup.totalCredit.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-black text-rose-600 bg-rose-50/20">{sup.balanceDue.toLocaleString()}</td>
                <td className="px-6 py-4 text-center font-bold text-slate-400">{sup.entriesCount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${sup.status === '⚠ Due' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {sup.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2">
                        <button onClick={(e) => handleEditSupplier(e, sup)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded transition"><Edit2 size={15}/></button>
                        <button onClick={(e) => handleDeleteSupplier(e, sup._id)} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-1.5 rounded transition"><Trash2 size={15}/></button>
                     </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-800 text-white font-bold">
             <tr>
               <td className="px-6 py-4 uppercase">GRAND TOTAL</td>
               <td className="px-6 py-4 text-right">{grandDebit.toLocaleString()}</td>
               <td className="px-6 py-4 text-right">{grandCredit.toLocaleString()}</td>
               <td className="px-6 py-4 text-right text-rose-300">{grandDue.toLocaleString()}</td>
               <td className="px-6 py-4"></td>
               <td className="px-6 py-4"></td>
               <td className="px-6 py-4"></td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
