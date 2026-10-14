import React, { useState, useEffect } from 'react';
import { SectionHeader, AashrayLogo } from '../components/KrishnaAccents';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { ImageUploader } from '../components/ImageUploader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type {
  User, Need, MealRequest, VolunteerRegistration, AssistanceRequest,
  Event, ContactSubmission, DashboardStats
} from '../types';
import {
  Plus, Search, Edit, Trash2, Send, Download, Lock, KeyRound
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isPasswordVerified, setIsPasswordVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_pwd_verified') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [pwdError, setPwdError] = useState<string>('');
  const [verifyingPwd, setVerifyingPwd] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<
    'stats' | 'users' | 'meals' | 'volunteers' | 'assistance' | 'needs' | 'events' | 'contacts' | 'announcement' | 'reports'
  >('stats');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [managersList, setManagersList] = useState<User[]>([]);
  const [mealsList, setMealsList] = useState<MealRequest[]>([]);
  const [volunteersList, setVolunteersList] = useState<VolunteerRegistration[]>([]);
  const [assistanceList, setAssistanceList] = useState<AssistanceRequest[]>([]);
  const [needsList, setNeedsList] = useState<Need[]>([]);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [contactsList, setContactsList] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string>('');

  const handleVerifyAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput) {
      setPwdError('कृपया प्रशासक पासवर्ड दर्ज करें।');
      return;
    }
    setVerifyingPwd(true);
    setPwdError('');

    try {
      const mobile = user?.mobile || '6306638958';
      const res = await api.post('/auth/login', { mobile, password: adminPasswordInput });
      if (res.data.success && res.data.user.role === 'admin') {
        sessionStorage.setItem('admin_pwd_verified', 'true');
        setIsPasswordVerified(true);
        fetchDashboardData();
      } else {
        setPwdError('गलत पासवर्ड! केवल अधिकृत एडमिन पासवर्ड दर्ज करें।');
      }
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'गलत प्रशासक पासवर्ड! पहुंच अस्वीकृत।');
    } finally {
      setVerifyingPwd(false);
    }
  };


  // Search
  const [searchUser, setSearchUser] = useState('');

  // Modals & Confirmation States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });



  // Add/Edit Need State
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [needForm, setNeedForm] = useState({
    title: '',
    category: 'भोजन',
    description: '',
    required_quantity: 10,
    available_quantity: 0,
    unit: 'नग',
    photo_url: '',
    status: 'सक्रिय'
  });

  // Add Event State
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    event_date: '',
    description: '',
    image_url: ''
  });

  // Broadcast Announcement State
  const [broadcast, setBroadcast] = useState({ title: '', message: '' });

  // Report State
  const [reportType, setReportType] = useState('meals');
  const [reportData, setReportData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, mgrsRes, mealsRes, volRes, astRes, needsRes, evtsRes, contactsRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users?role=user'),
        api.get('/admin/users?role=manager'),
        api.get('/meals'),
        api.get('/volunteers'),
        api.get('/assistance'),
        api.get('/needs'),
        api.get('/events'),
        api.get('/contact')
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) setStats(statsRes.value.data.stats || null);
      if (usersRes.status === 'fulfilled' && usersRes.value.data.success) setUsersList(usersRes.value.data.users || []);
      if (mgrsRes.status === 'fulfilled' && mgrsRes.value.data.success) setManagersList(mgrsRes.value.data.users || []);
      if (mealsRes.status === 'fulfilled' && mealsRes.value.data.success) setMealsList(mealsRes.value.data.requests || []);
      if (volRes.status === 'fulfilled' && volRes.value.data.success) setVolunteersList(volRes.value.data.registrations || []);
      if (astRes.status === 'fulfilled' && astRes.value.data.success) setAssistanceList(astRes.value.data.requests || []);
      if (needsRes.status === 'fulfilled' && needsRes.value.data.success) setNeedsList(needsRes.value.data.needs || []);
      if (evtsRes.status === 'fulfilled' && evtsRes.value.data.success) setEventsList(evtsRes.value.data.events || []);
      if (contactsRes.status === 'fulfilled' && contactsRes.value.data.success) setContactsList(contactsRes.value.data.messages || []);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showNotification = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  // User Actions
  const handleToggleUserActive = async (id: number, currentStatus: number) => {
    try {
      await api.put(`/admin/users/${id}/status`, { is_active: currentStatus === 1 ? 0 : 1 });
      showNotification(`उपयोगकर्ता खाता स्थिति अपडेट हो गई!`);
      fetchDashboardData();
    } catch (err: any) {
      showNotification('त्रुटि हुई।');
    }
  };

  const handleDeleteUser = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'उपयोगकर्ता हटाने की पुष्टि करें',
      message: `क्या आप वास्तव में '${name}' का खाता हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`,
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/users/${id}`);
          if (res.data.success) {
            showNotification('उपयोगकर्ता सफलतापूर्वक हटा दिया गया!');
            fetchDashboardData();
          }
        } catch (err: any) {
          showNotification(err.response?.data?.message || 'हटाने में विफलता हुई।');
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };



  // Meal Status Action
  const handleUpdateMealStatus = async (id: number, status: string, note?: string) => {
    try {
      const res = await api.put(`/meals/${id}/status`, { status, admin_note: note });
      if (res.data.success) {
        showNotification(`भोजन अनुरोध स्थिति '${status}' कर दी गई!`);
        fetchDashboardData();
      }
    } catch (err: any) {
      showNotification('अपडेट में त्रुटि।');
    }
  };

  // Volunteer Status Action
  const handleUpdateVolunteerStatus = async (id: number, status: string) => {
    try {
      const res = await api.put(`/volunteers/${id}/status`, { status });
      if (res.data.success) {
        showNotification(`स्वयंसेवक पंजीकरण स्थिति '${status}' कर दी गई!`);
        fetchDashboardData();
      }
    } catch (err: any) {
      showNotification('अपडेट में त्रुटि।');
    }
  };

  // Assistance Status & Assign Action
  const handleUpdateAssistance = async (id: number, status: string, managerId?: number) => {
    try {
      const res = await api.put(`/assistance/${id}/status`, { status, assigned_manager_id: managerId });
      if (res.data.success) {
        showNotification(`बुजुर्ग सहायता अनुरोध अद्यतन हो गया!`);
        fetchDashboardData();
      }
    } catch (err: any) {
      showNotification('अपडेट में त्रुटि।');
    }
  };

  // Delete Meal Request
  const handleDeleteMeal = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'भोजन प्रायोजन हटाने की पुष्टि',
      message: `क्या आप '${name}' का भोजन प्रायोजन अनुरोध हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`,
      onConfirm: async () => {
        try {
          await api.delete(`/meals/${id}`);
          showNotification('भोजन प्रायोजन रिकॉर्ड हटा दिया गया!');
          fetchDashboardData();
        } catch (err: any) {
          showNotification(err.response?.data?.message || 'हटाने में त्रुटि।');
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };

  // Delete Volunteer Registration
  const handleDeleteVolunteer = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'स्वयंसेवक आवेदन हटाने की पुष्टि',
      message: `क्या आप '${name}' का स्वयंसेवक पंजीकरण हटाना चाहते हैं?`,
      onConfirm: async () => {
        try {
          await api.delete(`/volunteers/${id}`);
          showNotification('स्वयंसेवक पंजीकरण रिकॉर्ड हटा दिया गया!');
          fetchDashboardData();
        } catch (err: any) {
          showNotification(err.response?.data?.message || 'हटाने में त्रुटि।');
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };

  // Delete Assistance Request
  const handleDeleteAssistance = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'बुजुर्ग सहायता अनुरोध हटाने की पुष्टि',
      message: `क्या आप '${name}' का सहायता अनुरोध हटाना चाहते हैं?`,
      onConfirm: async () => {
        try {
          await api.delete(`/assistance/${id}`);
          showNotification('बुजुर्ग सहायता अनुरोध रिकॉर्ड हटा दिया गया!');
          fetchDashboardData();
        } catch (err: any) {
          showNotification(err.response?.data?.message || 'हटाने में त्रुटि।');
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };

  // Delete Contact Submission
  const handleDeleteContact = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'संपर्क संदेश हटाने की पुष्टि',
      message: `क्या आप '${name}' का संदेश हटाना चाहते हैं?`,
      onConfirm: async () => {
        try {
          await api.delete(`/contact/${id}`);
          showNotification('संदेश रिकॉर्ड हटा दिया गया!');
          fetchDashboardData();
        } catch (err: any) {
          showNotification(err.response?.data?.message || 'हटाने में त्रुटि।');
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };


  // Save/Update Need
  const handleSaveNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNeed) {
        await api.put(`/needs/${editingNeed.id}`, needForm);
        showNotification('आवश्यकता विवरण अपडेट हो गया!');
      } else {
        await api.post('/needs', needForm);
        showNotification('नई आवश्यकता सफलतापूर्वक जोड़ी गई!');
      }
      setShowNeedModal(false);
      setEditingNeed(null);
      fetchDashboardData();
    } catch (err: any) {
      showNotification('सहेजने में विफलता हुई।');
    }
  };

  const handleDeleteNeed = (id: number, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'आवश्यकता हटाने की पुष्टि',
      message: `क्या आप '${title}' आवश्यकता को हटाना चाहते हैं?`,
      onConfirm: async () => {
        try {
          await api.delete(`/needs/${id}`);
          showNotification('आवश्यकता हटा दी गई!');
          fetchDashboardData();
        } catch (err) {
          showNotification('हटाने में त्रुटि।');
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };

  // Save Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', eventForm);
      showNotification('नया कार्यक्रम जोड़ा गया!');
      setShowEventModal(false);
      setEventForm({ title: '', event_date: '', description: '', image_url: '' });
      fetchDashboardData();
    } catch (err) {
      showNotification('कार्यक्रम जोड़ने में त्रुटि।');
    }
  };

  const handleDeleteEvent = (id: number, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'कार्यक्रम हटाने की पुष्टि',
      message: `क्या आप '${title}' कार्यक्रम हटाना चाहते हैं?`,
      onConfirm: async () => {
        try {
          await api.delete(`/events/${id}`);
          showNotification('कार्यक्रम हटा दिया गया!');
          fetchDashboardData();
        } catch (err) {
          showNotification('त्रुटि।');
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };

  // Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) return;
    try {
      const res = await api.post('/notifications/broadcast', broadcast);
      if (res.data.success) {
        showNotification('सार्वजनिक घोषणा सभी उपयोगकर्ताओं को भेज दी गई!');
        setBroadcast({ title: '', message: '' });
      }
    } catch (err) {
      showNotification('घोषणा भेजने में त्रुटि।');
    }
  };

  // CSV Report Generator
  const handleGenerateReport = async () => {
    try {
      const res = await api.get(`/reports/summary?type=${reportType}`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      showNotification('रिपोर्ट लोड करने में विफलता।');
    }
  };

  const exportCSV = () => {
    if (reportData.length === 0) return;
    const keys = Object.keys(reportData[0]);
    const csvRows = [
      keys.join(','),
      ...reportData.map(row => keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aashray_report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isPasswordVerified) {
    return (
      <div className="max-w-md mx-auto my-12 sm:my-20 px-4">
        <div className="card-krishna space-y-6 shadow-2xl border-2 border-maroon">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <AashrayLogo className="w-20 h-20 shadow-xl border-2 border-gold rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-maroon dark:text-gold font-heading">
              व्यवस्थापक सुरक्षा अनलॉक (Admin Password)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
              सुरक्षा कारणों से एडमिन डैशबोर्ड खोलने के लिए प्रशासक पासवर्ड दर्ज करें।
            </p>
          </div>

          {pwdError && (
            <div className="p-4 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyAdminPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">
                प्रशासक पासवर्ड *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="सुरक्षा पासवर्ड दर्ज करें"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold/40 bg-cream/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-saffron font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyingPwd}
              className="btn-primary w-full text-center py-3 text-base sm:text-lg flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" />
              {verifyingPwd ? 'सत्यापन हो रहा है...' : 'सत्यापित करें एवं डैशबोर्ड खोलें'}
            </button>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      
      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
      />

      <SectionHeader
        title={`व्यवस्थापक डैशबोर्ड (Admin Panel)`}
        subtitle="संपूर्ण आश्रय वृद्धाश्रम प्रणाली का नियंत्रण, डेटाबेस आंकड़े, उपयोगकर्ता, आवश्यकताएँ व रिपोर्ट।"
      />

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 font-bold text-center shadow-md">
          {actionMsg}
        </div>
      )}

      {/* Main Admin Sidebar / Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gold/30 pb-3">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'stats' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          सांख्यिकी (Stats)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          उपयोगकर्ता ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('meals')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'meals' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          भोजन प्रायोजन ({mealsList.length})
        </button>
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'volunteers' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          स्वयंसेवक ({volunteersList.length})
        </button>
        <button
          onClick={() => setActiveTab('assistance')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'assistance' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          बुजुर्ग सहायता ({assistanceList.length})
        </button>
        <button
          onClick={() => setActiveTab('needs')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'needs' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          आवश्यकताएँ ({needsList.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'events' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          कार्यक्रम ({eventsList.length})
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'contacts' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          संपर्क संदेश ({contactsList.length})
        </button>
        <button
          onClick={() => setActiveTab('announcement')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'announcement' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          सार्वजनिक घोषणा
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'reports' ? 'bg-maroon text-gold shadow' : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          रिपोर्ट्स एवं CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-saffron font-bold text-lg">डेटाबेस से आंकड़े लोड हो रहे हैं...</div>
      ) : activeTab === 'stats' ? (
        /* REAL DATABASE STATS OVERVIEW CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-krishna space-y-2 border-l-4 border-saffron">
            <p className="text-xs text-slate-500 font-bold">कुल पंजीकृत उपयोगकर्ता</p>
            <h3 className="text-3xl font-extrabold text-saffron">{stats?.totalUsers || 0}</h3>
          </div>
          <div className="card-krishna space-y-2 border-l-4 border-maroon">
            <p className="text-xs text-slate-500 font-bold">आश्रम आवश्यकताएं (Needs)</p>
            <h3 className="text-3xl font-extrabold text-maroon dark:text-gold">{needsList.length}</h3>
          </div>
          <div className="card-krishna space-y-2 border-l-4 border-gold">
            <p className="text-xs text-slate-500 font-bold">कुल भोजन प्रायोजन (लंबित)</p>
            <h3 className="text-3xl font-extrabold text-gold">{stats?.totalMealRequests || 0} ({stats?.pendingMealRequests || 0} लंबित)</h3>
          </div>
          <div className="card-krishna space-y-2 border-l-4 border-emerald-500">
            <p className="text-xs text-slate-500 font-bold">स्वयंसेवक आवेदन (लंबित)</p>
            <h3 className="text-3xl font-extrabold text-emerald-600">{stats?.totalVolunteers || 0} ({stats?.pendingVolunteers || 0} लंबित)</h3>
          </div>
          <div className="card-krishna space-y-2 border-l-4 border-rose-500">
            <p className="text-xs text-slate-500 font-bold">बुजुर्ग सहायता अनुरोध (लंबित)</p>
            <h3 className="text-3xl font-extrabold text-rose-600">{stats?.totalAssistanceRequests || 0} ({stats?.pendingAssistanceRequests || 0} लंबित)</h3>
          </div>
          <div className="card-krishna space-y-2 border-l-4 border-blue-500">
            <p className="text-xs text-slate-500 font-bold">सक्रिय आवश्यकताएँ</p>
            <h3 className="text-3xl font-extrabold text-blue-600">{stats?.activeNeeds || 0}</h3>
          </div>
          <div className="card-krishna space-y-2 border-l-4 border-purple-500">
            <p className="text-xs text-slate-500 font-bold">आयोजित कार्यक्रम</p>
            <h3 className="text-3xl font-extrabold text-purple-600">{stats?.totalEvents || 0}</h3>
          </div>
          <div className="card-krishna space-y-2 border-l-4 border-amber-500">
            <p className="text-xs text-slate-500 font-bold">प्राप्त संपर्क संदेश</p>
            <h3 className="text-3xl font-extrabold text-amber-600">{stats?.totalContacts || 0}</h3>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* USER MANAGEMENT */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">
              सामान्य उपयोगकर्ता प्रबंधन
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="नाम या मोबाइल खोजें..."
                className="w-full pl-9 pr-3 py-2 border rounded-xl bg-cream/50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-saffron/10 text-maroon dark:text-gold font-bold">
                <tr>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">नाम</th>
                  <th className="p-3">मोबाइल</th>
                  <th className="p-3">ईमेल</th>
                  <th className="p-3">पता</th>
                  <th className="p-3">खाता स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList
                  .filter(u => u.name.includes(searchUser) || u.mobile.includes(searchUser))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                      <td className="p-3 font-bold">#{u.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{u.name}</td>
                      <td className="p-3 font-semibold">{u.mobile}</td>
                      <td className="p-3 text-xs">{u.email || '-'}</td>
                      <td className="p-3 text-xs">{u.address || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.is_active === 1 ? 'सक्रिय' : 'निष्क्रिय'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserActive(u.id, u.is_active || 1)}
                          className="px-2.5 py-1 bg-amber-500 text-white rounded font-bold text-xs cursor-pointer"
                        >
                          {u.is_active === 1 ? 'निष्क्रिय करें' : 'सक्रिय करें'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-xs cursor-pointer"
                        >
                          हटाएं
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'meals' ? (
        /* MEAL REQUEST MANAGEMENT */
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">
            भोजन प्रायोजन अनुरोध समीक्षा एवं स्वीकृति
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-saffron/10 text-maroon dark:text-gold font-bold">
                <tr>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">दानदाता नाम</th>
                  <th className="p-3">मोबाइल</th>
                  <th className="p-3">तिथि</th>
                  <th className="p-3">भोजन प्रकार</th>
                  <th className="p-3">क्या-क्या बाँट रहे हैं?</th>
                  <th className="p-3">व्यक्ति</th>
                  <th className="p-3">संदेश</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mealsList.map((m) => (
                  <tr key={m.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                    <td className="p-3 font-bold">#{m.id}</td>
                    <td className="p-3 font-bold">{m.user_name}</td>
                    <td className="p-3 font-semibold">{m.mobile}</td>
                    <td className="p-3 font-bold text-saffron">{m.preferred_date}</td>
                    <td className="p-3">{m.meal_type}</td>
                    <td className="p-3 font-bold text-saffron">{m.items_distributed || 'सात्विक भोजन'}</td>
                    <td className="p-3">{m.people_count}</td>
                    <td className="p-3 text-xs max-w-xs truncate">{m.message || '-'}</td>
                    <td className="p-3"><StatusBadge status={m.status} /></td>
                    <td className="p-3 text-right space-x-1">
                      {m.status === 'लंबित' && (
                        <>
                          <button
                            onClick={() => handleUpdateMealStatus(m.id, 'स्वीकार किया गया')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-xs cursor-pointer"
                          >
                            स्वीकार
                          </button>
                          <button
                            onClick={() => handleUpdateMealStatus(m.id, 'अस्वीकार किया गया')}
                            className="px-2 py-1 bg-amber-600 text-white rounded font-bold text-xs cursor-pointer"
                          >
                            अस्वीकार
                          </button>
                        </>
                      )}
                      {m.status === 'स्वीकार किया गया' && (
                        <button
                          onClick={() => handleUpdateMealStatus(m.id, 'पूर्ण')}
                          className="px-2 py-1 bg-blue-600 text-white rounded font-bold text-xs cursor-pointer"
                        >
                          पूर्ण चिन्हित करें
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMeal(m.id, m.user_name)}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs cursor-pointer ml-1 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> हटाएं
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'volunteers' ? (
        /* VOLUNTEER MANAGEMENT */
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">स्वयंसेवक आवेदन प्रबंधन</h3>
          <div className="overflow-x-auto rounded-2xl border border-gold/40 bg-white dark:bg-slate-900 shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-maroon/10 text-maroon dark:text-gold font-bold">
                <tr>
                  <th className="p-3">आईडी</th>
                  <th className="p-3">स्वयंसेवक नाम</th>
                  <th className="p-3">मोबाइल</th>
                  <th className="p-3">सेवा तिथि</th>
                  <th className="p-3">प्रकार</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {volunteersList.map((v) => (
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
                            onClick={() => handleUpdateVolunteerStatus(v.id, 'स्वीकार किया गया')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-xs cursor-pointer"
                          >
                            स्वीकार
                          </button>
                          <button
                            onClick={() => handleUpdateVolunteerStatus(v.id, 'अस्वीकार किया गया')}
                            className="px-2 py-1 bg-amber-600 text-white rounded font-bold text-xs cursor-pointer"
                          >
                            अस्वीकार
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteVolunteer(v.id, v.full_name)}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs cursor-pointer ml-1 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> हटाएं
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'assistance' ? (
        /* ASSISTANCE REQUEST MANAGEMENT */
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
                  <th className="p-3">आवश्यक सहायता</th>
                  <th className="p-3">आवंटित प्रबंधक</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assistanceList.map((a) => (
                  <tr key={a.id} className="hover:bg-cream/40 dark:hover:bg-slate-800">
                    <td className="p-3 font-bold">#{a.id}</td>
                    <td className="p-3 font-bold">{a.elderly_name}</td>
                    <td className="p-3">{a.contact_number}</td>
                    <td className="p-3">{a.address}</td>
                    <td className="p-3">{a.assistance_type}</td>
                    <td className="p-3 text-xs">
                      <select
                        value={a.assigned_manager_id || ''}
                        onChange={(e) => handleUpdateAssistance(a.id, a.status, parseInt(e.target.value, 10) || undefined)}
                        className="p-1 border rounded bg-amber-50 text-xs font-bold"
                      >
                        <option value="">-- प्रबंधक चुनें --</option>
                        {managersList.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3"><StatusBadge status={a.status} /></td>
                    <td className="p-3 text-right space-x-1">
                      {a.status === 'लंबित' && (
                        <button
                          onClick={() => handleUpdateAssistance(a.id, 'स्वीकार किया गया')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-xs cursor-pointer"
                        >
                          स्वीकार
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAssistance(a.id, a.elderly_name)}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs cursor-pointer ml-1 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> हटाएं
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : activeTab === 'needs' ? (
        /* NEEDS MANAGEMENT */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">वर्तमान आवश्यकताएँ प्रबंधन</h3>
            <button
              onClick={() => {
                setEditingNeed(null);
                setNeedForm({ title: '', category: 'भोजन', description: '', required_quantity: 10, available_quantity: 0, unit: 'नग', photo_url: '', status: 'सक्रिय' });
                setShowNeedModal(true);
              }}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> नई आवश्यकता जोड़ें
            </button>
          </div>

          {showNeedModal && (
            <form onSubmit={handleSaveNeed} className="card-krishna space-y-4 border-2 border-saffron">
              <h4 className="text-xl font-bold text-maroon dark:text-gold font-heading">
                {editingNeed ? 'आवश्यकता सम्पादित करें' : 'नई आवश्यकता दर्ज करें'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">शीर्षक *</label>
                  <input
                    type="text"
                    required
                    value={needForm.title}
                    onChange={(e) => setNeedForm({ ...needForm, title: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">श्रेणी *</label>
                  <select
                    value={needForm.category}
                    onChange={(e) => setNeedForm({ ...needForm, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800 font-bold"
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
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">आवश्यक कुल</label>
                  <input
                    type="number"
                    value={needForm.required_quantity}
                    onChange={(e) => setNeedForm({ ...needForm, required_quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">उपलब्ध मात्रा</label>
                  <input
                    type="number"
                    value={needForm.available_quantity}
                    onChange={(e) => setNeedForm({ ...needForm, available_quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">इकाई</label>
                  <input
                    type="text"
                    value={needForm.unit}
                    onChange={(e) => setNeedForm({ ...needForm, unit: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <ImageUploader
                label="फोटो अपलोड करें"
                defaultUrl={needForm.photo_url}
                onImageUploaded={(url) => setNeedForm({ ...needForm, photo_url: url })}
              />

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowNeedModal(false)} className="px-4 py-2 font-bold text-slate-600">रद्द करें</button>
                <button type="submit" className="btn-primary text-sm py-2 px-6">सहेजें</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {needsList.map((n) => (
              <div key={n.id} className="card-krishna flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-saffron bg-saffron/10 px-2.5 py-1 rounded">
                      {n.category}
                    </span>
                    <StatusBadge status={n.status} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.description}</p>
                  <div className="mt-3 text-sm font-semibold space-y-1">
                    <p>आवश्यक: <span className="text-maroon dark:text-gold font-bold">{n.required_quantity} {n.unit}</span></p>
                    <p>उपलब्ध: <span className="text-emerald-600 font-bold">{n.available_quantity} {n.unit}</span></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingNeed(n);
                      setNeedForm({
                        title: n.title,
                        category: n.category,
                        description: n.description,
                        required_quantity: n.required_quantity,
                        available_quantity: n.available_quantity,
                        unit: n.unit,
                        photo_url: n.photo_url || '',
                        status: n.status
                      });
                      setShowNeedModal(true);
                    }}
                    className="p-2 text-saffron hover:bg-saffron/10 rounded-lg cursor-pointer"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNeed(n.id, n.title)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'events' ? (
        /* EVENTS & GALLERY MANAGEMENT */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">कार्यक्रम प्रबंधन</h3>
            <button
              onClick={() => setShowEventModal(!showEventModal)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> नया कार्यक्रम जोड़ें
            </button>
          </div>

          {showEventModal && (
            <form onSubmit={handleSaveEvent} className="card-krishna space-y-4 border-2 border-maroon">
              <h4 className="text-xl font-bold text-maroon dark:text-gold font-heading">नया कार्यक्रम दर्ज करें</h4>
              <div>
                <label className="block text-sm font-bold mb-1">शीर्षक *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">तिथि *</label>
                <input
                  type="date"
                  required
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">विवरण *</label>
                <textarea
                  rows={3}
                  required
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-cream/50 dark:bg-slate-800"
                ></textarea>
              </div>

              <ImageUploader
                label="कार्यक्रम फोटो अपलोड करें"
                defaultUrl={eventForm.image_url}
                onImageUploaded={(url) => setEventForm({ ...eventForm, image_url: url })}
              />

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 font-bold text-slate-600">रद्द करें</button>
                <button type="submit" className="btn-secondary text-sm py-2 px-6">सहेजें</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eventsList.map((e) => (
              <div key={e.id} className="card-krishna flex flex-col justify-between">
                <div>
                  <img src={e.image_url || "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80"} alt={e.title} className="w-full h-40 object-cover rounded-lg mb-2" />
                  <span className="text-xs text-saffron font-bold">{e.event_date}</span>
                  <h4 className="text-xl font-bold">{e.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{e.description}</p>
                </div>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => handleDeleteEvent(e.id, e.title)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'contacts' ? (
        /* CONTACT SUBMISSIONS */
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">संपर्क संदेश (Contact Submissions)</h3>
          <div className="space-y-3">
            {contactsList.map((c) => (
              <div key={c.id} className="card-krishna space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{c.name} ({c.mobile})</h4>
                    <p className="text-xs text-slate-500">{c.email || 'ईमेल नहीं है'} | विषय: {c.subject}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-cream/50 dark:bg-slate-800 p-3 rounded-xl">
                  {c.message}
                </p>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>प्राप्त समय: {c.created_at ? new Date(c.created_at).toLocaleString('hi-IN') : ''}</span>
                  <button
                    onClick={() => handleDeleteContact(c.id, c.name)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> संदेश हटाएं
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : activeTab === 'announcement' ? (
        /* PUBLIC ANNOUNCEMENT BROADCAST */
        <div className="card-krishna max-w-xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">
            सार्वजनिक घोषणा (Public Announcement)
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            यहाँ से आप सभी पंजीकृत उपयोगकर्ताओं के इन-ऐप नोटिफिकेशन पैनल पर महत्वपूर्ण सूचना भेज सकते हैं।
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">घोषणा का शीर्षक *</label>
              <input
                type="text"
                required
                value={broadcast.title}
                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                placeholder="उदा. श्री कृष्ण जन्माष्टमी भंडारा आमंत्रण"
                className="w-full p-3 border rounded-xl bg-cream/50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-maroon dark:text-gold mb-1">घोषणा संदेश *</label>
              <textarea
                required
                rows={4}
                value={broadcast.message}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                placeholder="पूरी सूचना लिखें..."
                className="w-full p-3 border rounded-xl bg-cream/50 dark:bg-slate-800"
              ></textarea>
            </div>

            <button type="submit" className="btn-primary w-full text-center py-3 flex items-center justify-center gap-2">
              <Send className="w-5 h-5" /> घोषणा प्रसारित करें
            </button>
          </form>
        </div>
      ) : (
        /* REPORTS & CSV EXPORT */
        <div className="card-krishna space-y-6">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">
            डेटाबेस रिपोर्ट एवं CSV एक्सपोर्ट
          </h3>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">रिपोर्ट का प्रकार चुनें</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="p-2.5 border rounded-xl font-bold bg-cream dark:bg-slate-800"
              >
                <option value="meals">भोजन प्रायोजन अनुरोध</option>
                <option value="volunteers">स्वयंसेवक पंजीकरण</option>
                <option value="assistance">बुजुर्ग सहायता अनुरोध</option>
                <option value="needs">आवश्यकताएँ डेटा</option>
              </select>
            </div>

            <button
              onClick={handleGenerateReport}
              className="btn-secondary text-sm py-2.5 px-6 self-end"
            >
              रिपोर्ट तैयार करें
            </button>

            {reportData.length > 0 && (
              <button
                onClick={exportCSV}
                className="btn-gold text-sm py-2.5 px-6 self-end flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> CSV फ़ाइल डाउनलोड करें ({reportData.length} रिकॉर्ड्स)
              </button>
            )}
          </div>

          {reportData.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-gold/40 max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-saffron text-white font-bold">
                  <tr>
                    {Object.keys(reportData[0]).map((k) => (
                      <th key={k} className="p-2">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cream/50">
                      {Object.keys(row).map((k) => (
                        <td key={k} className="p-2 truncate max-w-xs">{String(row[k] || '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
