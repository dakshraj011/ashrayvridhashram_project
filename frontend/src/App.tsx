import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingBackground } from './components/FloatingBackground';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Needs } from './pages/Needs';
import { Events } from './pages/Events';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MealSponsorship } from './pages/MealSponsorship';
import { VolunteerRegister } from './pages/VolunteerRegister';
import { ElderlyAssistance } from './pages/ElderlyAssistance';
import { UserDashboard } from './pages/UserDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-saffron font-bold text-xl">लोड हो रहा है...</div>;
  if (!user) return <Navigate to="/login" replace state={{ redirectMsg: 'सुरक्षा हेतु कृपया पहले लॉगिन करें।' }} />;
  return <>{children}</>;
};

const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-saffron font-bold text-xl">लोड हो रहा है...</div>;
  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return <Navigate to="/login" replace state={{ redirectMsg: 'सुरक्षा हेतु प्रबंधक (Manager) पैनल के लिए लॉगिन आवश्यक है।' }} />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-saffron font-bold text-xl">लोड हो रहा है...</div>;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace state={{ redirectMsg: 'सुरक्षा चेतावनी: व्यवस्थापक (Admin) डैशबोर्ड के लिए पासवर्ड लॉगिन अनिवार्य है।' }} />;
  }
  return <>{children}</>;
};


export const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <FloatingBackground />
      <Navbar />
      <main className="flex-grow z-10">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/needs" element={<Needs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Form Services */}
          <Route path="/meal-sponsorship" element={<MealSponsorship />} />
          <Route path="/volunteer-register" element={<VolunteerRegister />} />
          <Route path="/elderly-assistance" element={<ElderlyAssistance />} />

          {/* Role Protected Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/manager" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
