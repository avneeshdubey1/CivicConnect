import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
    AlertCircle, CheckCircle2, MapPin, ArrowRight, Loader2, Clock, MessageSquare, Sparkles,
    Heart, Megaphone, Bell // ✅ NEW: Added Megaphone Icon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Widget = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${className}`}>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
        {children}
    </div>
);

export default function Dashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [grievances, setGrievances] = useState([]);
    const [alerts, setAlerts] = useState([]); // ✅ Store Alerts
    const [readAlertIds, setReadAlertIds] = useState([]); // ✅ Store Read Alert IDs
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState([]);
    const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' or 'ALERTS'

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/grievances', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const allGrievances = response.data;
                // Sort by ID desc for recent list
                const sorted = [...allGrievances].sort((a, b) => b.id - a.id).slice(0, 5);
                setGrievances(sorted);

                // ✅ Process Data for Chart
                processMetrics(allGrievances);

                // ✅ Fetch Alerts
                const alertsResponse = await axios.get('http://localhost:8080/api/alerts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAlerts(alertsResponse.data);

            } catch (error) {
                console.error("Error fetching grievances:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGrievances();

        // Initialize Read Alerts
        const storedReadIds = JSON.parse(localStorage.getItem('readAlertIds') || '[]');
        setReadAlertIds(storedReadIds);

    }, []);

    // ✅ Mark Alert as Read
    const markAsRead = (id) => {
        if (!readAlertIds.includes(id)) {
            const newReadIds = [...readAlertIds, id];
            setReadAlertIds(newReadIds);
            localStorage.setItem('readAlertIds', JSON.stringify(newReadIds));
        }
    };

    const unreadCount = alerts.filter(a => !readAlertIds.includes(a.id)).length;

    // ✅ Helper to Calculate Weekly Stats
    const processMetrics = (data) => {
        const dayCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

        data.forEach(g => {
            // Assuming createdAt format is ISO string
            if (g.createdAt) {
                const date = new Date(g.createdAt);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"
                if (dayCounts[dayName] !== undefined) {
                    dayCounts[dayName]++;
                }
            }
        });

        // Convert to Array for Recharts
        const chartData = Object.keys(dayCounts).map(day => ({
            name: day,
            issues: dayCounts[day]
        }));
        setMetrics(chartData);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.title')}</h2>
                    <p className="text-slate-500">{t('dashboard.welcome')}</p>
                </div>
                <button
                    onClick={() => navigate('/grievances/new')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
                >
                    <AlertCircle size={16} /> {t('dashboard.reportNewIssue')}
                </button>
            </div>

            {/* ✅ TABS */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button onClick={() => setActiveTab('OVERVIEW')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <BarChart size={16} /> Overview
                </button>
                <button onClick={() => setActiveTab('ALERTS')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ALERTS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Megaphone size={16} /> Alerts
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{unreadCount}</span>}
                </button>
            </div>

            {/* ✅ OVERVIEW TAB CONTENT */}
            {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* CHART WIDGET */}
                    <Widget title={t('dashboard.grievanceTrends')} className="md:col-span-8 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="issues" fill="#059669" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Widget>

                    {/* AI INSIGHTS WIDGET */}
                    {/* AI INSIGHTS WIDGET */}
                    <Widget title={t('dashboard.aiInsights')} className="md:col-span-4 h-80 bg-slate-900 border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Loader2 size={100} className="text-emerald-500" />
                        </div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.liveAnalysis')}</span>
                                </div>

                                {/* ✅ Dynamic AI Content */}
                                {grievances.length > 0 && grievances[0].aiAnalysisJson ? (() => {
                                    try {
                                        const latestAnalysis = JSON.parse(grievances[0].aiAnalysisJson);
                                        return (
                                            <div className="text-slate-300 text-sm leading-relaxed">
                                                <p className="font-bold text-white mb-1">Latest Issue: {grievances[0].category}</p>
                                                <p>Risk: <span className={latestAnalysis.risk_level === 'HIGH' ? 'text-red-400' : 'text-emerald-400'}>{latestAnalysis.risk_level}</span></p>
                                                <p className="mt-2 text-xs opacity-80 line-clamp-3">"{latestAnalysis.citizen_update_message}"</p>
                                            </div>
                                        );
                                    } catch (e) {
                                        return <p className="text-slate-300 text-sm">{t('dashboard.aiMessageWithReport', { category: grievances[0].category })}</p>;
                                    }
                                })() : (
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {grievances.length > 0
                                            ? t('dashboard.aiMessageWithReport', { category: grievances[0].category })
                                            : t('dashboard.aiMessageNoReport')}
                                    </p>
                                )}

                            </div>
                            <div className="p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 mt-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-2">
                                    <span>{t('dashboard.systemStatus')}</span>
                                    <span className="text-emerald-400 font-bold">{t('dashboard.operational')}</span>
                                </div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[90%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </Widget>

                    {/* RECENT ACTIVITY WIDGET */}
                    <Widget title={t('dashboard.recentActivity')} className="md:col-span-7">
                        {isLoading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div>
                        ) : grievances.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">{t('dashboard.noReports')}</div>
                        ) : (
                            <div className="space-y-4">
                                {grievances.map((grievance) => (
                                    <div key={grievance.id} className="flex flex-col p-4 bg-white border border-slate-100 shadow-sm rounded-xl transition-all hover:shadow-md group">

                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 
                                        ${grievance.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {grievance.status === 'RESOLVED' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-slate-900">{grievance.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                                            {grievance.category}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase 
                                                ${grievance.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                                                                grievance.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                                                    'bg-blue-50 text-blue-600'}`}>
                                                            {grievance.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border 
                                    ${grievance.status === 'RESOLVED'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : grievance.status === 'REJECTED'
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {grievance.status}
                                            </span>
                                        </div>

                                        {/* AI ACTION PLAN CARD */}
                                        {grievance.aiAnalysisJson && (() => {
                                            try {
                                                const actionPlan = JSON.parse(grievance.aiAnalysisJson);
                                                return (
                                                    <div className="mb-4 mt-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <Sparkles size={16} className="text-purple-600" />
                                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">AI Action Plan</span>
                                                            </div>
                                                            <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-medium">
                                                                Est. Time: {actionPlan.estimated_resolution_time_hours} hrs
                                                            </span>
                                                        </div>

                                                        <div className="p-4 space-y-3">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-1.5 min-w-[8px] h-2 rounded-full ${actionPlan.risk_level === 'HIGH' ? 'bg-red-500' :
                                                                    actionPlan.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                                                                    }`} />
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-700">
                                                                        Risk Assessment: <span className={`${actionPlan.risk_level === 'HIGH' ? 'text-red-600' :
                                                                            actionPlan.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-blue-600'
                                                                            }`}>{actionPlan.risk_level}</span>
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-1">{actionPlan.reason_for_risk}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 mt-2">
                                                                <div className="w-1 bg-purple-200 rounded-full"></div>
                                                                <p className="text-xs text-slate-500 italic py-1">"{actionPlan.citizen_update_message}"</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            } catch (e) { return null; }
                                        })()}

                                        {grievance.resolutionRemark && (
                                            <div className="ml-14 mt-1 p-2 bg-slate-100 rounded text-xs text-slate-600 flex items-start gap-2">
                                                <MessageSquare size={12} className="mt-0.5 text-slate-400" />
                                                <span><span className="font-semibold text-slate-700">{t('dashboard.adminResponse')}:</span> {grievance.resolutionRemark}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Widget>

                    {/* QUICK ACTIONS WIDGET */}
                    <Widget title={t('dashboard.quickActions')} className="md:col-span-5">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* 1. View Map Button */}
                            <button onClick={() => navigate('/map')} className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all group text-center">
                                <MapPin className="text-slate-400 group-hover:text-emerald-600 mb-2" size={24} />
                                <span className="text-sm font-semibold">{t('dashboard.viewMap')}</span>
                            </button>

                            {/* 2. My Events Button */}
                            <button onClick={() => navigate('/my-events')} className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all group text-center">
                                <ArrowRight className="text-slate-400 group-hover:text-blue-600 mb-2" size={24} />
                                <span className="text-sm font-semibold">My Events</span>
                            </button>

                            {/* 3. ✅ NEW: Donate Button */}
                            <button onClick={() => navigate('/donations')} className="col-span-2 flex flex-row items-center justify-center gap-3 p-4 border border-slate-100 bg-slate-50 rounded-lg hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-all group text-center">
                                <Heart className="text-slate-400 group-hover:text-red-600" size={24} />
                                <span className="text-sm font-semibold">Make a Donation</span>
                            </button>
                        </div>
                    </Widget>

                </div>
            )}

            {/* ✅ ALERTS TAB CONTENT */}
            {activeTab === 'ALERTS' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {alerts.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                            <Bell size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No Active Alerts</h3>
                            <p className="text-slate-500">There are currently no community alerts or warnings.</p>
                        </div>
                    ) : (
                        alerts.map(alert => {
                            const isRead = readAlertIds.includes(alert.id);
                            return (
                                <div key={alert.id} className={`p-6 rounded-xl border-l-4 shadow-sm transition-all ${isRead
                                        ? 'bg-slate-50 border-slate-300 opacity-60'
                                        : `bg-white ${alert.severity === 'CRITICAL' ? 'border-red-500' :
                                            alert.severity === 'HIGH' ? 'border-orange-500' :
                                                alert.severity === 'MEDIUM' ? 'border-amber-500' :
                                                    'border-blue-500'
                                        }`
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-full ${isRead
                                                    ? 'bg-slate-200 text-slate-500'
                                                    : alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                                        alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                                                            alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-blue-100 text-blue-600'
                                                }`}>
                                                <Megaphone size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-lg ${isRead ? 'text-slate-500' : 'text-slate-900'}`}>{alert.title}</h4>
                                                <p className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${isRead
                                                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                                                    : alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        alert.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                            alert.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {alert.severity}
                                            </span>

                                            {/* ✅ Mark as Read Button */}
                                            {!isRead && (
                                                <button
                                                    onClick={() => markAsRead(alert.id)}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                                    title="Mark as Read"
                                                >
                                                    <CheckCircle2 size={14} /> Mark Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`mt-3 leading-relaxed ml-12 ${isRead ? 'text-slate-400' : 'text-slate-700'}`}>
                                        {alert.message}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}