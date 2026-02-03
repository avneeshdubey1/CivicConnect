import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState(''); // ✅ New State
  const [passwordError, setPasswordError] = useState(''); // ✅ New State

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');
    setPasswordError('');

    // ✅ Frontend Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

    let isValid = true;

    if (!emailRegex.test(formData.email)) {
      setEmailError('Invalid email format (must contain @)');
      isValid = false;
    }

    if (!passwordRegex.test(formData.password)) {
      setPasswordError('Password must contain at least 6 characters, one letter, and one number.');
      isValid = false;
    }

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      // Matches your Backend RegisterDto exactly
      await axios.post('http://localhost:8080/api/auth/register', formData);
      alert(t('register.success'));
      navigate('/login');
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.response?.data?.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher variant="buttons" />
        </div>
        <div className="bg-emerald-600 p-6 text-center relative">
          <Link to="/" className="absolute left-4 top-4 text-emerald-100 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">{t('register.title')}</h1>
          <p className="text-emerald-100 text-xs mt-1">{t('register.subtitle')}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('register.username')}</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('register.email')}</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {/* ✅ Email Error */}
              {emailError && <span className="text-red-500 text-xs font-bold mt-1 block">{emailError}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('register.mobileNumber')}</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('register.password')}</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {/* ✅ Password Error */}
              {passwordError && <span className="text-red-500 text-xs font-bold mt-1 block">{passwordError}</span>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : t('register.createAccount')}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-slate-400">
              {t('register.hasAccount')} <Link to="/login" className="text-emerald-600 hover:underline font-bold">{t('register.signIn')}</Link>
            </p>
            <p className="text-xs text-slate-400">
              <Link to="/" className="text-slate-500 hover:text-slate-700">{t('common.back')} {t('home.nav')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}