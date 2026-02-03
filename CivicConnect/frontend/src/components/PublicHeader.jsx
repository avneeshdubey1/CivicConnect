import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function PublicHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', labelKey: 'home.nav' },
    { path: '/about', labelKey: 'about.nav' },
    { path: '/contact', labelKey: 'contact.nav' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-emerald-600">
            <img src="/logo.png" alt="CivicConnect Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold tracking-tight text-slate-900">{t('common.appName')}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ path, labelKey }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm font-medium transition-colors ${location.pathname === path
                  ? 'text-emerald-600'
                  : 'text-slate-600 hover:text-emerald-600'
                  }`}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher variant="buttons" />
            {localStorage.getItem('token') ? (
              <Link
                to={localStorage.getItem('role') === 'Admin' ? '/admin' : '/dashboard'}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {t('common.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  {t('login.createAccount')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3">
            {navLinks.map(({ path, labelKey }) => (
              <Link
                key={path}
                to={path}
                className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(labelKey)}
              </Link>
            ))}
            <div className="pt-3 px-4 flex flex-col gap-2">
              <LanguageSwitcher variant="buttons" />
              {localStorage.getItem('token') ? (
                <Link
                  to={localStorage.getItem('role') === 'Admin' ? '/admin' : '/dashboard'}
                  className="block text-center rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-center py-2 text-sm font-medium text-slate-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('login.createAccount')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
