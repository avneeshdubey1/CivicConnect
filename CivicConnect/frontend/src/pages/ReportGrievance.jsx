import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, Loader2, FileDown, CheckCircle } from 'lucide-react';

export default function ReportGrievance() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'SANITATION',
    priority: 'LOW',
    location: '',
    grievanceImage: '' // <--- New State for Image
  });

  // --- LOGIC: Convert Image to Base64 String ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit file size to 2MB to prevent crashes
      if (file.size > 2000000) {
        alert(t('grievance.fileTooLarge'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, grievanceImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/grievances', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ FIX 1: Use 'id' instead of 'complaintId' so the modal appears
      setSubmittedComplaintId(response.data.id);
      
      // ✅ FIX 2: Stop the loading spinner
      setLoading(false);

    } catch (error) {
      console.error(error);
      alert(t('grievance.error'));
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIX 3: Updated URL to match the new Grievance Controller endpoint
      const response = await axios.get(
        `http://localhost:8080/api/grievances/${submittedComplaintId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // ✅ FIX 4: Updated filename
      link.setAttribute('download', `grievance-${submittedComplaintId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF');
    }
  };

  const closeSuccessModal = () => {
    setSubmittedComplaintId(null);
    setLoading(false);
    navigate('/dashboard');
  };

  const categoryKeys = ['SANITATION', 'ROADS', 'ELECTRICITY', 'WATER', 'OTHER'];
  const priorityKeys = ['LOW', 'MEDIUM', 'HIGH'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Modal */}
      {submittedComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Complaint Submitted Successfully!
              </h3>
              <p className="text-slate-600 mb-1">
                Your complaint has been registered with ID:
              </p>
              <p className="text-2xl font-bold text-emerald-600 mb-4">
                #{submittedComplaintId}
              </p>
              <p className="text-sm text-slate-500">
                You can download a PDF receipt of your complaint for your records.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadPdf}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                <FileDown size={18} />
                Download PDF
              </button>
              <button
                onClick={closeSuccessModal}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t('grievance.title')}</h2>
        <p className="text-slate-500">{t('grievance.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('grievance.issueTitle')}</label>
          <input
            required type="text" placeholder={t('grievance.issueTitlePlaceholder')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('grievance.category')}</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categoryKeys.map((key) => (
                <option key={key} value={key}>{t(`grievance.categories.${key}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('grievance.priority')}</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              {priorityKeys.map((key) => (
                <option key={key} value={key}>{t(`grievance.priorities.${key}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('grievance.exactLocation')}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              required type="text" placeholder={t('grievance.locationPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('grievance.description')}</label>
          <textarea
            required rows="3" placeholder={t('grievance.descriptionPlaceholder')}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">{t('grievance.evidencePhoto')}</label>

          {!formData.grievanceImage ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group">
              <input
                type="file" accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleImageUpload}
              />
              <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                <Upload size={32} />
                <span className="text-sm font-medium">{t('grievance.uploadPhoto')}</span>
                <span className="text-xs text-slate-400">({t('grievance.maxSize')})</span>
              </div>
            </div>
          ) : (
            // 2. Preview Box (if image selected)
            <div className="relative inline-block mt-2 group">
              <img
                src={formData.grievanceImage}
                alt="Preview"
                className="h-40 w-auto rounded-lg border border-slate-200 shadow-md object-cover"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, grievanceImage: '' })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : t('grievance.submitReport')}
        </button>
      </form>
    </div>
  );
}