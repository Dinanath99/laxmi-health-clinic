import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NepaliDate from 'nepali-datetime';
import { Users, Wallet, PackageOpen, LayoutTemplate, Activity, ArrowRight, TrendingUp, HeartPulse, CreditCard, Banknote } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    revenue: 0,
    todaysSales: 0,
    pendingPayables: 0,
    totalBills: 0,
    totalMedicines: 0,
    totalSuppliers: 0,
    totalPatients: 0,
    totalStaff: 0,
    recentBills: [],
    lowStockItems: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, medsRes, suppliersSumRes, patientsRes, staffRes] = await Promise.all([
          api.get('/bills').catch(() => ({ data: [] })),
          api.get('/medicines').catch(() => ({ data: [] })),
          api.get('/suppliers/summary').catch(() => ({ data: [] })),
          api.get('/patients').catch(() => ({ data: [] })),
          api.get('/salary').catch(() => ({ data: [] }))
        ]);
        
        const bills = billsRes.data || [];
        const meds = medsRes.data || [];
        const suppliers = suppliersSumRes.data || [];
        const patients = patientsRes.data || [];
        const staff = staffRes.data || [];
        
        const revenue = bills.reduce((acc, b) => acc + b.grandTotal, 0);
        
        const todayStr = new NepaliDate().format('YYYY-MM-DD');
        const todaysSales = bills
            .filter(b => {
               try { return b.date && b.date.includes(todayStr); }
               catch(e) { return false; }
            })
            .reduce((acc, b) => acc + (b.grandTotal || 0), 0);
            
        const pendingPayables = suppliers.reduce((acc, s) => acc + (s.balanceDue || 0), 0);
        
        const lowStock = meds.filter(m => m.quantity < 10);
        
        setStats({
          revenue,
          todaysSales,
          pendingPayables,
          totalBills: bills.length,
          totalMedicines: meds.length,
          totalSuppliers: suppliers.length,
          totalPatients: patients.length,
          totalStaff: staff.length,
          recentBills: bills.slice(0, 5),
          lowStockItems: lowStock
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, gradient, path }) => (
    <div onClick={() => path && navigate(path)} className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out ${path ? 'cursor-pointer hover:border-blue-200' : 'cursor-default'} relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000 -mr-10 -mt-10 pointer-events-none`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.15em] mb-2">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out`}>
          <Icon size={24} className={color} strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-500">
         <TrendingUp size={14} strokeWidth={3} />
         <span>Upward trend metric</span>
      </div>
    </div>
  );

  return (
    <div className="w-full relative z-10 animate-fade-in-down">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Platform Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back! Here's what's happening at your pharmacy today.</p>
        </div>
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 border border-slate-200 shadow-sm rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white transition-colors">
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-sm font-bold text-slate-700">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Gross Revenue" value={`Rs. ${stats.revenue.toLocaleString()}`} icon={Wallet} color="text-white" gradient="from-blue-500 to-indigo-600" path="/billing" />
        <StatCard title="Today's Sales" value={`Rs. ${stats.todaysSales.toLocaleString()}`} icon={Banknote} color="text-white" gradient="from-emerald-400 to-teal-500" path="/dailylog" />
        <StatCard title="Registered Patients" value={stats.totalPatients} icon={HeartPulse} color="text-white" gradient="from-rose-400 to-pink-500" path="/patients" />
        <StatCard title="Bills Generated" value={stats.totalBills} icon={LayoutTemplate} color="text-white" gradient="from-cyan-400 to-blue-500" path="/billing" />
        
        <StatCard title="Vendor Payables" value={`Rs. ${stats.pendingPayables.toLocaleString()}`} icon={CreditCard} color="text-white" gradient="from-orange-400 to-amber-500" path="/suppliers" />
        <StatCard title="Inventory Items" value={stats.totalMedicines} icon={PackageOpen} color="text-white" gradient="from-violet-500 to-purple-600" path="/medicines" />
        <StatCard title="Data Suppliers" value={stats.totalSuppliers} icon={Users} color="text-white" gradient="from-slate-600 to-slate-800" path="/suppliers" />
        <StatCard title="Clinic Staff" value={stats.totalStaff} icon={Users} color="text-white" gradient="from-fuchsia-500 to-pink-600" path="/salary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] border border-slate-100 p-7 lg:col-span-2 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-500" size={22} strokeWidth={2.5}/> Recent Sales
            </h2>
            <button onClick={() => navigate('/billing')} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
               View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
          <table className="w-full text-left border-collapse mt-2">
            <thead className="bg-slate-50/80 backdrop-blur-md border border-slate-100 rounded-xl">
              <tr>
                <th className="px-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Bill No</th>
                <th className="px-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">Date</th>
                <th className="px-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-center">Items</th>
                <th className="px-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {stats.recentBills.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-semibold tracking-wide">No sales recorded yet.</td></tr>
              ) : stats.recentBills.map(bill => (
                <tr key={bill._id} onClick={() => navigate('/billing')} className="hover:bg-blue-50/40 hover:text-blue-900 transition-colors cursor-pointer group">
                  <td className="px-4 py-4 font-extrabold text-blue-600 group-hover:text-blue-700">#{bill.billNo}</td>
                  <td className="px-4 py-4 font-semibold">{bill.date.split('T')[0]}</td>
                  <td className="px-4 py-4 text-center">
                     <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{bill.items.length} items</span>
                  </td>
                  <td className="px-4 py-4 text-right font-black">Rs. {bill.grandTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] border border-slate-100 p-7 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-500">
          <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center justify-between">
            Low Stock Alerts
            <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{stats.lowStockItems.length} items</span>
          </h2>
          <div className="space-y-4">
            {stats.lowStockItems.length === 0 ? (
               <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                   <PackageOpen strokeWidth={1} className="mx-auto text-slate-300 mb-3" size={32} />
                   <p className="text-slate-400 font-semibold text-sm">All stock levels are perfectly optimal.</p>
               </div>
            ) : stats.lowStockItems.map(item => (
              <div key={item._id} onClick={() => navigate('/medicines')} className="flex justify-between items-center p-4 border border-rose-100 bg-rose-50/50 rounded-2xl hover:bg-rose-100 transition-colors duration-300 cursor-pointer group">
                <div>
                  <p className="font-extrabold text-slate-800 group-hover:text-rose-900 transition-colors">{item.name}</p>
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">Threshold: {item.lowStockThreshold}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-rose-600">{item.quantity}</p>
                  <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mt-0.5">Left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
