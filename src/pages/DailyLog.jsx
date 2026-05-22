import React, { useState, useEffect } from "react";
import {
  Plus,
  ListTodo,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  Building2,
  TrendingUp,
  TrendingDown,
  ClipboardList,
} from "lucide-react";
import api from "../api";

export default function DailyLog() {
  const [pharmacies, setPharmacies] = useState([]);
  const [activePharmacy, setActivePharmacy] = useState(null);
  const [newPharmacyName, setNewPharmacyName] = useState("");
  const [showNewPharmacyForm, setShowNewPharmacyForm] = useState(false);

  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const res = await api.get("/dailylog/pharmacies");
      setPharmacies(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPharmacy = async (name) => {
    setActivePharmacy(name);
    fetchLogs(name);
  };

  const handleCreatePharmacy = (e) => {
    e.preventDefault();
    if (newPharmacyName.trim()) {
      if (!pharmacies.includes(newPharmacyName)) {
        setPharmacies([...pharmacies, newPharmacyName]);
      }
      handleSelectPharmacy(newPharmacyName);
      setNewPharmacyName("");
      setShowNewPharmacyForm(false);
    }
  };

  const fetchLogs = async (pharmacyName) => {
    try {
      const res = await api.get(
        `/dailylog?pharmacyName=${encodeURIComponent(pharmacyName)}`,
      );
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBranch = async (e, oldName) => {
    e.stopPropagation();
    const newName = window.prompt("Enter new pharmacy branch name:", oldName);
    if (!newName || newName === oldName) return;
    try {
      await api.put(`/dailylog/pharmacy/${encodeURIComponent(oldName)}`, {
        newName,
      });
      setPharmacies(pharmacies.map((p) => (p === oldName ? newName : p)));
    } catch (err) {
      alert("Failed to rename branch.");
    }
  };

  const handleDeleteBranch = async (e, name) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to completely delete "${name}" and ALL its associated ledger entries? This cannot be undone.`,
      )
    ) {
      try {
        await api.delete(`/dailylog/pharmacy/${encodeURIComponent(name)}`);
        setPharmacies(pharmacies.filter((p) => p !== name));
      } catch (err) {
        alert("Failed to delete branch.");
      }
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        pharmacyName: activePharmacy,
        date,
        income: Number(income) || 0,
        expense: Number(expense) || 0,
        notes,
      };

      if (editingId) {
        await api.put(`/dailylog/${editingId}`, payload);
      } else {
        await api.post("/dailylog", payload);
      }

      resetForm();
      fetchLogs(activePharmacy);
    } catch (err) {
      alert("Error saving daily log.");
      console.error(err);
    }
  };

  const handleEdit = (log) => {
    setEditingId(log._id);
    setDate(new Date(log.date).toISOString().split("T")[0]);
    setIncome(log.income);
    setExpense(log.expense);
    setNotes(log.notes);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this log entry?",
      )
    ) {
      try {
        await api.delete(`/dailylog/${id}`);
        fetchLogs(activePharmacy);
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setIncome("");
    setExpense("");
    setNotes("");
  };

  if (!activePharmacy) {
    return (
      <div className="w-full relative z-10 animate-fade-in-down">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Ledger Accounts
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Select a pharmacy branch to view and manage its daily sell and
              expenditure logs.
            </p>
          </div>
          <button
            onClick={() => setShowNewPharmacyForm(!showNewPharmacyForm)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold shadow-md transition"
          >
            <Plus size={18} /> New Branch
          </button>
        </div>

        {showNewPharmacyForm && (
          <form
            onSubmit={handleCreatePharmacy}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-end gap-4 max-w-xl animate-fade-in-down"
          >
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                Pharmacy / Branch Name
              </label>
              <input
                type="text"
                value={newPharmacyName}
                onChange={(e) => setNewPharmacyName(e.target.value)}
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="e.g. Risika Pharmacy Shivnagar"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-sm"
            >
              Create
            </button>
          </form>
        )}

        {pharmacies.length === 0 && !showNewPharmacyForm ? (
          <div className="bg-white border-2 border-slate-100 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
             <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Building2 size={40} className="text-blue-500" />
             </div>
             <p className="text-xl font-extrabold text-slate-800">No Branches Exist Yet</p>
             <p className="text-slate-500 font-medium mt-2 max-w-sm">You haven't defined any clinic branches. Click 'New Branch' above to register your first ledger account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {pharmacies.map((pharmacy) => (
               <div key={pharmacy} onClick={() => handleSelectPharmacy(pharmacy)} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px] relative">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <button onClick={(e) => handleEditBranch(e, pharmacy)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Rename branch">
                       <Edit2 size={16} />
                     </button>
                     <button onClick={(e) => handleDeleteBranch(e, pharmacy)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete branch">
                       <Trash2 size={16} />
                     </button>
                  </div>
                  <div className="flex justify-between items-start">
                     <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Building2 size={24} strokeWidth={2.5} />
                     </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors pr-10">{pharmacy}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Ledger Entry Book</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  // Active Pharmacy Ledger View
  return (
    <div className="w-full relative z-10 animate-fade-in-down">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => {
            setActivePharmacy(null);
            setLogs([]);
          }}
          className="bg-white text-slate-600 hover:text-blue-600 p-2.5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {activePharmacy}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Daily Sell & Expenditure Ledger
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition"
          >
            {showForm ? (
              "Close Form"
            ) : (
              <>
                <Plus size={18} /> New Entry
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200 mb-8 animate-fade-in-down">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <ListTodo size={20} className="text-blue-600" />{" "}
              {editingId ? "Edit Entry" : "Create New Entry"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-rose-500 rounded-lg p-1"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <form
            onSubmit={handleCreateOrUpdate}
            className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end"
          >
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Date (BS/AD)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Income (Rs.)
              </label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition-colors"
                placeholder="e.g. 25000"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Exp. (Rs.)
              </label>
              <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition-colors"
                placeholder="e.g. 5000"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Remarks (Notes)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition-colors"
                placeholder="Optional descriptions"
              />
            </div>
            <div className="md:col-span-4 mt-2">
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center gap-2"
              >
                <ClipboardList size={18} />{" "}
                {editingId
                  ? "Update Ledger Entry"
                  : "Save Entry directly into Ledger"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                  S.N.
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.15em] text-right">
                  Income
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-rose-600 uppercase tracking-[0.15em] text-right">
                  Exp.
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.15em] text-right">
                  Total Balance
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                  Remarks
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="inline-block p-4 bg-slate-50 rounded-full mb-3">
                      <ClipboardList size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-bold tracking-wide">
                      Ledger is completely empty.
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Add your first income/expenditure entry above.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr
                    key={log._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-extrabold text-slate-400 group-hover:text-blue-500">
                      {index + 1}.
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 tracking-tight">
                      {new Date(log.date).toISOString().split("T")[0]}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.income > 0 ? (
                        <div className="flex items-center justify-end gap-1 text-emerald-600 font-extrabold">
                          <TrendingUp size={14} strokeWidth={3} />{" "}
                          {log.income.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.expense > 0 ? (
                        <div className="flex items-center justify-end gap-1 text-rose-600 font-extrabold">
                          <TrendingDown size={14} strokeWidth={3} />{" "}
                          {log.expense.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-blue-700 text-base tracking-tight bg-blue-50/30">
                      {log.total > 0 ? "+" : ""}
                      {log.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium italic">
                      {log.notes || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-blue-500 hover:text-blue-700 bg-white shadow-sm border border-slate-200 hover:border-blue-300 p-2 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="text-rose-500 hover:text-rose-700 bg-white shadow-sm border border-slate-200 hover:border-rose-300 p-2 rounded-lg transition"
                        >
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
      </div>
    </div>
  );
}
