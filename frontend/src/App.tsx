import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import { AdminDashboard } from './pages/AdminDashboard';

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

          {/* Admin & Dashboards (all direct to /admin) */}
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/manager" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />

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
        <Router basename={import.meta.env.BASE_URL}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
