import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'hi', labelKey: 'language.hi' },
  { code: 'ta', labelKey: 'language.ta' },
  { code: 'mr', labelKey: 'language.mr' },
];

export default function LanguageSwitcher({ variant = 'dropdown' }) {
  const { i18n, t } = useTranslation();
  const currentLang = (i18n.language || 'en').split('-')[0];

  if (variant === 'buttons') {
    return (
      // FIX: Added 'flex-wrap' to prevent overflow and allow buttons to stack
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            // FIX: Added 'flex-1' so buttons expand evenly (looks like a grid in sidebar)
            // Added 'whitespace-nowrap' to prevent text breaking inside buttons
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentLang === lang.code
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t(lang.labelKey)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        aria-label={t('language.label')}
      >
        <Globe size={18} className="text-slate-500" />
        <span className="font-medium">{t(`language.${currentLang}`)}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 py-1 w-32 bg-white rounded-lg border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 rounded-none first:rounded-t-lg last:rounded-b-lg ${
              currentLang === lang.code ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'
            }`}
          >
            {t(lang.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}