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
  const [tappedPath, setTappedPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'होम (Home)', path: '/' },
    { name: 'हमारे बारे में (About Us)', path: '/about' },
    { name: 'वर्तमान आवश्यकताएँ (Needs)', path: '/needs' },
    { name: 'कार्यक्रम एवं गैलरी (Gallery)', path: '/events' },
    { name: 'संपर्क करें (Contact Us)', path: '/contact' },
    { name: 'व्यवस्थापक डैशबोर्ड (Admin)', path: '/admin' }
  ];

  const handleMobileNavClick = (path: string) => {
    setTappedPath(path);
    setTimeout(() => {
      setIsMenuOpen(false);
      setTappedPath(null);
    }, 180);
  };

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
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-gold/40 px-4 pt-3 pb-6 space-y-2 font-semibold shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pb-1 flex items-center justify-between">
            <span>नेविगेशन मेनू</span>
            <span className="text-[10px] text-saffron font-bold">आश्रय धाम</span>
          </div>

          {navLinks.map((link) => {
            const isSelected = isActive(link.path);
            const isTapped = tappedPath === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => handleMobileNavClick(link.path)}
                className={`mobile-nav-item flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 select-none cursor-pointer ${
                  isTapped
                    ? 'bg-[#E87924] text-[#FFF6E9] scale-[0.98] shadow-md border-l-4 border-[#D9AA55]'
                    : isSelected
                    ? 'bg-[#FFF6E9] dark:bg-[#852D36]/40 text-[#852D36] dark:text-[#D9AA55] border-l-4 border-[#E87924] shadow-sm'
                    : 'text-slate-800 dark:text-slate-100 border-l-4 border-transparent hover:bg-[#FFF6E9]/70 dark:hover:bg-slate-800 hover:text-[#852D36] dark:hover:text-[#D9AA55] active:bg-[#E87924] active:text-[#FFF6E9] active:scale-[0.98]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E87924] dark:bg-[#D9AA55] animate-pulse flex-shrink-0" />
                  )}
                  <span className="text-base">{link.name}</span>
                </span>

                {isSelected ? (
                  <span className="text-xs bg-[#E87924]/15 dark:bg-[#D9AA55]/20 text-[#E87924] dark:text-[#D9AA55] px-2.5 py-0.5 rounded-full font-bold border border-[#E87924]/20 shadow-xs">
                    चयनित
                  </span>
                ) : (
                  <span className="text-slate-400 text-sm">→</span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              to="/admin"
              onClick={() => handleMobileNavClick('/admin')}
              className={`btn-secondary w-full text-center text-sm py-2.5 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                isActive('/admin') ? 'ring-2 ring-[#D9AA55]' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-gold" />
              व्यवस्थापक डैशबोर्ड (Admin Dashboard)
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-center py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-colors cursor-pointer text-sm"
              >
                लॉग आउट करें
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
