import React, { useState } from 'react';
import { SectionHeader } from '../components/KrishnaAccents';
import api from '../services/api';
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.message) {
      setStatusMsg({ text: 'कृपया नाम, मोबाइल नंबर और संदेश भरें।', isError: true });
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
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setStatusMsg({ text: res.data.message, isError: false });
        setFormData({ name: '', mobile: '', email: '', subject: '', message: '' });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.message || 'संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SectionHeader
        title="संपर्क करें (Contact Us)"
        subtitle="आश्रय वृद्धाश्रम के संबंध में किसी भी जानकारी हेतु हमसे संपर्क करें।"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact Information & Map */}
        <div className="space-y-6">
          <div className="card-krishna space-y-6">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading border-b border-gold/30 pb-2">
              हमारा पता एवं संपर्क सूत्र
            </h3>

            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-saffron/10 text-saffron flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">आश्रम पता</h4>
                  <p className="text-sm mt-1 leading-relaxed">
                    108, आश्रय धाम, स्टेशन रोड, उरई - 285001, जिला जालौन (उत्तर प्रदेश)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-maroon/10 text-maroon dark:text-gold flex items-center justify-center flex-shrink-0 mt-1">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">फोन एवं व्हाट्सएप</h4>
                  <p className="text-sm mt-1">+91 6306638958 / 05162-250108</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 mt-1">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">ईमेल आईडी</h4>
                  <p className="text-sm mt-1">info@aashray.org / help@aashray.org</p>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Location Map Preview */}
          <div className="rounded-3xl overflow-hidden border-2 border-gold/40 shadow-lg h-64 bg-cream">
            <iframe
              title="Aashray Orai Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14342.368!2d79.4500!3d25.9897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397dce51d3b070bb%3A0xb35a397779b5c3b1!2sOrai%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card-krishna space-y-6">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading border-b border-gold/30 pb-2">
            हमें संदेश भेजें (Send Message)
          </h3>

          {statusMsg && (
            <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold text-sm ${
              statusMsg.isError ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {statusMsg.isError ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">पूरा नाम *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="अपना नाम दर्ज करें"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">मोबाइल नंबर (10 अंक) *</label>
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

              <div>
                <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">ईमेल (ऐच्छिक)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ईमेल पता"
                  className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">विषय</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="पूछताछ का विषय"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">संदेश *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="अपना संदेश यहाँ लिखें..."
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center text-lg py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  संदेश भेजा जा रहा है...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  संदेश जमा करें
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
