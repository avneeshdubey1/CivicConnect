import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Megaphone, MapPin, Calendar, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const HERO_IMAGE = '/hero-bg-v2.png';
const FEATURE_IMAGE = '/feature-img.png';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Megaphone,
      titleKey: 'home.features.reportTitle',
      descKey: 'home.features.reportDesc',
    },
    {
      icon: MapPin,
      titleKey: 'home.features.mapTitle',
      descKey: 'home.features.mapDesc',
    },
    {
      icon: Calendar,
      titleKey: 'home.features.eventsTitle',
      descKey: 'home.features.eventsDesc',
    },
    {
      icon: Shield,
      titleKey: 'home.features.secureTitle',
      descKey: 'home.features.secureDesc',
    },
  ];

  const benefits = [
    'home.benefits.one',
    'home.benefits.two',
    'home.benefits.three',
    'home.benefits.four',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_IMAGE}
              alt="Community"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-slate-900/60" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              {t('home.hero.title')}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-200">
              {t('home.hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg"
              >
                {t('home.hero.cta')}
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/80 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {t('home.hero.contact')}
              </Link>
            </div>
          </div>
        </section>

        {/* Features with image */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">{t('home.features.heading')}</h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">{t('home.features.subheading')}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={FEATURE_IMAGE}
                  alt="Citizens and community"
                  className="rounded-2xl shadow-xl w-full object-cover h-80 lg:h-96"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map(({ icon: Icon, titleKey, descKey }) => (
                  <div key={titleKey} className="p-6 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                        <Icon size={22} />
                      </div>
                      <h3 className="font-semibold text-slate-900">{t(titleKey)}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{t(descKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits / CTA */}
        <section className="py-20 bg-emerald-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white">{t('home.cta.heading')}</h2>
              <p className="mt-4 text-emerald-100 text-lg">{t('home.cta.subtitle')}</p>
              <ul className="mt-8 space-y-4 text-left sm:inline-block sm:text-left">
                {benefits.map((key) => (
                  <li key={key} className="flex items-center gap-3 text-white">
                    <CheckCircle2 size={24} className="text-emerald-200 shrink-0" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-10 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-emerald-600 hover:bg-slate-50 transition-colors shadow-lg"
              >
                {t('home.cta.button')}
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
