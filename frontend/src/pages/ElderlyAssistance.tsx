import React, { useState } from 'react';
import { SectionHeader } from '../components/KrishnaAccents';
import { ImageUploader } from '../components/ImageUploader';
import api from '../services/api';
import { AlertCircle, CheckCircle2, Loader2, UserCheck } from 'lucide-react';

export const ElderlyAssistance: React.FC = () => {
  const [formData, setFormData] = useState({
    elderly_name: '',
    elderly_age: '',
    contact_number: '',
    address: '',
    assistance_type: 'भोजन',
    description: '',
    photo_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const assistanceTypes = [
    'भोजन',
    'कपड़े',
    'दवाइयाँ',
    'स्वास्थ्य संबंधी सहायता',
    'अन्य आवश्यक सहायता'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.elderly_name || !formData.contact_number || !formData.address || !formData.description) {
      setStatusMsg({ text: 'कृपया बुजुर्ग का नाम, संपर्क नंबर, पता और विवरण भरें।', isError: true });
      return;
    }

    const cleanContact = formData.contact_number.replace(/\D/g, '');
    if (cleanContact.length !== 10) {
      setStatusMsg({ text: 'कृपया 10 अंकों का मान्य संपर्क मोबाइल नंबर दर्ज करें।', isError: true });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/assistance', formData);
      if (res.data.success) {
        setStatusMsg({ text: res.data.message, isError: false });
        setFormData({
          elderly_name: '',
          elderly_age: '',
          contact_number: '',
          address: '',
          assistance_type: 'भोजन',
          description: '',
          photo_url: ''
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.message || 'सहायता अनुरोध दर्ज करने में विफलता हुई।',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-10 px-4">
      <SectionHeader
        title="बुजुर्ग सहायता अनुरोध (Elderly Assistance Request)"
        subtitle="किसी असहाय या जरूरतमंद वृद्ध जन के लिए सहायता का अनुरोध यहाँ दर्ज करें। (बिना लॉगिन के आवेदन करें)"
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
                बुजुर्ग व्यक्ति का नाम *
              </label>
              <input
                type="text"
                required
                value={formData.elderly_name}
                onChange={(e) => setFormData({ ...formData, elderly_name: e.target.value })}
                placeholder="उदा. रामलाल जी"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                आयु (यदि ज्ञात हो)
              </label>
              <input
                type="number"
                value={formData.elderly_age}
                onChange={(e) => setFormData({ ...formData, elderly_age: e.target.value })}
                placeholder="उदा. 70"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                संपर्क मोबाइल नंबर (10 अंक) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10 अंकों का संपर्क नंबर"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
              <div className="flex justify-between items-center text-xs mt-1 px-1">
                <span className={formData.contact_number.length === 10 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {formData.contact_number.length === 10 ? '✓ 10 अंक मान्य' : 'केवल 10 अंकों का नंबर भरें'}
                </span>
                <span className={`font-mono ${formData.contact_number.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  {formData.contact_number.length}/10
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                आवश्यक सहायता का प्रकार *
              </label>
              <select
                value={formData.assistance_type}
                onChange={(e) => setFormData({ ...formData, assistance_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
              >
                {assistanceTypes.map((at) => (
                  <option key={at} value={at}>{at}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              वर्तमान स्थिति व पता *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="सटीक स्थान या वर्तमान ठिकाना दर्ज करें"
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              स्थिति का विवरण एवं आवश्यकता *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="बुजुर्ग की स्थिति का पूरा विवरण लिखें..."
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            ></textarea>
          </div>

          {/* Image Uploader for Elderly Assistance Request */}
          <ImageUploader
            label="बुजुर्ग व्यक्ति/स्थान की फोटो (ऐच्छिक)"
            defaultUrl={formData.photo_url}
            onImageUploaded={(url) => setFormData({ ...formData, photo_url: url })}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full text-center text-lg py-3.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                अनुरोध भेजा जा रहा है...
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                सहायता अनुरोध जमा करें
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
