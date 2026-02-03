import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function PublicFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-emerald-400 mb-4">
              <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                <div className="w-5 h-5 bg-emerald-400 rounded-sm" />
              </div>
              <span className="text-lg font-bold">{t('common.appName')}</span>
            </div>
            <p className="text-sm max-w-md">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-emerald-400 transition-colors">{t('home.nav')}</Link></li>
              <li><Link to="/about" className="text-sm hover:text-emerald-400 transition-colors">{t('about.nav')}</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-emerald-400 transition-colors">{t('contact.nav')}</Link></li>
              <li><Link to="/login" className="text-sm hover:text-emerald-400 transition-colors">{t('common.signIn')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400 shrink-0" />
                {t('contact.address')}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-emerald-400 shrink-0" />
                {t('contact.phone')}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                {t('contact.email')}
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-700 text-center text-sm">
          © {currentYear} {t('common.appName')}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
