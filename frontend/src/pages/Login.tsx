import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AashrayLogo } from '../components/KrishnaAccents';
import api from '../services/api';
import { Lock, AlertCircle, Loader2, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMsg = location.state?.redirectMsg;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('कृपया प्रशासक पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Direct Admin login via password (e.g. radhe radhe)
      const res = await api.post('/auth/login', { password: password.trim() });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/admin');
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'पासवर्ड अमान्य है। कृपया सही पासवर्ड (उदा. radhe radhe) दर्ज करें।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 sm:my-16 px-4">
      <div className="card-krishna space-y-6 shadow-2xl border-2 border-gold/60 p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex justify-center mb-2">
            <AashrayLogo className="w-24 h-24 shadow-xl border-2 border-gold/60" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon dark:text-gold font-heading">
            प्रशासक प्रवेश (Admin Login)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            आश्रय वृद्धाश्रम मुख्य एडमिन पैनल में प्रवेश हेतु पासवर्ड दर्ज करें
          </p>
        </div>

        {redirectMsg && (
          <div className="p-3.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-2 border-amber-400 text-xs sm:text-sm flex items-start gap-2 font-bold shadow-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <span>{redirectMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-sm flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1.5">
              प्रशासक सुरक्षा पासवर्ड (Admin Password) *
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें (उदा. radhe radhe)"
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border-2 border-gold/50 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-medium text-base shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-maroon dark:hover:text-gold transition-colors"
                title={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <span>💡</span>
              <span>पासवर्ड <strong>radhe radhe</strong> लिखकर एंटर करें।</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center text-lg py-3.5 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                सत्यापन हो रहा है...
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                एडमिन पैनल खोलें (Open Admin Panel)
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
