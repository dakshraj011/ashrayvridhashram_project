import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PeacockFeatherIcon, AashrayLogo } from './KrishnaAccents';
import { NotificationBell } from './NotificationBell';
import { Sun, Moon, Menu, X, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-gold/40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform">
              <AashrayLogo className="w-13 h-13 shadow-xl border-2 border-gold rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-maroon dark:text-gold font-heading tracking-wide">
                  आश्रय
                </span>
                <PeacockFeatherIcon className="w-6 h-6" />
              </div>
              <span className="text-xs text-saffron font-bold block -mt-1 tracking-wider">
                वृद्धाश्रम धाम
              </span>
            </div>
          </Link>


          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 font-semibold text-slate-700 dark:text-slate-200">
            <Link
              to="/"
              className={`hover:text-saffron transition-colors py-1 ${isActive('/') ? 'text-saffron font-bold border-b-2 border-saffron' : ''}`}
            >
              होम
            </Link>
            <Link
              to="/about"
              className={`hover:text-saffron transition-colors py-1 ${isActive('/about') ? 'text-saffron font-bold border-b-2 border-saffron' : ''}`}
            >
              हमारे बारे में
            </Link>
            <Link
              to="/needs"
              className={`hover:text-saffron transition-colors py-1 ${isActive('/needs') ? 'text-saffron font-bold border-b-2 border-saffron' : ''}`}
            >
              आवश्यकताएँ
            </Link>
            <Link
              to="/events"
              className={`hover:text-saffron transition-colors py-1 ${isActive('/events') ? 'text-saffron font-bold border-b-2 border-saffron' : ''}`}
            >
              कार्यक्रम एवं गैलरी
            </Link>
            <Link
              to="/contact"
              className={`hover:text-saffron transition-colors py-1 ${isActive('/contact') ? 'text-saffron font-bold border-b-2 border-saffron' : ''}`}
            >
              संपर्क करें
            </Link>
            <Link
              to="/admin"
              className={`hover:text-saffron transition-colors py-1 ${isActive('/admin') ? 'text-saffron font-bold border-b-2 border-saffron' : ''}`}
            >
              व्यवस्थापक डैशबोर्ड
            </Link>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-amber-100 dark:bg-slate-800 text-maroon dark:text-gold hover:scale-105 transition-transform cursor-pointer"
              title={darkMode ? "लाइट मोड" : "डार्क मोड"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-maroon" />}
            </button>

            {user && <NotificationBell />}

            <Link
              to="/admin"
              className="btn-secondary text-sm py-2 px-4 font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
              title="व्यवस्थापक डैशबोर्ड (Admin Dashboard)"
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              व्यवस्थापक डैशबोर्ड (Admin)
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="p-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-colors flex items-center gap-1 text-sm cursor-pointer"
                title="लॉग आउट करें"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-amber-100 dark:bg-slate-800 text-maroon dark:text-gold"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-maroon dark:text-gold rounded-lg hover:bg-gold/10"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b-2 border-gold/40 px-4 pt-2 pb-6 space-y-3 font-semibold">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-800 dark:text-slate-100 hover:text-saffron"
          >
            होम
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-800 dark:text-slate-100 hover:text-saffron"
          >
            हमारे बारे में
          </Link>
          <Link
            to="/needs"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-800 dark:text-slate-100 hover:text-saffron"
          >
            वर्तमान आवश्यकताएँ
          </Link>
          <Link
            to="/events"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-800 dark:text-slate-100 hover:text-saffron"
          >
            कार्यक्रम एवं गैलरी
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-800 dark:text-slate-100 hover:text-saffron"
          >
            संपर्क करें
          </Link>
          <Link
            to="/admin"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-saffron dark:text-gold font-bold"
          >
            व्यवस्थापक डैशबोर्ड
          </Link>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="btn-secondary w-full text-center text-sm py-2.5 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              व्यवस्थापक डैशबोर्ड (Admin Dashboard)
            </Link>
            {user && (
              <button onClick={handleLogout} className="w-full text-center py-2 text-rose-600 font-bold cursor-pointer">
                लॉग आउट करें
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
