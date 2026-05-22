import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Printer, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Billing() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/medicines').then(res => setMedicines(res.data)).catch(console.error);
  }, []);

  const filteredMeds = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.genericName && m.genericName.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (med) => {
    if (med.quantity <= 0) return alert('Out of stock!');
    const existing = cart.find(item => item.medicineId === med._id);
    if (existing) {
      if (existing.quantity >= med.quantity) return alert('Not enough stock available!');
      setCart(cart.map(item => item.medicineId === med._id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice } : item));
    } else {
      setCart([...cart, { medicineId: med._id, name: med.name, quantity: 1, unitPrice: med.sellingPrice, total: med.sellingPrice, maxStock: med.quantity }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.medicineId === id) {
        let newQ = item.quantity + delta;
        if (newQ <= 0) return item;
        if (newQ > item.maxStock) { alert('Exceeds available stock'); return item; }
        return { ...item, quantity: newQ, total: newQ * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.medicineId !== id));
  };

  const grandTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const processSale = async () => {
    if (cart.length === 0) return alert('Cart is empty!');
    try {
      await api.post('/bills', {
        items: cart.map(({medicineId, name, quantity, unitPrice, total}) => ({medicineId, name, quantity, unitPrice, total})),
        grandTotal
      });
      setSuccess(true);
      setCart([]);
      setTimeout(() => setSuccess(false), 3000);
      // Refresh inventory
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to process sale');
    }
  };

  return (
    <div className="w-full relative z-10 flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Product Selection */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Available Medicines</h2>
          <input 
            type="text" 
            placeholder="Search by name or generic name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mt-3 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMeds.map(med => (
              <div 
                key={med._id} 
                onClick={() => addToCart(med)}
                className={`p-4 border rounded-xl cursor-pointer transition flex flex-col justify-between ${med.quantity > 0 ? 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md' : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'}`}
              >
                <div>
                  <h4 className="font-bold text-slate-800">{med.name}</h4>
                  <p className="text-xs text-slate-500">{med.genericName || 'N/A'}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                   <p className="text-blue-600 font-bold">Rs. {med.sellingPrice}</p>
                   <p className={`text-xs font-semibold ${med.quantity > 10 ? 'text-green-600' : 'text-red-600'}`}>
                     Stock: {med.quantity}
                   </p>
                </div>
              </div>
            ))}
            {filteredMeds.length === 0 && <p className="col-span-2 text-center py-8 text-slate-400">No medicines found</p>}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="w-full md:w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
         <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart size={20} /> Current Bill</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{cart.length} items</span>
         </div>
         <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {cart.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Cart is empty. Select items to add.</div>
            ) : (
               cart.map(item => (
                 <div key={item.medicineId} className="flex flex-col border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between font-bold text-slate-800 text-sm mb-2">
                       <span>{item.name}</span>
                       <span>Rs. {item.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 text-xs">
                       <span>Rs. {item.unitPrice} / unit</span>
                       <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.medicineId, -1)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded"><Minus size={14}/></button>
                          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.medicineId, 1)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded"><Plus size={14}/></button>
                          <button onClick={() => removeFromCart(item.medicineId)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"><Trash2 size={14}/></button>
                       </div>
                    </div>
                 </div>
               ))
            )}
         </div>
         <div className="p-5 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
               <span className="text-slate-500 font-semibold">Grand Total</span>
               <span className="text-2xl font-black text-blue-600">Rs. {grandTotal}</span>
            </div>
            {success ? (
               <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-3 rounded-xl font-bold">
                 <CheckCircle size={20} /> Sale Completed
               </div>
            ) : (
               <button onClick={processSale} disabled={cart.length === 0} className={`w-full flex justify-center items-center gap-2 py-4 rounded-xl font-bold text-white transition ${cart.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
                 <Printer size={20} /> Print Bill & Save
               </button>
            )}
         </div>
      </div>
    </div>
  );
}
