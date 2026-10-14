import React, { useState } from 'react';
import { SectionHeader } from '../components/KrishnaAccents';
import api from '../services/api';
import { Users, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const VolunteerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    email: '',
    address: '',
    preferred_date: '',
    help_type: 'भोजन वितरण',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const helpTypes = [
    'भोजन वितरण',
    'बुजुर्गों के साथ समय बिताना',
    'कार्यक्रम में सहायता',
    'सामान वितरण',
    'अन्य सहायता'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.mobile || !formData.preferred_date || !formData.help_type) {
      setStatusMsg({ text: 'कृपया नाम, मोबाइल, पसंदीदा तिथि और सेवा का प्रकार भरें।', isError: true });
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setStatusMsg({ text: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।', isError: true });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/volunteers', formData);
      if (res.data.success) {
        setStatusMsg({ text: res.data.message, isError: false });
        setFormData({
          full_name: '',
          mobile: '',
          email: '',
          address: '',
          preferred_date: '',
          help_type: 'भोजन वितरण',
          message: ''
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.message || 'स्वयंसेवक आवेदन दर्ज करने में त्रुटि हुई।',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-10 px-4">
      <SectionHeader
        title="स्वयंसेवक पंजीकरण (Volunteer Registration)"
        subtitle="अपना समय और श्रम देकर आश्रम के बुजुर्गों की सेवा में सहयोग करें। (बिना लॉगिन के आवेदन करें)"
      />

      <div className="card-krishna space-y-6 shadow-2xl border-2 border-gold/50">
        
        {statusMsg && (
          <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold text-sm ${
            statusMsg.isError ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            {statusMsg.isError ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                स्वयंसेवक का पूरा नाम *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="अपना पूरा नाम भरें"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                मोबाइल नंबर (10 अंक) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10 अंकों का मोबाइल नंबर"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
              <div className="flex justify-between items-center text-xs mt-1 px-1">
                <span className={formData.mobile.length === 10 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {formData.mobile.length === 10 ? '✓ 10 अंक मान्य' : 'केवल 10 अंकों का नंबर भरें'}
                </span>
                <span className={`font-mono ${formData.mobile.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  {formData.mobile.length}/10
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                ईमेल पता (ऐच्छिक)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ईमेल"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                पसंदीदा सेवा तिथि *
              </label>
              <input
                type="date"
                required
                value={formData.preferred_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              सहायता का प्रकार *
            </label>
            <select
              value={formData.help_type}
              onChange={(e) => setFormData({ ...formData, help_type: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
            >
              {helpTypes.map((ht) => (
                <option key={ht} value={ht}>{ht}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              रहने का पता
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="शहर व पता"
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              अतिरिक्त संदेश / अनुभव
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="आप किस प्रकार सहयोग करना चाहते हैं..."
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-secondary w-full text-center text-lg py-3.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                पंजीकरण हो रहा है...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                स्वयंसेवक आवेदन जमा करें
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
