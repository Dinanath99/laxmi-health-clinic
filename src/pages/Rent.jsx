import React, { useState, useEffect } from "react";
import { Plus, Building, Home, Trash2, CalendarDays, Loader2, IndianRupee } from "lucide-react";
import api from "../api";
import NepaliDate from "nepali-datetime";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

export default function Rent() {
  const [rents, setRents] = useState([]);
  const [filterType, setFilterType] = useState("All"); // 'All', 'Room', 'Clinic'
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [date, setDate] = useState(new NepaliDate().format("YYYY-MM-DD"));
  const [month, setMonth] = useState("");
  const [type, setType] = useState("Room");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchRents();
  }, [filterType]);

  const fetchRents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/rent?type=${filterType}`);
      setRents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/rent", {
        date,
        month,
        type,
        amount: Number(amount),
        remarks,
      });
      setShowForm(false);
      resetForm();
      fetchRents();
    } catch (err) {
      alert("Failed to add rent record.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rent entry?")) {
      try {
        await api.delete(`/rent/${id}`);
        fetchRents();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  const resetForm = () => {
    setType("Room");
    setAmount("");
    setMonth("");
    setRemarks("");
  };

  const getNepaliMonths = () => [
    "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
  ];

  const totalRent = rents.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="w-full relative z-10 animate-fade-in-down max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Building className="text-blue-600" size={32} /> Rent Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Track Room Rent & Clinic Rent Payments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition"
        >
          <Plus size={20} /> {showForm ? "Cancel Entry" : "New Rent Payment"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-fade-in-down">
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Rent Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold outline-none text-slate-700"
            >
              <option value="Room">Room Rent</option>
              <option value="Clinic">Clinic Rent</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Date</label>
            <NepaliDatePicker
              inputClassName="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition-colors"
              value={date}
              onChange={(value) => setDate(value)}
              options={{ calenderLocale: "ne", valueLocale: "en" }}
            />
          </div>
          <div>
             <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">For Month</label>
             <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold outline-none text-slate-700"
              >
                <option value="">Select Month</option>
                {getNepaliMonths().map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
            </select>
          </div>
          <div>
             <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Amount (Rs.)</label>
             <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
              placeholder="e.g. 25000"
             />
          </div>
          <div>
             <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-xl transition shadow-sm">
                Save Record
             </button>
          </div>
        </form>
      )}

      {/* Overview Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Home size={100} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Room Rent Paid</p>
            <h3 className="text-4xl font-black text-emerald-600">
               Rs. {(rents.filter(r => r.type === "Room").reduce((s, r)=> s + r.amount, 0)).toLocaleString()}
            </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Building size={100} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Clinic Rent Paid</p>
            <h3 className="text-4xl font-black text-blue-600">
               Rs. {(rents.filter(r => r.type === "Clinic").reduce((s, r)=> s + r.amount, 0)).toLocaleString()}
            </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex bg-slate-50 border-b border-slate-200 p-2 gap-2">
            <button 
               onClick={() => setFilterType("All")}
               className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${filterType === "All" ? 'bg-white shadow border border-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >All Records</button>
            <button 
               onClick={() => setFilterType("Room")}
               className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${filterType === "Room" ? 'bg-white shadow border border-slate-200 text-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >Room Rent Logs</button>
            <button 
               onClick={() => setFilterType("Clinic")}
               className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${filterType === "Clinic" ? 'bg-white shadow border border-slate-200 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >Clinic Rent Logs</button>
        </div>
        
        {isLoading ? (
            <div className="p-16 flex justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin" />
            </div>
        ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse whitespace-nowrap">
                   <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                           <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Date</th>
                           <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Type</th>
                           <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Paid Month</th>
                           <th className="px-6 py-4 text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.15em] text-right">Amount (Rs.)</th>
                           <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                       {rents.length === 0 ? (
                           <tr>
                               <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-bold">
                                   No rent records found.
                               </td>
                           </tr>
                       ) : (
                           rents.map((r) => (
                               <tr key={r._id} className="hover:bg-slate-50/50 transition-colors group">
                                   <td className="px-6 py-4 font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                       <CalendarDays className="text-slate-400" size={16} /> {r.date}
                                   </td>
                                   <td className="px-6 py-4 font-bold">
                                       {r.type === "Room" ? (
                                           <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded border border-emerald-200 text-xs shadow-sm flex items-center gap-1 w-max">
                                               <Home size={12} strokeWidth={3} /> Room Rent
                                           </span>
                                       ) : (
                                           <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-200 text-xs shadow-sm flex items-center gap-1 w-max">
                                               <Building size={12} strokeWidth={3} /> Clinic Rent
                                           </span>
                                       )}
                                   </td>
                                   <td className="px-6 py-4 text-slate-600 font-medium">
                                       For <strong className="text-slate-800">{r.month}</strong>
                                   </td>
                                   <td className="px-6 py-4 text-right font-black text-rose-600 tabular-nums">
                                       {r.amount.toLocaleString()}
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(r._id)} className="text-rose-500 hover:text-rose-700 bg-white shadow-sm border border-slate-200 hover:border-rose-300 p-2 rounded-lg transition" title="Delete Entry">
                                            <Trash2 size={16} />
                                        </button>
                                      </div>
                                   </td>
                               </tr>
                           ))
                       )}
                   </tbody>
               </table>
            </div>
        )}
      </div>

    </div>
  );
}
