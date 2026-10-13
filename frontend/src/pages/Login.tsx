import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AashrayLogo } from '../components/KrishnaAccents';
import api from '../services/api';
import { LogIn, Lock, Phone, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMsg = location.state?.redirectMsg;

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !password) {
      setErrorMsg('कृपया मोबाइल नंबर और पासवर्ड दोनों भरें।');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/login', { mobile, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        
        // Redirect by role
        if (res.data.user.role === 'admin') navigate('/admin');
        else if (res.data.user.role === 'manager') navigate('/manager');
        else navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'लॉगिन में विफलता। केवल अधिकृत एडमिन/मैनेजर लॉगिन कर सकते हैं।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4">
      <div className="card-krishna space-y-6 shadow-2xl border-2 border-gold/50">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex justify-center">
            <AashrayLogo className="w-24 h-24 shadow-xl border-2 border-gold/60" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon dark:text-gold font-heading">
            प्रशासक एवं प्रबंधक लॉगिन
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            आश्रय वृद्धाश्रम एडमिन पैनल (Admin & Manager Portal)
          </p>
        </div>

        {redirectMsg && (
          <div className="p-4 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-2 border-amber-400 text-xs sm:text-sm flex items-start gap-2 font-bold shadow-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <span>{redirectMsg}</span>
          </div>
        )}


        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-sm flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              प्रशासक मोबाइल नंबर *
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="उदा. 6306638958"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              सुरक्षा पासवर्ड *
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="सुरक्षा पासवर्ड दर्ज करें"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center text-lg py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                सत्यापन हो रहा है...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                व्यवस्थापक लॉगिन करें
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );

};
