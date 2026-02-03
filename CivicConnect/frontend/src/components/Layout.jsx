import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  Map,
  User,
  LogOut,
  Heart, // ✅ Added Heart Icon
  Home,
  Info,
  Phone
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const role = localStorage.getItem('role');
  const dashboardPath = role === 'Admin' ? '/admin' : '/dashboard';

  const navItems = [
    { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: dashboardPath },
    { icon: Megaphone, labelKey: 'nav.reportGrievance', path: '/grievances/new' },
    { icon: Calendar, labelKey: 'nav.events', path: '/events' },
    { icon: Map, labelKey: 'nav.cityMap', path: '/map' },
    { icon: Heart, labelKey: 'Donations', path: '/donations' },

    // ✅ Public Pages
    { icon: Home, labelKey: 'home.nav', path: '/' },
    { icon: Info, labelKey: 'about.nav', path: '/about' },
    { icon: Phone, labelKey: 'contact.nav', path: '/contact' },

    { icon: User, labelKey: 'nav.profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* --- SIDEBAR (Fixed Left) --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">

        {/* Logo Area */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <div className="w-5 h-5 bg-emerald-600 rounded-sm" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t('common.appName')}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon size={20} />
                {/* Fallback to labelKey if translation fails (e.g. for 'Donations') */}
                {t(item.labelKey) === item.labelKey ? item.labelKey : t(item.labelKey)}
              </button>
            );
          })}
        </nav>

        {/* Language + Logout (Pinned to Bottom) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div>
            <span className="block text-xs font-medium text-slate-500 mb-2">{t('language.label')}</span>
            <LanguageSwitcher variant="buttons" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={20} />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}