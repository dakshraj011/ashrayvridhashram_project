import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SectionHeader } from '../components/KrishnaAccents';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';
import type { MealRequest, VolunteerRegistration, AssistanceRequest, NotificationItem } from '../types';
import { Utensils, Users, Heart, Plus } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [meals, setMeals] = useState<MealRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [assistance, setAssistance] = useState<AssistanceRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications' | 'profile'>('requests');
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [mealsRes, volRes, astRes, notifRes] = await Promise.allSettled([
          api.get('/meals/my'),
          api.get('/volunteers/my'),
          api.get('/assistance/my'),
          api.get('/notifications/my')
        ]);

        if (mealsRes.status === 'fulfilled' && mealsRes.value.data.success) {
          setMeals(mealsRes.value.data.requests || []);
        }
        if (volRes.status === 'fulfilled' && volRes.value.data.success) {
          setVolunteers(volRes.value.data.registrations || []);
        }
        if (astRes.status === 'fulfilled' && astRes.value.data.success) {
          setAssistance(astRes.value.data.requests || []);
        }
        if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
          setNotifications(notifRes.value.data.notifications || []);
        }
      } catch (err) {
        console.error('User data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', {
        name: profileName,
        email: profileEmail,
        address: profileAddress
      });
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg('प्रोफ़ाइल सफलता पूर्वक अपडेट हो गई!');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      setProfileMsg('प्रोफ़ाइल अपडेट में त्रुटि हुई।');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SectionHeader
        title={`उपयोगकर्ता डैशबोर्ड (${user?.name})`}
        subtitle="आपके द्वारा प्रस्तुत सभी अनुरोधों की स्थिति, सूचनाएँ एवं प्रोफ़ाइल प्रबंधन।"
      />

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/meal-sponsorship" className="card-krishna flex items-center justify-between group hover:bg-saffron/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-saffron text-white flex items-center justify-center font-bold">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">भोजन प्रायोजन</h4>
              <p className="text-xs text-slate-500">नया प्रायोजन दर्ज करें</p>
            </div>
          </div>
          <Plus className="w-5 h-5 text-saffron group-hover:scale-125 transition-transform" />
        </Link>

        <Link to="/volunteer-register" className="card-krishna flex items-center justify-between group hover:bg-maroon/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-maroon text-white flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">स्वयंसेवक बनें</h4>
              <p className="text-xs text-slate-500">समय का योगदान दें</p>
            </div>
          </div>
          <Plus className="w-5 h-5 text-maroon dark:text-gold group-hover:scale-125 transition-transform" />
        </Link>

        <Link to="/elderly-assistance" className="card-krishna flex items-center justify-between group hover:bg-gold/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold text-maroon flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">बुजुर्ग सहायता</h4>
              <p className="text-xs text-slate-500">असहाय वृद्ध जन हेतु</p>
            </div>
          </div>
          <Plus className="w-5 h-5 text-gold group-hover:scale-125 transition-transform" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gold/30 pb-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'requests' ? 'bg-saffron text-white shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          मेरे अनुरोध (My Requests)
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'notifications' ? 'bg-saffron text-white shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          सूचनाएँ ({notifications.filter(n => n.is_read === 0).length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-saffron text-white shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          मेरी प्रोफ़ाइल (Profile)
        </button>
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="text-center py-12 text-saffron font-bold text-lg">डेटा लोड हो रहा है...</div>
      ) : activeTab === 'requests' ? (
        <div className="space-y-10">
          
          {/* Meal Requests Table */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading flex items-center gap-2">
              <Utensils className="w-6 h-6 text-saffron" /> मेरे भोजन प्रायोजन अनुरोध ({meals.length})
            </h3>
            {meals.length === 0 ? (
              <p className="p-4 bg-white dark:bg-slate-900 rounded-xl text-slate-500 text-sm">आपने अभी तक कोई भोजन प्रायोजन अनुरोध नहीं भेजा है।</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
                <table className="w-full text-left text-sm">
                  <thead className="bg-saffron/10 text-maroon dark:text-gold font-bold">
                    <tr>
                      <th className="p-3">आईडी</th>
                      <th className="p-3">भोजन तिथि</th>
                      <th className="p-3">प्रकार</th>
                      <th className="p-3">संख्या</th>
                      <th className="p-3">स्थिति</th>
                      <th className="p-3">टिप्पणी</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {meals.map((m) => (
                      <tr key={m.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                        <td className="p-3 font-bold">#{m.id}</td>
                        <td className="p-3 font-semibold">{m.preferred_date}</td>
                        <td className="p-3">{m.meal_type}</td>
                        <td className="p-3">{m.people_count} व्यक्ति</td>
                        <td className="p-3"><StatusBadge status={m.status} /></td>
                        <td className="p-3 text-xs text-slate-600 dark:text-slate-400">{m.admin_note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Volunteer Applications Table */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading flex items-center gap-2">
              <Users className="w-6 h-6 text-maroon dark:text-gold" /> मेरे स्वयंसेवक पंजीकरण ({volunteers.length})
            </h3>
            {volunteers.length === 0 ? (
              <p className="p-4 bg-white dark:bg-slate-900 rounded-xl text-slate-500 text-sm">कोई स्वयंसेवक पंजीकरण दर्ज नहीं है।</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
                <table className="w-full text-left text-sm">
                  <thead className="bg-maroon/10 text-maroon dark:text-gold font-bold">
                    <tr>
                      <th className="p-3">आईडी</th>
                      <th className="p-3">सेवा तिथि</th>
                      <th className="p-3">सहायता प्रकार</th>
                      <th className="p-3">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {volunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                        <td className="p-3 font-bold">#{v.id}</td>
                        <td className="p-3 font-semibold">{v.preferred_date}</td>
                        <td className="p-3">{v.help_type}</td>
                        <td className="p-3"><StatusBadge status={v.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Assistance Requests Table */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading flex items-center gap-2">
              <Heart className="w-6 h-6 text-gold" /> मेरे बुजुर्ग सहायता अनुरोध ({assistance.length})
            </h3>
            {assistance.length === 0 ? (
              <p className="p-4 bg-white dark:bg-slate-900 rounded-xl text-slate-500 text-sm">कोई सहायता अनुरोध दर्ज नहीं है।</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gold/20 text-maroon dark:text-gold font-bold">
                    <tr>
                      <th className="p-3">आईडी</th>
                      <th className="p-3">बुजुर्ग का नाम</th>
                      <th className="p-3">सहायता प्रकार</th>
                      <th className="p-3">स्थान</th>
                      <th className="p-3">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assistance.map((a) => (
                      <tr key={a.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                        <td className="p-3 font-bold">#{a.id}</td>
                        <td className="p-3 font-semibold">{a.elderly_name} (उम्र: {a.elderly_age || '-'})</td>
                        <td className="p-3">{a.assistance_type}</td>
                        <td className="p-3">{a.address}</td>
                        <td className="p-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      ) : activeTab === 'notifications' ? (
        <div className="card-krishna space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">आपकी सूचनाएँ</h3>
          {notifications.length === 0 ? (
            <p className="text-slate-500 text-sm">कोई सूचना उपलब्ध नहीं है।</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 rounded-xl border border-gold/30 bg-cream/50 dark:bg-slate-800 flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{n.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                    <span className="text-xs text-slate-400 mt-2 block">{n.created_at ? new Date(n.created_at).toLocaleString('hi-IN') : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card-krishna max-w-xl mx-auto space-y-6">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">प्रोफ़ाइल जानकारी सम्पादित करें</h3>

          {profileMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-sm">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">नाम</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">मोबाइल नंबर (अपरिवर्तनीय)</label>
              <input
                type="text"
                disabled
                value={user?.mobile || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">ईमेल</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">पता</label>
              <input
                type="text"
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button type="submit" className="btn-primary w-full text-center py-3">
              प्रोफ़ाइल सहेजें
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
