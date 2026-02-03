import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ShieldCheck, Loader2 } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginPayload = { 
        username: formData.username, 
        password: formData.password 
      };

      // 1. Send Login Request
      const response = await axios.post('http://localhost:8080/api/auth/login', loginPayload);

      // 2. Extract Data
      const { token, role, username } = response.data;

      // 3. Save to Local Storage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      // 4. SMART REDIRECT (The Fix)
      if (role === 'Admin') {
        navigate('/admin'); // Admins go to Command Center
      } else {
        navigate('/dashboard'); // Citizens go to Status Dashboard
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError(t('login.error'));
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
        <div className="bg-emerald-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('login.title')}</h1>
          <p className="text-emerald-100 text-sm mt-1">{t('login.subtitle')}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.username')}</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.password')}</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : t('common.signIn')}
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-slate-400">
              {t('login.noAccount')} <Link to="/register" className="text-emerald-600 hover:underline font-medium">{t('login.createAccount')}</Link>
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