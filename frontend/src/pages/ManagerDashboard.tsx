import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SectionHeader } from '../components/KrishnaAccents';
import { StatusBadge } from '../components/StatusBadge';
import { ImageUploader } from '../components/ImageUploader';
import api from '../services/api';
import type { Need, MealRequest, VolunteerRegistration, AssistanceRequest } from '../types';
import { Utensils, Gift, Users, Heart, Plus, Edit, Save } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'needs' | 'meals' | 'volunteers' | 'assistance'>('needs');
  const [needs, setNeeds] = useState<Need[]>([]);
  const [meals, setMeals] = useState<MealRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [assistance, setAssistance] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Add Need State
  const [showAddNeed, setShowAddNeed] = useState(false);
  const [newNeed, setNewNeed] = useState({
    title: '',
    category: 'भोजन',
    description: '',
    required_quantity: 10,
    available_quantity: 0,
    unit: 'नग',
    photo_url: ''
  });

  // Edit Need State
  const [editingNeedId, setEditingNeedId] = useState<number | null>(null);
  const [editAvailQty, setEditAvailQty] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<string>('सक्रिय');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [needsRes, mealsRes, volRes, astRes] = await Promise.allSettled([
        api.get('/needs'),
        api.get('/meals'),
        api.get('/volunteers'),
        api.get('/assistance')
      ]);

      if (needsRes.status === 'fulfilled' && needsRes.value.data.success) {
        setNeeds(needsRes.value.data.needs || []);
      }
      if (mealsRes.status === 'fulfilled' && mealsRes.value.data.success) {
        setMeals(mealsRes.value.data.requests || []);
      }
      if (volRes.status === 'fulfilled' && volRes.value.data.success) {
        setVolunteers(volRes.value.data.registrations || []);
      }
      if (astRes.status === 'fulfilled' && astRes.value.data.success) {
        setAssistance(astRes.value.data.requests || []);
      }
    } catch (err) {
      console.error('Manager data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add Need Submission
  const handleAddNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/needs', newNeed);
      if (res.data.success) {
        setActionMsg('नई आवश्यकता सफलतापूर्वक जोड़ी गई!');
        setShowAddNeed(false);
        setNewNeed({ title: '', category: 'भोजन', description: '', required_quantity: 10, available_quantity: 0, unit: 'नग', photo_url: '' });
        fetchData();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err: any) {
      setActionMsg(err.response?.data?.message || 'त्रुटि हुई।');
    }
  };

  // Save Need Quantity Update
  const handleSaveNeedUpdate = async (id: number) => {
    try {
      const res = await api.put(`/needs/${id}`, {
        available_quantity: editAvailQty,
        status: editStatus
      });
      if (res.data.success) {
        setActionMsg('आवश्यकता की उपलब्ध मात्रा अपडेट हो गई!');
        setEditingNeedId(null);
        fetchData();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err: any) {
      setActionMsg(err.response?.data?.message || 'त्रुटि हुई।');
    }
  };

  // Update Meal Status
  const handleMealStatus = async (id: number, status: string) => {
    try {
      const res = await api.put(`/meals/${id}/status`, { status });
      if (res.data.success) {
        setActionMsg(`भोजन अनुरोध स्थिति: '${status}' में बदल दी गई!`);
        fetchData();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err: any) {
      setActionMsg('त्रुटि हुई।');
    }
  };

  // Update Volunteer Status
  const handleVolunteerStatus = async (id: number, status: string) => {
    try {
      const res = await api.put(`/volunteers/${id}/status`, { status });
      if (res.data.success) {
        setActionMsg(`स्वयंसेवक स्थिति '${status}' कर दी गई!`);
        fetchData();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err: any) {
      setActionMsg('त्रुटि हुई।');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SectionHeader
        title={`वृद्धाश्रम प्रबंधक पैनल (${user?.name})`}
        subtitle="आवश्यकताओं की पूर्ति, भोजन प्रायोजन, स्वयंसेवक एवं सहायता प्रबंधन।"
      />

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-center">
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-gold/30 pb-3">
        <button
          onClick={() => setActiveTab('needs')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'needs' ? 'bg-gold text-maroon shadow-md' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Gift className="w-5 h-5" /> आवश्यकताएँ ({needs.length})
        </button>
        <button
          onClick={() => setActiveTab('meals')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'meals' ? 'bg-gold text-maroon shadow-md' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Utensils className="w-5 h-5" /> भोजन प्रायोजन ({meals.length})
        </button>
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'volunteers' ? 'bg-gold text-maroon shadow-md' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Users className="w-5 h-5" /> स्वयंसेवक ({volunteers.length})
        </button>
        <button
          onClick={() => setActiveTab('assistance')}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'assistance' ? 'bg-gold text-maroon shadow-md' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Heart className="w-5 h-5" /> बुजुर्ग सहायता ({assistance.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-saffron font-bold text-lg">प्रबंधक डेटा लोड हो रहा है...</div>
      ) : activeTab === 'needs' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">
              आवश्यकताएँ प्रबंधन एवं उपलब्ध मात्रा सम्पादन
            </h3>
            <button
              onClick={() => setShowAddNeed(!showAddNeed)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> नई आवश्यकता जोड़ें
            </button>
          </div>

          {/* Add Need Form Drawer */}
          {showAddNeed && (
            <form onSubmit={handleAddNeed} className="card-krishna space-y-4 border-2 border-saffron">
              <h4 className="text-xl font-bold text-maroon dark:text-gold font-heading">नई आवश्यकता दर्ज करें</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">आवश्यकता का शीर्षक *</label>
                  <input
                    type="text"
                    required
                    value={newNeed.title}
                    onChange={(e) => setNewNeed({ ...newNeed, title: e.target.value })}
                    placeholder="उदा. सर्दियों के कंबल"
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">श्रेणी *</label>
                  <select
                    value={newNeed.category}
                    onChange={(e) => setNewNeed({ ...newNeed, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="भोजन">भोजन</option>
                    <option value="कपड़े">कपड़े</option>
                    <option value="दवाइयाँ">दवाइयाँ</option>
                    <option value="पंखे">पंखे</option>
                    <option value="कूलर">कूलर</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">आवश्यक कुल मात्रा *</label>
                  <input
                    type="number"
                    min={1}
                    value={newNeed.required_quantity}
                    onChange={(e) => setNewNeed({ ...newNeed, required_quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">वर्तमान उपलब्ध मात्रा</label>
                  <input
                    type="number"
                    min={0}
                    value={newNeed.available_quantity}
                    onChange={(e) => setNewNeed({ ...newNeed, available_quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">मापन इकाई (Unit)</label>
                  <input
                    type="text"
                    value={newNeed.unit}
                    onChange={(e) => setNewNeed({ ...newNeed, unit: e.target.value })}
                    placeholder="उदा. नग, किलो, पैकेट"
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <ImageUploader
                label="फोटो अपलोड करें (ऐच्छिक)"
                defaultUrl={newNeed.photo_url}
                onImageUploaded={(url) => setNewNeed({ ...newNeed, photo_url: url })}
              />

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAddNeed(false)} className="px-4 py-2 text-slate-600 font-bold">रद्द करें</button>
                <button type="submit" className="btn-primary text-sm py-2 px-6">सहेजें</button>
              </div>
            </form>
          )}

          {/* Needs Table */}
          <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-gold/20 text-maroon dark:text-gold font-bold">
                <tr>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">आवश्यकता</th>
                  <th className="p-3">श्रेणी</th>
                  <th className="p-3">आवश्यक कुल</th>
                  <th className="p-3">उपलब्ध मात्रा</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {needs.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                    <td className="p-3 font-bold">#{item.id}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{item.title}</td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3 font-bold text-maroon dark:text-gold">{item.required_quantity} {item.unit}</td>
                    <td className="p-3">
                      {editingNeedId === item.id ? (
                        <input
                          type="number"
                          value={editAvailQty}
                          onChange={(e) => setEditAvailQty(parseInt(e.target.value, 10) || 0)}
                          className="w-20 p-1 border rounded bg-amber-50 font-bold text-center"
                        />
                      ) : (
                        <span className="font-bold text-emerald-600">{item.available_quantity} {item.unit}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingNeedId === item.id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="p-1 border rounded text-xs font-bold"
                        >
                          <option value="सक्रिय">सक्रिय</option>
                          <option value="पूर्ण">पूर्ण</option>
                        </select>
                      ) : (
                        <StatusBadge status={item.status} />
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingNeedId === item.id ? (
                        <button
                          onClick={() => handleSaveNeedUpdate(item.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" /> सहेजें
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingNeedId(item.id);
                            setEditAvailQty(item.available_quantity);
                            setEditStatus(item.status);
                          }}
                          className="px-3 py-1 bg-saffron text-white rounded-lg font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> सम्पादित करें
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'meals' ? (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">
            भोजन प्रायोजन अनुरोध समीक्षा
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-saffron/10 text-maroon dark:text-gold font-bold">
                <tr>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">आवेदक</th>
                  <th className="p-3">मोबाइल</th>
                  <th className="p-3">भोजन तिथि</th>
                  <th className="p-3">प्रकार</th>
                  <th className="p-3">क्या-क्या बाँट रहे हैं?</th>
                  <th className="p-3">व्यक्ति</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {meals.map((m) => (
                  <tr key={m.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                    <td className="p-3 font-bold">#{m.id}</td>
                    <td className="p-3 font-bold">{m.user_name}</td>
                    <td className="p-3">{m.mobile}</td>
                    <td className="p-3 font-semibold">{m.preferred_date}</td>
                    <td className="p-3">{m.meal_type}</td>
                    <td className="p-3 font-bold text-saffron">{m.items_distributed || 'सात्विक भोजन'}</td>
                    <td className="p-3">{m.people_count}</td>
                    <td className="p-3"><StatusBadge status={m.status} /></td>
                    <td className="p-3 text-right space-x-1">
                      {m.status === 'लंबित' && (
                        <>
                          <button
                            onClick={() => handleMealStatus(m.id, 'स्वीकार किया गया')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-xs"
                          >
                            स्वीकार करें
                          </button>
                          <button
                            onClick={() => handleMealStatus(m.id, 'अस्वीकार किया गया')}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-xs"
                          >
                            अस्वीकार करें
                          </button>
                        </>
                      )}
                      {m.status === 'स्वीकार किया गया' && (
                        <button
                          onClick={() => handleMealStatus(m.id, 'पूर्ण')}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold text-xs"
                        >
                          पूर्ण करें
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'volunteers' ? (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">स्वयंसेवक आवेदन समीक्षा</h3>
          <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-maroon/10 text-maroon dark:text-gold font-bold">
                <tr>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">स्वयंसेवक का नाम</th>
                  <th className="p-3">मोबाइल</th>
                  <th className="p-3">सेवा तिथि</th>
                  <th className="p-3">सहायता प्रकार</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {volunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                    <td className="p-3 font-bold">#{v.id}</td>
                    <td className="p-3 font-bold">{v.full_name}</td>
                    <td className="p-3">{v.mobile}</td>
                    <td className="p-3 font-semibold">{v.preferred_date}</td>
                    <td className="p-3">{v.help_type}</td>
                    <td className="p-3"><StatusBadge status={v.status} /></td>
                    <td className="p-3 text-right space-x-1">
                      {v.status === 'लंबित' && (
                        <>
                          <button
                            onClick={() => handleVolunteerStatus(v.id, 'स्वीकार किया गया')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-xs"
                          >
                            स्वीकार करें
                          </button>
                          <button
                            onClick={() => handleVolunteerStatus(v.id, 'अस्वीकार किया गया')}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-xs"
                          >
                            अस्वीकार
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">बुजुर्ग सहायता अनुरोध</h3>
          <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-gold/20 text-maroon dark:text-gold font-bold">
                <tr>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">बुजुर्ग नाम</th>
                  <th className="p-3">संपर्क</th>
                  <th className="p-3">स्थान</th>
                  <th className="p-3">सहायता प्रकार</th>
                  <th className="p-3">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assistance.map((a) => (
                  <tr key={a.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                    <td className="p-3 font-bold">#{a.id}</td>
                    <td className="p-3 font-bold">{a.elderly_name}</td>
                    <td className="p-3">{a.contact_number}</td>
                    <td className="p-3">{a.address}</td>
                    <td className="p-3">{a.assistance_type}</td>
                    <td className="p-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
