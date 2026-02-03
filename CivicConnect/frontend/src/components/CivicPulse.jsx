import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

export default function CivicPulse() {
    const [pulseData, setPulseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCivicPulse();
    }, []);

    const fetchCivicPulse = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/admin/civic-pulse', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPulseData(response.data);
        } catch (error) {
            console.error('Error fetching civic pulse:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!pulseData) {
        return null;
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'HEALTHY':
                return {
                    icon: '🟢',
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-200',
                    label: 'Healthy'
                };
            case 'WARNING':
                return {
                    icon: '🟡',
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    label: 'Warning'
                };
            case 'CRITICAL':
                return {
                    icon: '🔴',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    label: 'Critical'
                };
            default:
                return {
                    icon: '⚪',
                    color: 'text-slate-600',
                    bgColor: 'bg-slate-50',
                    borderColor: 'border-slate-200',
                    label: 'Unknown'
                };
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'INCREASING':
                return <TrendingUp size={16} className="text-red-500" />;
            case 'DECREASING':
                return <TrendingDown size={16} className="text-emerald-500" />;
            default:
                return <Minus size={16} className="text-slate-400" />;
        }
    };

    const statusConfig = getStatusConfig(pulseData.status);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`${statusConfig.bgColor} border-b ${statusConfig.borderColor} p-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{statusConfig.icon}</div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Civic Pulse Index</h3>
                            <p className={`text-sm font-semibold ${statusConfig.color}`}>
                                {statusConfig.label} • Score: {pulseData.score}/100
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Activity size={16} />
                            <span>Live Metrics</span>
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-sm text-slate-700">{pulseData.message}</p>
            </div>

            {/* Metrics Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Complaint Metrics */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 text-sm">Complaints</h4>
                        <AlertCircle size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Total</span>
                            <span className="font-semibold text-slate-900">
                                {pulseData.complaintMetrics.totalComplaints}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Open</span>
                            <span className="font-semibold text-amber-600">
                                {pulseData.complaintMetrics.openComplaints}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Resolved</span>
                            <span className="font-semibold text-emerald-600">
                                {pulseData.complaintMetrics.resolvedComplaints}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">Resolution Rate</span>
                                <span className="font-bold text-slate-900">
                                    {pulseData.complaintMetrics.resolutionRate}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-1">
                                <span className="text-slate-600">Trend</span>
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(pulseData.complaintMetrics.trend)}
                                    <span className="font-semibold text-slate-700">
                                        {pulseData.complaintMetrics.trend}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resolution Metrics */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 text-sm">Resolution Speed</h4>
                        <Clock size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Avg. Resolution</span>
                            <span className="font-semibold text-slate-900">
                                {pulseData.resolutionMetrics.averageResolutionDays} days
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Last 7 Days</span>
                            <span className="font-semibold text-emerald-600">
                                {pulseData.resolutionMetrics.complaintsResolvedLast7Days} resolved
                            </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">Performance</span>
                                <span className={`font-bold px-2 py-0.5 rounded-full ${pulseData.resolutionMetrics.performance === 'EXCELLENT'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : pulseData.resolutionMetrics.performance === 'GOOD'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {pulseData.resolutionMetrics.performance}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Volunteer Metrics */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 text-sm">Volunteer Activity</h4>
                        <Users size={18} className="text-slate-400" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Total Events</span>
                            <span className="font-semibold text-slate-900">
                                {pulseData.volunteerMetrics.totalEvents}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Upcoming</span>
                            <span className="font-semibold text-blue-600">
                                {pulseData.volunteerMetrics.upcomingEvents}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Total Volunteers</span>
                            <span className="font-semibold text-emerald-600">
                                {pulseData.volunteerMetrics.totalVolunteers}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">Engagement</span>
                                <span className={`font-bold px-2 py-0.5 rounded-full ${pulseData.volunteerMetrics.engagement === 'HIGH'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : pulseData.volunteerMetrics.engagement === 'MEDIUM'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-slate-100 text-slate-700'
                                    }`}>
                                    {pulseData.volunteerMetrics.engagement}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Bar */}
            <div className="px-6 pb-6">
                <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${pulseData.status === 'HEALTHY' ? 'bg-emerald-500' :
                                pulseData.status === 'WARNING' ? 'bg-amber-500' :
                                    'bg-red-500'
                            }`}
                        style={{ width: `${pulseData.score}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>0</span>
                    <span>Critical (0-39)</span>
                    <span>Warning (40-69)</span>
                    <span>Healthy (70-100)</span>
                    <span>100</span>
                </div>
            </div>
        </div>
    );
}
