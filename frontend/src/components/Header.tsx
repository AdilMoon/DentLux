import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, ArrowLeft, Sun, Moon, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { clinicInfo } from '../config/clinicInfo';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Показываем кнопку "Назад" если не на главной странице
  const showBackButton = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'kk' ? 'ru' : 'kk';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="bg-white dark:bg-primary-950 border-b-4 border-primary-900 dark:border-primary-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            {/* Кнопка Назад */}
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 border-2 border-primary-200 dark:border-primary-800 rounded-none text-primary-900 dark:text-primary-100 hover:bg-primary-900 dark:hover:bg-primary-100 hover:text-white dark:hover:text-primary-950 transition-all"
                title={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {/* Логотип/Атау */}
            <Link to="/" className="flex items-center group">
              <div className="text-3xl font-black text-primary-900 dark:text-white uppercase tracking-tighter group-hover:text-accent-600 transition-colors">
                {clinicInfo.name}<span className="text-accent-600">.</span>
              </div>
            </Link>
          </div>

          {/* Навигация (десктоп) */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-primary-900 dark:text-primary-300 hover:text-accent-600 transition-colors font-bold uppercase tracking-widest text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Кнопки аккаунта и темы (десктоп) */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Переключатель темы */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-none border-2 border-primary-100 dark:border-primary-800 text-primary-900 dark:text-primary-100 hover:bg-primary-50 dark:hover:bg-primary-900 transition-all"
              title={theme === 'light' ? 'Түн' : 'Күн'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Переключатель языка */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 p-2 rounded-none border-2 border-primary-100 dark:border-primary-800 text-primary-900 dark:text-primary-100 hover:bg-primary-50 dark:hover:bg-primary-900 transition-all font-bold text-xs"
              title={i18n.language === 'kk' ? 'Тілді ауыстыру' : 'Сменить язык'}
            >
              <Languages className="w-5 h-5" />
              <span>{i18n.language.split('-')[0].toUpperCase()}</span>
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="font-bold text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                    <User className="w-4 h-4 mr-2 text-accent-600" />
                    {user?.name || t('common.user')}
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-primary-900 text-white hover:bg-primary-800 rounded-none px-6">
                  {t('common.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-bold text-primary-900 dark:text-primary-100 uppercase tracking-wider">
                    <LogIn className="w-4 h-4 mr-2 text-accent-600" />
                    {t('common.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-accent-600 hover:bg-accent-700 text-white rounded-none px-6 font-bold uppercase tracking-wider">
                    {t('common.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Мобильное меню кнопка */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        {user?.name || t('common.user')}
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                        {t('common.dashboard')}
                      </Button>
                    </Link>
                    <Button variant="secondary" size="sm" className="w-full" onClick={handleLogout}>
                      {t('common.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('common.login')}
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
                        {t('common.register')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


