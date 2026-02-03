import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const CONTACT_HERO = 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&q=80';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  /* import axios from 'axios'; -- make sure to add this import at top if missing, checking file content */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:8080/api/contact', formData);
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-72 overflow-hidden">
          <img
            src={CONTACT_HERO}
            alt="Contact us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">{t('contact.hero.title')}</h1>
              <p className="mt-4 text-slate-200 max-w-xl mx-auto">{t('contact.hero.subtitle')}</p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact info + image */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.info.heading')}</h2>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">{t('contact.addressLabel')}</span>
                      <p className="text-slate-600 mt-1">{t('contact.address')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">{t('contact.phoneLabel')}</span>
                      <p className="text-slate-600 mt-1">{t('contact.phone')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">{t('contact.emailLabel')}</span>
                      <p className="text-slate-600 mt-1">{t('contact.email')}</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-10 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <div className="h-64 bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                    {t('contact.mapPlaceholder')}
                  </div>
                </div>
              </div>

              {/* Form */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('contact.form.heading')}</h2>
                {sent ? (
                  <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                    {t('contact.form.success')}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.form.name')}</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.form.email')}</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.form.subject')}</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.form.message')}</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      {t('contact.form.submit')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
