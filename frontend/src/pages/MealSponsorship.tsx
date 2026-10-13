import React, { useState } from 'react';
import { SectionHeader } from '../components/KrishnaAccents';
import api from '../services/api';
import { Utensils, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const MealSponsorship: React.FC = () => {

  const [formData, setFormData] = useState({
    user_name: '',
    mobile: '',
    preferred_date: '',
    people_count: 50,
    meal_type: 'दोपहर का भोजन',
    items_distributed: 'सात्विक भोजन, फल एवं मिठाई',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_name.trim()) {
      setStatusMsg({ text: 'कृपया अपना नाम दर्ज करें।', isError: true });
      return;
    }

    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      setStatusMsg({ text: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।', isError: true });
      return;
    }

    if (!formData.preferred_date || !formData.meal_type || !formData.items_distributed.trim()) {
      setStatusMsg({ text: 'कृपया भोजन की तारीख, प्रकार और बाँटने वाली सामग्री (क्या-क्या बाँट रहे हैं) दर्ज करें।', isError: true });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/meals', formData);
      if (res.data.success) {
        setStatusMsg({ text: res.data.message, isError: false });
        setFormData({
          user_name: '',
          mobile: '',
          preferred_date: '',
          people_count: 50,
          meal_type: 'दोपहर का भोजन',
          items_distributed: '',
          message: ''
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.message || 'भोजन प्रायोजन अनुरोध भेजने में त्रुटि।',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-10 px-4">
      <SectionHeader
        title="भोजन प्रायोजन (Meal Sponsorship)"
        subtitle="आश्रम के बुजुर्गों को सात्विक भोजन प्रायोजित करें। (बिना लॉगिन के तुरंत अनुरोध जमा करें)"
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
                दानदाता/आवेदक का नाम *
              </label>
              <input
                type="text"
                required
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                placeholder="अपना पूरा नाम भरें"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                संपर्क मोबाइल नंबर *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="10 अंकों का मोबाइल नंबर"
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                पसंदीदा भोजन तिथि *
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

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                भोजन का प्रकार *
              </label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
              >
                <option value="सुबह का नाश्ता">सुबह का नाश्ता (Breakfast)</option>
                <option value="दोपहर का भोजन">दोपहर का भोजन (Lunch)</option>
                <option value="रात का भोजन">रात का भोजन (Dinner)</option>
                <option value="पूरे दिन का भोजन">पूरे दिन का विशेष भोजन (Full Day)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              क्या-क्या बाँट रहे हैं? (वितरण सामग्री) *
            </label>
            <input
              type="text"
              required
              value={formData.items_distributed}
              onChange={(e) => setFormData({ ...formData, items_distributed: e.target.value })}
              placeholder="उदा. सात्विक भोजन, फल, मिठाई, पूड़ी-सब्ज़ी, खीर, या कपड़े"
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold text-saffron"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              व्यक्तियों/बुजुर्गों की संख्या
            </label>
            <input
              type="number"
              min={10}
              max={200}
              value={formData.people_count}
              onChange={(e) => setFormData({ ...formData, people_count: parseInt(e.target.value, 10) || 50 })}
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              विशेष संदेश या अवसर (जैसे: जन्मदिन, पुण्यतिथि)
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="अवसर या विशेष व्यंजन का निवेदन लिखें..."
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center text-lg py-3.5 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                अनुरोध भेजा जा रहा है...
              </>
            ) : (
              <>
                <Utensils className="w-5 h-5" />
                भोजन प्रायोजन अनुरोध जमा करें
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
