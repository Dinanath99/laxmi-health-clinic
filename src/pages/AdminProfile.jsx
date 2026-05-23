import React, { useState, useEffect } from "react";
import { ShieldCheck, Trash2, RotateCcw, AlertTriangle, Search, Activity, UserCog } from "lucide-react";
import api from "../api";
import NepaliDate from "nepali-datetime";

export default function AdminProfile() {
  const [trashItems, setTrashItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState({ name: "Admin", email: "admin@clinic.com" });

  useEffect(() => {
    fetchTrash();
    // Assuming simple config fallback since we didn't build profile fetch API
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) setUserProfile(u);
      } catch (e) {}
    }
  }, []);

  const fetchTrash = async () => {
    try {
      const res = await api.get("/trash");
      setTrashItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Restore this item to its original location?")) {
      try {
        await api.post(`/trash/${id}/restore`);
        fetchTrash();
      } catch (err) {
        alert("Restore failed. Structure might be incompatible.");
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this item? This CANNOT be undone.")) {
      try {
        await api.delete(`/trash/${id}`);
        fetchTrash();
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const emptyTrash = async () => {
    if (window.confirm("Are you incredibly sure? This will wipe the ENTIRE recycle bin!")) {
      try {
        await api.delete("/trash");
        fetchTrash();
      } catch (err) {
        alert("Failed to empty trash.");
      }
    }
  };

  const filteredTrash = trashItems.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.collectionName?.toLowerCase().includes(q) ||
      item.documentName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full relative z-10 animate-fade-in-down">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] border-4 border-slate-700">
            <UserCog size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{userProfile.name}</h1>
            <p className="text-blue-300 font-semibold mb-2">{userProfile.email}</p>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              <ShieldCheck size={14} /> Master Admin
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-8 md:mt-0 relative z-10">
           <div className="bg-slate-800/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Backup Vault</p>
              <p className="text-3xl font-black text-rose-400">{trashItems.length}</p>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Trash2 className="text-rose-500" /> System Recycle Bin
          </h2>
          <p className="text-slate-500 font-semibold">Recover accidentally deleted records from any module.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search deleted items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
            />
          </div>
          {trashItems.length > 0 && (
            <button
              onClick={emptyTrash}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
            >
              <AlertTriangle size={18} /> Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Trash Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Deleted Item Details</th>
                <th className="px-6 py-4">Module (Source)</th>
                <th className="px-6 py-4">Deletion Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredTrash.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                     <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <Activity size={40} className="text-slate-200 mb-2" />
                        <p className="font-semibold text-lg text-slate-500">Recycle Bin is empty.</p>
                        <p className="text-sm">Items deleted across the platform will safely appear here.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredTrash.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-800">{item.documentName || "Unknown Record"}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {item.originalId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide border border-blue-100">
                        {item.collectionName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-semibold">
                      {new NepaliDate(new Date(item.deletedAt)).format("YYYY-MM-DD")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRestore(item._id)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2 rounded-xl transition flex items-center gap-1 font-bold text-xs"
                          title="Restore Record"
                        >
                          <RotateCcw size={16} /> Restore
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition"
                          title="Delete Permanently"
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
