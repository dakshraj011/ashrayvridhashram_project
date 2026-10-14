import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '../components/KrishnaAccents';
import api from '../services/api';
import { Utensils, CheckCircle2, AlertCircle, Loader2, Sunrise, Sun, Moon, Sparkles, Phone, Calendar } from 'lucide-react';

interface SlotItem {
  id: string;
  name: string;
  isFull: boolean;
  reason?: string;
}

const DEFAULT_SLOTS: SlotItem[] = [
  { id: 'सुबह का नाश्ता', name: 'सुबह का नाश्ता (Breakfast)', isFull: false },
  { id: 'दोपहर का भोजन', name: 'दोपहर का भोजन (Lunch)', isFull: false },
  { id: 'रात का भोजन', name: 'रात का भोजन (Dinner)', isFull: false },
  { id: 'पूरे दिन का भोजन', name: 'पूरे दिन का विशेष भोजन (Full Day)', isFull: false }
];

export const MealSponsorship: React.FC = () => {
  // Get tomorrow's date as default preferred date
  const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    user_name: '',
    mobile: '',
    preferred_date: tomorrowStr(),
    people_count: 50,
    meal_type: 'दोपहर का भोजन',
    items_distributed: 'सात्विक भोजन, फल एवं मिठाई',
    message: ''
  });

  const [slotsInfo, setSlotsInfo] = useState<SlotItem[]>(DEFAULT_SLOTS);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [allSlotsFull, setAllSlotsFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Fetch slot availability whenever preferred_date changes
  const checkSlotAvailability = useCallback(async (date: string) => {
    if (!date) return;
    setCheckingSlots(true);
    try {
      const res = await api.get('/meals/booked-slots', { params: { date } });
      if (res.data.success && Array.isArray(res.data.slots)) {
        setSlotsInfo(res.data.slots);
        setAllSlotsFull(Boolean(res.data.allFull));

        // If currently chosen meal_type is full, switch to first available slot
        const currentSlot = res.data.slots.find((s: SlotItem) => s.id === formData.meal_type);
        if (currentSlot && currentSlot.isFull) {
          const firstAvailable = res.data.slots.find((s: SlotItem) => !s.isFull);
          if (firstAvailable) {
            setFormData(prev => ({ ...prev, meal_type: firstAvailable.id }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching slot availability:', err);
    } finally {
      setCheckingSlots(false);
    }
  }, [formData.meal_type]);

  useEffect(() => {
    if (formData.preferred_date) {
      checkSlotAvailability(formData.preferred_date);
    }
  }, [formData.preferred_date, checkSlotAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_name.trim()) {
      setStatusMsg({ text: 'कृपया अपना नाम दर्ज करें।', isError: true });
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setStatusMsg({ text: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।', isError: true });
      return;
    }

    if (!formData.preferred_date || !formData.meal_type || !formData.items_distributed.trim()) {
      setStatusMsg({ text: 'कृपया भोजन की तारीख, प्रकार और बाँटने वाली सामग्री दर्ज करें।', isError: true });
      return;
    }

    // Verify selected slot is not full
    const selectedSlot = slotsInfo.find(s => s.id === formData.meal_type);
    if (selectedSlot && selectedSlot.isFull) {
      setStatusMsg({
        text: `क्षमा करें, ${formData.preferred_date} को '${formData.meal_type}' का स्लॉट पहले से ही किसी अन्य व्यक्ति द्वारा बुक/फुल हो चुका है। कृपया कोई अन्य स्लॉट या तारीख चुनें।`,
        isError: true
      });
      return;
    }

    if (allSlotsFull) {
      setStatusMsg({
        text: `क्षमा करें, इस तारीख (${formData.preferred_date}) के सभी स्लॉट बुक हैं। कृपया दूसरी तारीख चुनें।`,
        isError: true
      });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.post('/meals', {
        ...formData,
        mobile: cleanMobile
      });

      if (res.data.success) {
        setStatusMsg({ text: res.data.message, isError: false });
        // Refresh slot availability for that date
        checkSlotAvailability(formData.preferred_date);
        setFormData({
          user_name: '',
          mobile: '',
          preferred_date: tomorrowStr(),
          people_count: 50,
          meal_type: 'दोपहर का भोजन',
          items_distributed: 'सात्विक भोजन, फल एवं मिठाई',
          message: ''
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.message || 'भोजन प्रायोजन अनुरोध भेजने में त्रुटि।',
        isError: true
      });
      // If error due to conflict, refresh slot availability
      if (err.response?.status === 409) {
        checkSlotAvailability(formData.preferred_date);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentSlotSelected = slotsInfo.find(s => s.id === formData.meal_type);

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-10 px-4">
      <SectionHeader
        title="भोजन वितरण प्रायोजन (Meal Sponsorship)"
        subtitle="आश्रम के बुजुर्गों को सात्विक भोजन प्रायोजित करें। (प्रति स्लॉट एक दानदाता बुकिंग)"
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                संपर्क मोबाइल नंबर (10 अंक) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={formData.mobile}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobile: onlyNums });
                  }}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              </div>
              <div className="flex justify-between items-center text-xs mt-1 px-1">
                <span className={formData.mobile.length === 10 ? 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1' : 'text-slate-500'}>
                  {formData.mobile.length === 10 ? '✓ 10 अंक मान्य' : 'केवल 10 अंकों का नंबर भरें'}
                </span>
                <span className={`font-mono ${formData.mobile.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  {formData.mobile.length}/10
                </span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
              भोजन वितरण तिथि (Date) *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.preferred_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-medium"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            </div>
            <p className="text-xs text-slate-500 mt-1">तारीख बदलते ही उस दिन के भोजन वितरण स्लॉट की उपलब्धता नीचे स्वतः दिखेगी।</p>
          </div>

          {/* Slot Selection Visual Cards */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-maroon dark:text-gold">
                भोजन वितरण स्लॉट चुनें (Distribution Slot) *
              </label>
              {checkingSlots && (
                <span className="text-xs text-saffron flex items-center gap-1 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> स्लॉट जांच जारी है...
                </span>
              )}
            </div>

            {allSlotsFull && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-2.5 text-rose-800 dark:text-rose-200 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>
                  इस तारीख ({formData.preferred_date}) के सभी भोजन वितरण स्लॉट पहले से ही बुक हो चुके हैं। कृपया कोई अन्य तारीख चुनें।
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slotsInfo.map((slot) => {
                const isSelected = formData.meal_type === slot.id;
                return (
                  <button
                    type="button"
                    key={slot.id}
                    disabled={slot.isFull}
                    onClick={() => {
                      if (!slot.isFull) {
                        setFormData({ ...formData, meal_type: slot.id });
                      }
                    }}
                    className={`relative p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      slot.isFull
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 cursor-not-allowed opacity-75'
                        : isSelected
                        ? 'bg-gold/15 dark:bg-gold/20 border-gold shadow-md ring-2 ring-gold/40'
                        : 'bg-cream/40 dark:bg-slate-800 border-gold/30 hover:border-gold/60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-sm text-maroon dark:text-gold flex items-center gap-1.5">
                        {slot.id === 'सुबह का नाश्ता' && <Sunrise className="w-4 h-4 text-amber-500" />}
                        {slot.id === 'दोपहर का भोजन' && <Sun className="w-4 h-4 text-orange-500" />}
                        {slot.id === 'रात का भोजन' && <Moon className="w-4 h-4 text-indigo-400" />}
                        {slot.id === 'पूरे दिन का भोजन' && <Sparkles className="w-4 h-4 text-gold" />}
                        {slot.id}
                      </span>

                      {slot.isFull ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/80 dark:text-rose-200 border border-rose-300">
                          ❌ स्लॉट फुल है
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300'
                        }`}>
                          {isSelected ? '✓ चयनित (Selected)' : '✓ उपलब्ध'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {slot.isFull ? (slot.reason || 'यह स्लॉट पहले से बुक हो चुका है') : 'बुजुर्गों को भोजन वितरण हेतु खाली स्लॉट'}
                    </p>
                  </button>
                );
              })}
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
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-semibold text-saffron"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                चयनित स्लॉट की स्थिति
              </label>
              <div className="px-4 py-3 rounded-xl border border-gold/40 bg-cream/30 dark:bg-slate-800/60 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {formData.meal_type}
                </span>
                {currentSlotSelected?.isFull ? (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-md border border-rose-300">
                    ❌ स्लॉट फुल है
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-300">
                    ✓ स्लॉट उपलब्ध है
                  </span>
                )}
              </div>
            </div>
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
              className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading || allSlotsFull || currentSlotSelected?.isFull}
            className="btn-primary w-full text-center text-lg py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                अनुरोध भेजा जा रहा है...
              </>
            ) : allSlotsFull ? (
              <>
                <AlertCircle className="w-5 h-5 text-rose-300" />
                इस तारीख के सभी स्लॉट फुल हैं (दूसरी तारीख चुनें)
              </>
            ) : currentSlotSelected?.isFull ? (
              <>
                <AlertCircle className="w-5 h-5 text-rose-300" />
                यह स्लॉट फुल है (दूसरा स्लॉट चुनें)
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
