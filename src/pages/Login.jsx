import React, { useState, useEffect } from 'react';
import { Pill, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import api from '../api';

export default function Login({ setAuth }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [maxReached, setMaxReached] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/auth/config');
      setMaxReached(res.data.maxReached);
    } catch(err) {
      console.error(err);
    }
    setLoadingConfig(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProcessing(true);
    
    if (isRegisterMode) {
      try {
        const res = await api.post('/auth/register', { name, email, password });
        setSuccess(res.data.message);
        setIsRegisterMode(false);
        setPassword('');
        fetchConfig();
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } else {
      try {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setAuth(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
    setProcessing(false);
  };

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
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100 relative z-10">⚠️ {error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mb-4 text-sm font-medium border border-emerald-100 relative z-10">✅ {success}</div>}
        
        <form onSubmit={handleAuth} className="flex flex-col gap-5 relative z-10">
          {isRegisterMode && (
            <div>
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition bg-slate-50 focus:bg-white text-sm" />
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition bg-slate-50 focus:bg-white text-sm" />
          </div>
          <div>
             <label className="text-sm font-bold text-slate-700">Password</label>
             <div className="relative mt-1.5">
               <input 
                 type={showPassword ? "text" : "password"} 
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 required 
                 className="w-full p-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition bg-slate-50 focus:bg-white text-sm" 
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
               >
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
             </div>
          </div>
          <button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 mt-2 disabled:opacity-75 flex items-center justify-center gap-2">
            {processing ? 'Processing...' : (isRegisterMode ? <><UserPlus size={18}/> Create Account</> : <><LogIn size={18} /> Secure Sign In</>)}
          </button>
        </form>
        
        <div className="mt-6 text-center relative z-10 flex flex-col gap-2">
           {!loadingConfig && (
             isRegisterMode ? (
               <button type="button" onClick={() => { setIsRegisterMode(false); setError(''); setSuccess(''); }} className="text-xs font-bold text-slate-500 hover:text-blue-600 transition">
                  ← Back to Login
               </button>
             ) : (
               <button 
                 type="button" 
                 onClick={() => { setIsRegisterMode(true); setError(''); setSuccess(''); }} 
                 disabled={maxReached}
                 title={maxReached ? "Maximum users reached" : ""}
                 className={`text-xs font-bold transition px-4 py-2 border rounded-lg mx-auto ${maxReached ? "text-slate-400 border-slate-200 cursor-not-allowed bg-slate-50" : "text-blue-600 border-blue-200 hover:bg-blue-50"} `}
               >
                 {maxReached ? 'Registration Closed (Max 3 Users)' : 'Register New User'}
               </button>
             )
           )}
        </div>
      </div>
    </div>
  );
}
