import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout & Auth
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Medicines from './pages/Medicines';
import Ledger from './pages/Ledger';
import DailyLog from './pages/DailyLog';
import Suppliers from './pages/Suppliers';
import Salary from './pages/Salary';
import Patients from './pages/Patients'; 

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
  
  if (!isAuth) {
    return <Login setAuth={setIsAuth} />;
  }

  return (
    <Router>
      <DashboardLayout setAuth={setIsAuth}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/dailylog" element={<DailyLog />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/salary" element={<Salary />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/patients" element={<Patients />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}
