import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, Pill } from 'lucide-react';
import api from '../api';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    batchNo: '',
    quantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    lowStockThreshold: 10
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      batchNo: '',
      quantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      lowStockThreshold: 10
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (med) => {
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      batchNo: med.batchNo || '',
      quantity: med.quantity,
      purchasePrice: med.purchasePrice,
      sellingPrice: med.sellingPrice,
      lowStockThreshold: med.lowStockThreshold || 10
    });
    setEditingId(med._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/medicines/${id}`);
        fetchMedicines();
      } catch (err) {
        alert('Failed deleting item');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, formData);
      } else {
        await api.post('/medicines', formData);
      }
      fetchMedicines();
      resetForm();
    } catch (err) {
      alert('Failed saving item. Please ensure all names are entered correctly.');
    }
  };

  return (
    <div className="w-full relative z-10">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory</h1>
           <p className="text-slate-500 mt-1">Manage stock, prices, and low-inventory alerts.</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition">
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-fade-in-down max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Pill className="text-blue-600" size={24} /> {editingId ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 transition"><X size={24}/></button>
             </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Medicine Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Paracetamol 500mg" />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Generic Name</label>
                <input type="text" value={formData.genericName} onChange={e => setFormData({...formData, genericName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Acetaminophen" />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Batch Number</label>
                <input type="text" value={formData.batchNo} onChange={e => setFormData({...formData, batchNo: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. BATCH-01" />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Purchase Price (NPR) *</label>
                <input type="number" step="0.01" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Selling Price (NPR) *</label>
                <input type="number" step="0.01" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Stock / Quantity *</label>
                <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Low Stock Alert Threshold</label>
                <input type="number" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer" />
              </div>

              <div className="md:col-span-2 mt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-4 rounded-xl transition shadow-lg shadow-blue-200 text-lg">
                  {editingId ? 'Update Record' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Medicine Name</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Batch No.</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Stock Qty</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Purchase Price</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Selling Price</th>
              <th className="px-6 py-5 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
            {medicines.length === 0 ? (
              <tr><td colSpan="6" className="p-12 text-center text-slate-400 font-semibold tracking-wide">No medicines in inventory. Add one above!</td></tr>
            ) : medicines.map(m => (
              <tr key={m._id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-800">{m.name} <br/><span className="text-xs text-slate-500 font-normal">{m.genericName || '-'}</span></td>
                <td className="px-6 py-4 font-mono text-xs">{m.batchNo || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-sm text-xs font-bold tracking-wide ${m.quantity <= m.lowStockThreshold ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {m.quantity} Unit(s)
                    </span>
                    {m.quantity <= m.lowStockThreshold && <AlertTriangle size={14} className="text-orange-500" title="Low Stock" />}
                  </div>
                </td>
                <td className="px-6 py-4">Rs. {m.purchasePrice}</td>
                <td className="px-6 py-4 font-bold text-blue-600">Rs. {m.sellingPrice}</td>
                <td className="px-6 py-4">
                   <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(m)} className="text-slate-400 hover:text-blue-600 transition" title="Edit">
                        <Edit2 size={16}/>
                      </button>
                      <button onClick={() => handleDelete(m._id)} className="text-slate-400 hover:text-rose-600 transition" title="Delete">
                        <Trash2 size={16}/>
                      </button>
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
