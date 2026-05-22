import React, { useState, useEffect } from 'react';
import { Banknote, Users, UserPlus, Phone, MapPin, ArrowLeft, Plus, Edit2, Trash2, X, Info } from 'lucide-react';
import api from '../api';

export default function Salary() {
  const [summary, setSummary] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  // Ledger / Profile View State
  const [payrollTxs, setPayrollTxs] = useState([]);
  const [profileStats, setProfileStats] = useState({ totalPaid: 0, pendingDue: 0 });
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  
  const [editingTxId, setEditingTxId] = useState(null);
  const [nepaliMonths] = useState(["Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"]);
  const [nepaliDate, setNepaliDate] = useState('2083-02-05');
  const [nepaliMonth, setNepaliMonth] = useState('Baishakh');
  const [year, setYear] = useState('2083');
  const [basicSalary, setBasicSalary] = useState('');
  const [netPaid, setNetPaid] = useState('');
  const [pendingDue, setPendingDue] = useState('');
  const [remarks, setRemarks] = useState('');

  // New Staff Registration Form State
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffData, setStaffData] = useState({ name: '', phone: '', address: '', bio: '', baseSalary: '', status: 'Active' });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/salary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openStaffProfile = async (staffId) => {
    try {
      const res = await api.get(`/salary/${staffId}`);
      setSelectedStaff(res.data.staff);
      setPayrollTxs(res.data.payroll);
      setProfileStats({ totalPaid: res.data.totalPaid || 0, pendingDue: res.data.pendingDue || 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrUpdateStaff = async (e) => {
    e.preventDefault();
    if (!staffData.name) return alert('Name is required');
    try {
      const payload = { ...staffData, baseSalary: Number(staffData.baseSalary) || 0 };
      if (editingStaffId) {
        await api.put(`/salary/${editingStaffId}`, payload);
      } else {
        await api.post('/salary', payload);
      }
      setShowStaffForm(false);
      resetStaffForm();
      fetchSummary();
      if (selectedStaff && editingStaffId === selectedStaff._id) {
         openStaffProfile(editingStaffId);
      }
    } catch (err) {
      alert('Failed saving staff profile');
    }
  };

  const resetStaffForm = () => {
    setStaffData({ name: '', phone: '', address: '', bio: '', baseSalary: '', status: 'Active' });
    setEditingStaffId(null);
    setShowStaffForm(false);
  };

  const openStaffEditor = (staff, e) => {
    e.stopPropagation();
    setStaffData({ name: staff.name, phone: staff.phone || '', address: staff.address || '', bio: staff.bio || '', baseSalary: staff.baseSalary || '', status: staff.status || 'Active' });
    setEditingStaffId(staff._id);
    setShowStaffForm(true);
  };

  const handleDeleteStaff = async (staffId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this staff member and ALL associated payroll records?')) {
       try {
         await api.delete(`/salary/${staffId}`);
         fetchSummary();
         if (selectedStaff && selectedStaff._id === staffId) setSelectedStaff(null);
       } catch (err) { alert('Delete failed'); }
    }
  };

  // --- Payroll Transaction Handlers ---
  const handlePostPayroll = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nepaliDate, nepaliMonth, year,
        basicSalary: Number(basicSalary) || 0,
        netPaid: Number(netPaid) || 0, 
        pendingDue: Number(pendingDue) || 0,
        remarks
      };
      
      if (editingTxId) {
        await api.put(`/salary/${selectedStaff._id}/payroll/${editingTxId}`, payload);
      } else {
        await api.post(`/salary/${selectedStaff._id}/payroll`, payload);
      }
      
      resetPayrollForm();
      openStaffProfile(selectedStaff._id);
      fetchSummary(); // refresh totals in bg
    } catch (err) {
      alert('Failed saving payroll entry');
    }
  };

  const handleEditPayroll = (tx) => {
    setNepaliDate(tx.nepaliDate);
    setNepaliMonth(tx.nepaliMonth);
    setYear(tx.year);
    setBasicSalary(tx.basicSalary?.toString() || '');
    setNetPaid(tx.netPaid?.toString() || '');
    setPendingDue(tx.pendingDue?.toString() || '');
    setRemarks(tx.remarks || '');
    setEditingTxId(tx._id);
    setShowPayrollForm(true);
  };

  const handleDeletePayroll = async (txId) => {
    if (window.confirm('Delete this payroll record?')) {
      try {
        await api.delete(`/salary/${selectedStaff._id}/payroll/${txId}`);
        openStaffProfile(selectedStaff._id);
        fetchSummary();
      } catch (err) { alert('Delete failed'); }
    }
  };

  const resetPayrollForm = () => {
    setShowPayrollForm(false);
    setEditingTxId(null);
    setBasicSalary(selectedStaff?.baseSalary?.toString() || '');
    setNetPaid('');
    setPendingDue('');
    setRemarks('');
  };

  if (selectedStaff) {
    return (
      <div className="w-full relative z-10 animate-fade-in-down">
        <button onClick={() => setSelectedStaff(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition">
           <ArrowLeft size={18} /> Back to Staff Register
        </button>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-bl-full -z-10 opacity-70"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                 <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{selectedStaff.name}</h1>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${selectedStaff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{selectedStaff.status}</span>
                 </div>
                 <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
                    {selectedStaff.phone && <span className="flex items-center gap-1.5"><Phone size={14}/> {selectedStaff.phone}</span>}
                    {selectedStaff.address && <span className="flex items-center gap-1.5"><MapPin size={14}/> {selectedStaff.address}</span>}
                 </div>
                 {selectedStaff.bio && <p className="mt-4 text-slate-600 text-sm italic max-w-2xl border-l-2 border-blue-200 pl-3 py-1">{selectedStaff.bio}</p>}
              </div>
              <div className="flex gap-4">
                 <div className="flex flex-col items-end gap-1 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">Total Paid</p>
                    <p className="text-xl font-black text-emerald-700">Rs. {profileStats.totalPaid.toLocaleString()}</p>
                 </div>
                 <div className="flex flex-col items-end gap-1 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <p className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">Pending Due</p>
                    <p className="text-xl font-black text-rose-700">Rs. {profileStats.pendingDue.toLocaleString()}</p>
                 </div>
                 <div className="flex flex-col items-end gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Base Rate</p>
                    <p className="text-xl font-black text-slate-700">Rs. {(selectedStaff.baseSalary || 0).toLocaleString()}</p>
                    <button onClick={(e) => openStaffEditor(selectedStaff, e)} className="text-blue-600 text-xs font-bold hover:underline mt-1">Edit Staff Info</button>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">Payroll History Ledger</h2>
          <button onClick={() => { if(showPayrollForm) resetPayrollForm(); else { setBasicSalary(selectedStaff.baseSalary?.toString()); setShowPayrollForm(true); } }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition">
            {showPayrollForm ? 'Cancel Entry' : <><Plus size={18} /> Issue Salary</>}
          </button>
        </div>

        {showPayrollForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-fade-in-down">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Banknote size={20} className="text-emerald-600" /> New Payroll Posting
                </h2>
                <button onClick={resetPayrollForm} className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"><X size={20}/></button>
             </div>
            <form onSubmit={handlePostPayroll} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date (BS)</label>
                <input type="text" value={nepaliDate} onChange={e => setNepaliDate(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Month / Year Period</label>
                <div className="flex gap-2">
                   <select value={nepaliMonth} onChange={e => setNepaliMonth(e.target.value)} className="w-2/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                     {nepaliMonths.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                   <input type="text" value={year} onChange={e => setYear(e.target.value)} required className="w-1/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl px-2 text-center" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Month Salary (Rs)</label>
                <input type="number" value={basicSalary} onChange={e => {
                   setBasicSalary(e.target.value);
                   const val = Number(e.target.value) || 0;
                   const paidVal = Number(netPaid) || 0;
                   if(!editingTxId) setPendingDue(val - paidVal);
                }} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 block">Amount Paid (Rs)</label>
                <input type="number" value={netPaid} onChange={e => {
                   setNetPaid(e.target.value);
                   const val = Number(e.target.value) || 0;
                   const base = Number(basicSalary) || 0;
                   if(!editingTxId) setPendingDue(base - val);
                }} className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1 block">Pending Due (Rs)</label>
                <input type="number" value={pendingDue} onChange={e => setPendingDue(e.target.value)} className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-rose-700" placeholder="0" />
              </div>
              <div className="md:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Remarks / Notes</label>
                 <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Leave remarks (optional)" />
              </div>
              <div className="md:col-span-2 mt-2">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 transition">
                  {editingTxId ? 'Update Ledger' : 'Post & Issue'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead className="bg-slate-800 backdrop-blur-md border-b border-slate-700">
              <tr>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Date (BS)</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Month Period</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em] text-right">Month Salary</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-emerald-300 uppercase tracking-[0.15em] text-right border-l border-slate-700">Amount Paid</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-rose-300 uppercase tracking-[0.15em] text-right">Pending Due</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Remarks</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.15em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {payrollTxs.length === 0 ? (
                <tr><td colSpan="7" className="p-12 text-center text-slate-400 font-semibold tracking-wide">No salary history recorded for this staff member.</td></tr>
              ) : payrollTxs.map((tx) => (
                <tr key={tx._id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-800">{tx.nepaliDate}</td>
                  <td className="px-6 py-4 bg-slate-50/50 text-slate-500 font-bold">{tx.nepaliMonth} {tx.year}</td>
                  <td className="px-6 py-4 text-right text-slate-600 font-bold">{(tx.basicSalary || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg bg-emerald-50/20 border-l border-slate-100">{(tx.netPaid || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-rose-500 bg-rose-50/20">{(tx.pendingDue || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-400 italic text-xs">{tx.remarks || '-'}</td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditPayroll(tx)} className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-1.5 rounded transition" title="Edit Payroll"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeletePayroll(tx._id)} className="text-rose-400 hover:text-rose-600 bg-rose-50 p-1.5 rounded transition" title="Delete Payroll"><Trash2 size={16}/></button>
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

  // --- Master Staff Summary View ---
  return (
    <div className="w-full relative z-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Staff Master Registry</h1>
          <p className="text-slate-500 mt-1">Manage personnel profiles, biographical info, and their complete payroll ledger.</p>
        </div>
        <button onClick={() => setShowStaffForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition">
          <UserPlus size={18} /> New Staff
        </button>
      </div>
      
      {showStaffForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-xl animate-fade-in-down max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Users className="text-blue-600" size={24} /> {editingStaffId ? 'Update Staff Member' : 'Register New Staff'}
                </h2>
                <button onClick={resetStaffForm} className="text-slate-400 hover:text-rose-500 transition"><X size={24}/></button>
             </div>
            <form onSubmit={handleCreateOrUpdateStaff} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Full Name *</label>
                   <input type="text" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Ramesh Kumar" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Phone</label>
                   <input type="text" value={staffData.phone} onChange={e => setStaffData({...staffData, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Phone" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Status</label>
                   <select value={staffData.status} onChange={e => setStaffData({...staffData, status: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
                     <option value="Active">Active</option>
                     <option value="On Leave">On Leave</option>
                     <option value="Terminated">Terminated</option>
                   </select>
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Address</label>
                   <input type="text" value={staffData.address} onChange={e => setStaffData({...staffData, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Full address" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-xs font-bold text-slate-500 mb-1 block">Biography / Bio / Emergency Contact</label>
                   <textarea value={staffData.bio} onChange={e => setStaffData({...staffData, bio: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-20 resize-none" placeholder="Important details about the staff member..." />
                 </div>
                 <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                     <div>
                        <label className="text-xs font-bold text-blue-700 block mb-1">Standard Base Salary (Monthly)</label>
                        <span className="text-[10px] text-blue-500 font-medium">Used as default value in payroll form</span>
                     </div>
                     <input type="number" value={staffData.baseSalary} onChange={e => setStaffData({...staffData, baseSalary: e.target.value})} className="w-1/2 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold" placeholder="Rs 0" />
                 </div>
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 mt-2 rounded-xl transition shadow-lg shadow-blue-200 text-lg">
                {editingStaffId ? 'Update Profile' : 'Register Member'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Staff Profile</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right border-l border-slate-100">Base Rate</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-emerald-500 uppercase tracking-[0.15em] text-right">Total Paid</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-rose-500 uppercase tracking-[0.15em] text-right">Pending Due</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">History</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
            {summary.length === 0 ? (
               <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-semibold tracking-wide">No staff registered. Click 'New Staff' above.</td></tr>
            ) : summary.map((staff) => (
              <tr key={staff._id} onClick={() => openStaffProfile(staff._id)} className="hover:bg-blue-50/60 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="font-extrabold text-blue-600 text-base">{staff.name}</span>
                      <span className="text-xs text-slate-400 font-semibold mt-0.5">{staff.phone}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : staff.status === 'Terminated' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                    {staff.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-600 border-l border-slate-50">Rs. {(staff.baseSalary || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-black text-emerald-600">Rs. {staff.totalPaid.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-black text-rose-500">Rs. {(staff.pendingDue || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                   <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">{staff.payrollCount} issues</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-center gap-3">
                      <button onClick={(e) => openStaffEditor(staff, e)} className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 p-2 rounded-lg transition" title="Edit Profile"><Edit2 size={16}/></button>
                      <button onClick={(e) => handleDeleteStaff(staff._id, e)} className="text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 p-2 rounded-lg transition" title="Delete Profile"><Trash2 size={16}/></button>
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
