import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
    CheckCircle, XCircle, Clock, Filter, MessageSquare, Image as ImageIcon, X,
    Users, FileText, Heart, IndianRupee, Megaphone, Bell, Send // ✅ New Icons for Alerts
} from 'lucide-react';
import CivicPulse from '../components/CivicPulse';
import AdminAiInsight from '../components/AdminInsightCard';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('GRIEVANCES'); // 'GRIEVANCES', 'USERS', or 'DONATIONS'
    const [grievances, setGrievances] = useState([]);
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [messages, setMessages] = useState([]); // ✅ Store messages
    const [alerts, setAlerts] = useState([]); // ✅ Store alerts
    const [newAlert, setNewAlert] = useState({ title: '', message: '', severity: 'INFO', city: '' });
    const [sendingAlert, setSendingAlert] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [selectedImage, setSelectedImage] = useState(null);
    const { t } = useTranslation();

    // Fetch Data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                if (activeTab === 'GRIEVANCES') {
                    const response = await axios.get('http://localhost:8080/api/grievances', config);
                    setGrievances(response.data.sort((a, b) => b.id - a.id));
                } else if (activeTab === 'USERS') {
                    const response = await axios.get('http://localhost:8080/api/admin/users', config);
                    setUsers(response.data);
                } else if (activeTab === 'DONATIONS') {
                    const response = await axios.get('http://localhost:8080/api/admin/donations', config);
                    setDonations(response.data);
                } else if (activeTab === 'MESSAGES') { // ✅ Fetch Messages
                    const response = await axios.get('http://localhost:8080/api/contact', config);
                    setMessages(response.data.sort((a, b) => b.id - a.id));
                } else if (activeTab === 'ALERTS') { // ✅ Fetch Alerts
                    const response = await axios.get('http://localhost:8080/api/alerts', config);
                    setAlerts(response.data); // Already sorted by backend
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, [activeTab]);

    // ✅ Update Status Function
    const updateStatus = async (id, newStatus) => {
        const remark = prompt(`Enter a remark for changing status to ${newStatus}:`);
        if (remark === null) return; // Cancelled

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/grievances/${id}/status`,
                { status: newStatus, resolutionRemark: remark },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update UI locally
            setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: newStatus, resolutionRemark: remark } : g));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status.");
        }
    };

    // ✅ Reply to Message
    const replyToMessage = async (id, subject) => {
        const reply = prompt(`Reply to: ${subject}`);
        if (!reply) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/contact/${id}/reply`,
                { reply },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Reply sent successfully!");
            // Update UI
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'RESOLVED', adminReply: reply } : m));
        } catch (error) {
            console.error("Failed to send reply", error);
            alert("Failed to send reply.");
        }
    };

    // ✅ Create new Alert
    const handleBroadcastAlert = async (e) => {
        e.preventDefault();
        if (!newAlert.title || !newAlert.message) return;

        if (!confirm("Are you sure you want to broadcast this alert to ALL users? This will send Emails and SMS.")) return;

        setSendingAlert(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/alerts',
                newAlert,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAlerts([response.data, ...alerts]);
            setNewAlert({ title: '', message: '', severity: 'INFO' });
            alert("Alert Broadcasted Successfully!");
        } catch (error) {
            console.error("Failed to send alert", error);
            alert("Failed to broadcast alert.");
        } finally {
            setSendingAlert(false);
        }
    };

    const filteredGrievances = grievances.filter(g => filter === 'ALL' ? true : g.status === filter);

    return (
        <div className="space-y-6 relative">
            <CivicPulse />

            {/* Popup Modal (Keep existing) */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-3xl w-full bg-white rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><X size={20} /></button>
                        <img src={selectedImage} alt="Evidence" className="w-full h-auto max-h-[80vh] object-contain bg-slate-100" />
                    </div>
                </div>
            )}

            {/* Header & Tabs */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('admin.title')}</h2>
                    <p className="text-slate-500">{t('admin.subtitle')}</p>
                </div>

                {/* TAB SWITCHER */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('GRIEVANCES')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'GRIEVANCES' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <FileText size={16} /> {t('admin.tabs.grievances')}
                    </button>
                    <button onClick={() => setActiveTab('USERS')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'USERS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Users size={16} /> {t('admin.tabs.users')}
                    </button>
                    {/* ✅ NEW DONATIONS TAB */}
                    <button onClick={() => setActiveTab('DONATIONS')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'DONATIONS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Heart size={16} /> {t('admin.tabs.transactions')}
                    </button>
                    {/* ✅ NEW MESSAGES TAB */}
                    <button onClick={() => setActiveTab('MESSAGES')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'MESSAGES' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <MessageSquare size={16} /> {t('admin.tabs.inquiries')}
                    </button>
                    {/* ✅ NEW ALERTS TAB */}
                    <button onClick={() => setActiveTab('ALERTS')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ALERTS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Megaphone size={16} /> Alerts
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            {activeTab === 'GRIEVANCES' && (
                // ... Keep your existing Grievances Table Code here ...
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* (Paste your existing Grievance table code here to save space) */}
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-28">{t('admin.table.evidence')}</th>
                                <th className="px-6 py-4 w-5/12">{t('admin.table.titleAnalysis')}</th>
                                <th className="px-6 py-4">{t('admin.table.statusRemark')}</th>
                                <th className="px-6 py-4 text-right">{t('admin.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGrievances.map((g) => (
                                <tr key={g.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 align-top">
                                        {g.grievanceImage ? (
                                            <button onClick={() => setSelectedImage(g.grievanceImage)} className="w-16 h-16 rounded-lg overflow-hidden border hover:ring-2 hover:ring-emerald-500">
                                                <img src={g.grievanceImage} alt="Thumb" className="w-full h-full object-cover" />
                                            </button>
                                        ) : <div className="w-16 h-16 rounded-lg bg-slate-50 border flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <p className="font-semibold text-slate-900">{g.title}</p>
                                        <div className="flex gap-2 mt-1 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border">{g.category}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${g.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{g.priority} Priority</span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-3 mb-2">{g.description}</p>
                                        <AdminAiInsight grievanceId={g.id} />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${g.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : g.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {g.status}
                                        </span>
                                        {g.resolutionRemark && <div className="mt-2 p-2 bg-slate-50 rounded-lg border text-xs text-slate-600">{g.resolutionRemark}</div>}
                                    </td>
                                    <td className="px-6 py-4 align-top text-right space-y-2">
                                        {g.status === 'PENDING' && (
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => updateStatus(g.id, 'IN_PROGRESS')} className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors">
                                                    <Clock size={14} className="mr-1.5" /> {t('admin.buttons.investigate')}
                                                </button>
                                                <button onClick={() => updateStatus(g.id, 'REJECTED')} className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">
                                                    <XCircle size={14} className="mr-1.5" /> {t('admin.buttons.reject')}
                                                </button>
                                            </div>
                                        )}
                                        {g.status === 'IN_PROGRESS' && (
                                            <button onClick={() => updateStatus(g.id, 'RESOLVED')} className="w-full flex items-center justify-center px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors">
                                                <CheckCircle size={14} className="mr-1.5" /> {t('admin.buttons.resolve')}
                                            </button>
                                        )}
                                        {(g.status === 'RESOLVED' || g.status === 'REJECTED') && (
                                            <span className="block text-right text-xs text-slate-400 italic">No further actions</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'USERS' && (
                // ... Keep your existing Users Table Code here ...
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-400">#{user.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-slate-100 text-xs font-bold">{user.role}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ✅ NEW: DONATIONS TABLE */}
            {activeTab === 'DONATIONS' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">TXN ID</th>
                                <th className="px-6 py-4">Donor</th>
                                <th className="px-6 py-4">Beneficiary NGO</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {donations.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{d.stripePaymentId}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{d.donor?.username || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* Small Logo */}
                                            {d.ngo?.logoUrl && <img src={d.ngo.logoUrl} alt="Logo" className="w-6 h-6 rounded-full object-cover" />}
                                            <span className="font-medium text-slate-700">{d.ngo?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-emerald-600 flex items-center gap-1">
                                        <IndianRupee size={14} /> {d.amount}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {new Date(d.donationDate).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wide">
                                            {d.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {donations.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ✅ NEW: MESSAGES TABLE */}
            {activeTab === 'MESSAGES' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-1/4">{t('admin.table.userInfo')}</th>
                                <th className="px-6 py-4 w-1/3">{t('admin.table.message')}</th>
                                <th className="px-6 py-4">{t('admin.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('admin.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {messages.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 align-top">
                                        <p className="font-semibold text-slate-900">{m.name}</p>
                                        <p className="text-xs text-slate-500">{m.email}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(m.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <p className="font-medium text-slate-800 mb-1">{m.subject}</p>
                                        <p className="text-slate-600 text-xs mb-2">{m.message}</p>
                                        {m.adminReply && (
                                            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-800">
                                                <strong>Reply:</strong> {m.adminReply}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${m.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-top text-right">
                                        {m.status !== 'RESOLVED' && (
                                            <button onClick={() => replyToMessage(m.id, m.subject)} className="text-xs font-bold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                                                {t('admin.buttons.reply')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {messages.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No new inquiries.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ✅ NEW: ALERTS TAB */}
            {activeTab === 'ALERTS' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Create Alert Form */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Megaphone size={20} className="text-emerald-600" /> Broadcast New Alert
                        </h3>
                        <form onSubmit={handleBroadcastAlert} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alert Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="e.g. Heavy Rain Warning in Sector 4"
                                        value={newAlert.title}
                                        onChange={e => setNewAlert({ ...newAlert, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Severity</label>
                                    <select
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={newAlert.severity}
                                        onChange={e => setNewAlert({ ...newAlert, severity: e.target.value })}
                                    >
                                        <option value="INFO">Info</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City / Region (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="e.g. Mumbai, Delhi, or leave blank for General"
                                        value={newAlert.city}
                                        onChange={e => setNewAlert({ ...newAlert, city: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                                    placeholder="Detailed description of the alert..."
                                    value={newAlert.message}
                                    onChange={e => setNewAlert({ ...newAlert, message: e.target.value })}
                                    required
                                ></textarea>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    * This message will be sent to all registered users via Email and SMS (if configured).
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={sendingAlert}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {sendingAlert ? 'Broadcasting...' : <><Send size={18} /> Send Broadcast</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Past Alerts List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h4 className="font-bold text-slate-700">Recent Broadcasts</h4>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {alerts.map(alert => (
                                <div key={alert.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h5 className="font-bold text-slate-900 flex items-center gap-2">
                                                {alert.title}
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            'bg-blue-100 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {alert.severity}
                                                </span>
                                            </h5>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(alert.createdAt).toLocaleString()} • {alert.city || "General"} • Broadcasted via Email & SMS
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        {alert.message}
                                    </p>
                                </div>
                            ))}
                            {alerts.length === 0 && (
                                <div className="p-12 text-center text-slate-400 text-sm">
                                    No alerts have been broadcasted yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}