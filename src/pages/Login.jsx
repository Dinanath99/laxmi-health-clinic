import React, { useState } from 'react';
import { Pill } from 'lucide-react';
import api from '../api';

export default function Login({ setAuth }) {
  const [email, setEmail] = useState('admin@pharmacy.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const seedDB = async () => {
    setSeeding(true);
    try {
      await api.post('/seed');
      alert('Mock Data successfully seeded! You can now log in.');
    } catch(err) {
      alert('Seeding failed! Is backend running?');
    }
    setSeeding(false);
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-slate-200 relative overflow-hidden">
        {/* Clean Background design */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500 opacity-10"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-500 opacity-10"></div>
        
        <div className="flex items-center justify-center gap-3 mb-8 relative z-10">
           <div className="p-1 rounded-xl shadow-sm bg-white border border-slate-100 flex items-center justify-center">
               <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-sm" />
          </div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">SHREE LAXMI CLINIC</h2>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100">⚠️ {error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
          <div>
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition bg-slate-50 focus:bg-white text-sm" />
          </div>
          <div>
             <label className="text-sm font-bold text-slate-700">Password</label>
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition bg-slate-50 focus:bg-white text-sm" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 mt-2">
            Secure Sign In
          </button>
        </form>
        <div className="mt-6 text-center relative z-10">
            <button onClick={seedDB} disabled={seeding} className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-wider">
               {seeding ? 'Seeding...' : '1-Click Seed Mock Data'}
            </button>
        </div>
      </div>
    </div>
  );
}
