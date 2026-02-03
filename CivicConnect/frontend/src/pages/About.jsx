import { useTranslation } from 'react-i18next';
import { Target, Heart, Users, Award } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const ABOUT_HERO = '/about-hero.png';
const ABOUT_TEAM = '/about-team.png';
const ABOUT_COMMUNITY = '/about-community.png';

export default function About() {
  const { t } = useTranslation();

  const values = [
    { icon: Target, image: '/card-mission.png', titleKey: 'about.values.missionTitle', descKey: 'about.values.missionDesc' },
    { icon: Heart, image: '/card-trust.png', titleKey: 'about.values.trustTitle', descKey: 'about.values.trustDesc' },
    { icon: Users, image: '/card-inclusive.png', titleKey: 'about.values.inclusiveTitle', descKey: 'about.values.inclusiveDesc' },
    { icon: Award, image: '/card-excellence.png', titleKey: 'about.values.excellenceTitle', descKey: 'about.values.excellenceDesc' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[500px] flex items-center overflow-hidden">
          <img
            src={ABOUT_HERO}
            alt="Community"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">{t('about.hero.title')}</h1>
              <p className="mt-4 text-slate-200 max-w-2xl mx-auto">{t('about.hero.subtitle')}</p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{t('about.story.title')}</h2>
                <p className="mt-6 text-slate-600 leading-relaxed">{t('about.story.para1')}</p>
                <p className="mt-4 text-slate-600 leading-relaxed">{t('about.story.para2')}</p>
              </div>
              <div className="relative h-full min-h-[400px]">
                <img
                  src={ABOUT_TEAM}
                  alt="Team and collaboration"
                  className="rounded-2xl shadow-xl w-full h-full object-cover object-center absolute inset-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">{t('about.values.heading')}</h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">{t('about.values.subheading')}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map(({ titleKey, descKey, image }) => (
                <div key={titleKey} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-slate-50 p-3 border border-slate-100 flex items-center justify-center">
                    <img
                      src={image}
                      alt={t(titleKey)}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm text-slate-600">{t(descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community image + CTA */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden min-h-[500px]">
              <img
                src={ABOUT_COMMUNITY}
                alt="Community engagement"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <div className="text-center px-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{t('about.cta.title')}</h2>
                  <p className="mt-4 text-slate-200 max-w-xl mx-auto">{t('about.cta.subtitle')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
