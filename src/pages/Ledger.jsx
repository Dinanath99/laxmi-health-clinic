import React, { useState, useEffect } from "react";
import {
  BookText,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowLeft,
  Building2,
} from "lucide-react";
import api from "../api";
import NepaliDate from 'nepali-datetime';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

export default function Ledger() {
  const [ledgers, setLedgers] = useState([]);
  const [activeLedger, setActiveLedger] = useState(null);
  const [newLedgerName, setNewLedgerName] = useState("");
  const [showNewLedgerForm, setShowNewLedgerForm] = useState(false);

  const [txs, setTxs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [date, setDate] = useState(new NepaliDate().format("YYYY-MM-DD"));
  const [particulars, setParticulars] = useState("Cash");
  const [billNo, setBillNo] = useState("");
  const [amountDR, setAmountDR] = useState("");
  const [amountCR, setAmountCR] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      const res = await api.get("/ledger/accounts");
      setLedgers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectLedger = async (name) => {
    setActiveLedger(name);
    fetchTxs(name);
  };

  const handleCreateLedger = (e) => {
    e.preventDefault();
    if (newLedgerName.trim()) {
      if (!ledgers.includes(newLedgerName)) {
        setLedgers([...ledgers, newLedgerName]);
      }
      handleSelectLedger(newLedgerName);
      setNewLedgerName("");
      setShowNewLedgerForm(false);
    }
  };

  const handleEditLedger = async (e, oldName) => {
    e.stopPropagation();
    const newName = window.prompt("Enter new ledger account name:", oldName);
    if (!newName || newName === oldName) return;
    try {
      await api.put(`/ledger/account/${encodeURIComponent(oldName)}`, {
        newName,
      });
      setLedgers(ledgers.map((l) => (l === oldName ? newName : l)));
    } catch (err) {
      alert("Failed to rename ledger.");
    }
  };

  const handleDeleteLedger = async (e, name) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to completely delete the ledger "${name}" and ALL its associated transactions? This cannot be undone.`,
      )
    ) {
      try {
        await api.delete(`/ledger/account/${encodeURIComponent(name)}`);
        setLedgers(ledgers.filter((l) => l !== name));
      } catch (err) {
        alert("Failed to delete ledger schema.");
      }
    }
  };

  const fetchTxs = async (ledgerName) => {
    try {
      const res = await api.get(
        `/ledger?ledgerName=${encodeURIComponent(ledgerName)}`,
      );
      setTxs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ledgerName: activeLedger,
        date,
        particulars,
        billNo,
        amountDR: Number(amountDR) || 0,
        amountCR: Number(amountCR) || 0,
        openingBalance: openingBalance !== "" ? Number(openingBalance) : null,
        remark,
      };

      if (editingId) {
        await api.put(`/ledger/${editingId}`, payload);
      } else {
        await api.post("/ledger", payload);
      }
      resetForm();
      fetchTxs(activeLedger);
    } catch (err) {
      alert("Error saving ledger entry");
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx._id);
    setDate(tx.date.split("T")[0]);
    setParticulars(tx.particulars);
    setBillNo(tx.billNo);
    setAmountDR(tx.amountDR);
    setAmountCR(tx.amountCR);
    setOpeningBalance(tx.openingBalance !== null && tx.openingBalance !== undefined ? tx.openingBalance : "");
    setRemark(tx.remark);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this central ledger record permanently?")) {
      try {
        await api.delete(`/ledger/${id}`);
        fetchTxs(activeLedger);
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setBillNo("");
    setAmountDR("");
    setAmountCR("");
    setOpeningBalance("");
    setRemark("");
  };

  if (!activeLedger) {
    return (
      <div className="w-full relative z-10 animate-fade-in-down">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Supplier Accounts Ledger
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Manage debits, credits, and precise balances for all your medical
              suppliers.
            </p>
          </div>
          <button
            onClick={() => setShowNewLedgerForm(!showNewLedgerForm)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold shadow-md transition"
          >
            <Plus size={18} /> New Ledger
          </button>
        </div>

        {showNewLedgerForm && (
          <form
            onSubmit={handleCreateLedger}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-end gap-4 max-w-xl animate-fade-in-down"
          >
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                Medical Supplier Name
              </label>
              <input
                type="text"
                value={newLedgerName}
                onChange={(e) => setNewLedgerName(e.target.value)}
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="e.g. Gunjan Medical"
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

        {ledgers.length === 0 && !showNewLedgerForm ? (
          <div className="bg-white border-2 border-slate-100 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
              <BookText size={40} className="text-blue-500" />
            </div>
            <p className="text-xl font-extrabold text-slate-800">
              No Supplier Ledgers Exist
            </p>
            <p className="text-slate-500 font-medium mt-2 max-w-sm">
              Click 'New Ledger' above to start tracking debits & credits for a
              medical supplier.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ledgers.map((ledgerName) => (
              <div
                key={ledgerName}
                onClick={() => handleSelectLedger(ledgerName)}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px] relative"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => handleEditLedger(e, ledgerName)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Rename Ledger"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteLedger(e, ledgerName)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Ledger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-shrink-0 bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <BookText size={24} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors pr-10">
                    {ledgerName}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                    Supplier Statements
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Active Ledger View
  return (
    <div className="w-full relative z-10 animate-fade-in-down">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => {
            setActiveLedger(null);
            setTxs([]);
          }}
          className="bg-white text-slate-600 hover:text-blue-600 p-2.5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {activeLedger}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            General journal of all debits, credits, and precise balances.
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
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookText size={20} className="text-blue-600" />{" "}
              {editingId ? "Edit Entry" : "Save New Entry"}
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
            className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end"
          >
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Date (BS/AD)
              </label>
              <NepaliDatePicker
                inputClassName="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition"
                className=""
                value={date}
                onChange={(value) => setDate(value)}
                options={{ calenderLocale: "ne", valueLocale: "en" }}
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Particulars
              </label>
              <select
                value={particulars}
                onChange={(e) => setParticulars(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="Purchase">Purchase</option>
                <option value="Opening Balance">Opening Balance</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                Op. Balance <span className="text-slate-400 text-[9px] lowercase font-semibold">(optional)</span>
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition"
                placeholder="e.g. 10000"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Bill No.
              </label>
              <input
                type="text"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition"
                placeholder="e.g. 1120"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Amount DR.
              </label>
              <input
                type="number"
                value={amountDR}
                onChange={(e) => setAmountDR(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Amount CR.
              </label>
              <input
                type="number"
                value={amountCR}
                onChange={(e) => setAmountCR(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition"
                placeholder="60000"
              />
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                Remark
              </label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-slate-700 transition"
              />
            </div>
            <div className="md:col-span-7 mt-2">
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center gap-2"
              >
                <BookText size={18} />{" "}
                {editingId ? "Save Changes" : "Post to Ledger"}
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
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                  Particulars
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                  Bill No.
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.15em] text-right">
                  Amount DR.
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-rose-600 uppercase tracking-[0.15em] text-right">
                  Amount CR.
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.15em] text-right">
                  Balance
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
                  Remark
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center">
                    <div className="inline-block p-4 bg-slate-50 rounded-full mb-3">
                      <BookText size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-bold tracking-wide">
                      Ledger is completely empty.
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Add your first transaction above.
                    </p>
                  </td>
                </tr>
              ) : (
                txs.map((tx, index) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-extrabold text-slate-400 group-hover:text-blue-500">
                      {txs.length - index}.
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 tracking-tight">
                      {tx.date.split("T")[0]}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-bold">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs tracking-wide">
                        {tx.particulars}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono font-bold text-xs">
                      {tx.billNo || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.amountDR > 0 ? (
                        <span className="text-emerald-600 font-extrabold">
                          {tx.amountDR.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.amountCR > 0 ? (
                        <span className="text-rose-600 font-extrabold">
                          {tx.amountCR.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-blue-700 text-base tracking-tight bg-blue-50/30">
                      {tx.balance.toLocaleString()}/-{" "}
                      <span className="text-[10px] text-blue-400 font-extrabold ml-0.5">
                        CR
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-slate-500 font-medium italic truncate max-w-[150px]"
                      title={tx.remark}
                    >
                      {tx.remark || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="text-blue-500 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-300 shadow-sm p-2 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="text-rose-500 hover:text-rose-700 bg-white border border-slate-200 hover:border-rose-300 shadow-sm p-2 rounded-lg transition"
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
