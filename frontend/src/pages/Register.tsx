import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OmSymbol } from '../components/KrishnaAccents';
import api from '../services/api';
import { UserPlus, User, Phone, Mail, Lock, MapPin, AlertCircle, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.password) {
      setErrorMsg('कृपया नाम, मोबाइल नंबर और पासवर्ड भरें।');
      return;
    }

    if (formData.mobile.length < 10) {
      setErrorMsg('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('पासवर्ड और पुष्टि पासवर्ड आपस में मेल नहीं खाते।');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        address: formData.address
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'पंजीकरण में विफलता हुई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 px-4">
      <div className="card-krishna space-y-6 shadow-2xl border-2 border-gold/50">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-saffron via-gold to-maroon text-white flex items-center justify-center text-2xl shadow-lg">
            <OmSymbol className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-maroon dark:text-gold font-heading">
            नया उपयोगकर्ता पंजीकरण
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            आश्रय परिवार से जुड़ने हेतु अपनी जानकारी दर्ज करें
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-sm flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              पूरा नाम *
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="अपना पूरा नाम दर्ज करें"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                मोबाइल नंबर *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                ईमेल पता (ऐच्छिक)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ईमेल पता"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                पासवर्ड *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="सुरक्षित पासवर्ड बनाएं"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                पासवर्ड पुष्टि करें *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="पुनः पासवर्ड दर्ज करें"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              पूरा पता
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="शहर, राज्य व पता"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
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
                पंजीकरण हो रहा है...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                पंजीकरण पूर्ण करें
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-sm text-slate-600 dark:text-slate-300">
          पहले से पंजीकृत हैं?{' '}
          <Link to="/login" className="font-bold text-saffron hover:underline">
            यहाँ लॉगिन करें
          </Link>
        </div>

      </div>
    </div>
  );
};
