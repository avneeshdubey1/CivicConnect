import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Tag, Loader2, Edit, Trash2 } from 'lucide-react';

const categoryColors = {
    CLEAN_CITY_DRIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    AWARENESS_WORKSHOP: 'bg-blue-100 text-blue-700 border-blue-200',
    SOCIAL_CAMPAIGN: 'bg-purple-100 text-purple-700 border-purple-200',
    HEALTH_CAMP: 'bg-red-100 text-red-700 border-red-200',
    TREE_PLANTATION: 'bg-green-100 text-green-700 border-green-200',
    BLOOD_DONATION: 'bg-rose-100 text-rose-700 border-rose-200',
    COMMUNITY_MEETING: 'bg-amber-100 text-amber-700 border-amber-200'
};

const categoryLabels = {
    CLEAN_CITY_DRIVE: 'Clean City Drive',
    AWARENESS_WORKSHOP: 'Awareness Workshop',
    SOCIAL_CAMPAIGN: 'Social Campaign',
    HEALTH_CAMP: 'Health Camp',
    TREE_PLANTATION: 'Tree Plantation',
    BLOOD_DONATION: 'Blood Donation',
    COMMUNITY_MEETING: 'Community Meeting'
};

export default function MyEvents() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('registrations');
    const [registrations, setRegistrations] = useState([]);
    const [createdEvents, setCreatedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role || 'Citizen');
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch registrations
            const regResponse = await axios.get('http://localhost:8080/api/events/my-registrations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistrations(regResponse.data);

            // Fetch created events if admin
            const role = localStorage.getItem('role');
            if (role === 'Admin') {
                const createdResponse = await axios.get('http://localhost:8080/api/events/my-events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCreatedEvents(createdResponse.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnregister = async (eventId) => {
        if (!confirm('Are you sure you want to unregister from this event?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/events/${eventId}/register`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Successfully unregistered from event');
            fetchMyEvents();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unregister');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to cancel this event?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Event cancelled successfully');
            fetchMyEvents();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to cancel event');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const EventRow = ({ event, showActions = true, actionType = 'unregister' }) => (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${categoryColors[event.category]}`}>
                        {categoryLabels[event.category]}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${event.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            event.status === 'ONGOING' ? 'bg-green-50 text-green-700 border border-green-200' :
                                event.status === 'COMPLETED' ? 'bg-slate-50 text-slate-700 border border-slate-200' :
                                    'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {event.status}
                    </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{event.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span className="truncate max-w-xs">{event.venue}</span>
                    </div>
                </div>
            </div>

            {showActions && (
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        View
                    </button>
                    {actionType === 'unregister' && event.isUserRegistered && (
                        <button
                            onClick={() => handleUnregister(event.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Unregister
                        </button>
                    )}
                    {actionType === 'manage' && (
                        <>
                            <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                                title="Cancel Event"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Events</h2>
                <p className="text-slate-500">Manage your event registrations and created events</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('registrations')}
                        className={`pb-3 px-1 font-semibold transition-colors relative ${activeTab === 'registrations'
                                ? 'text-emerald-600'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        My Registrations
                        {activeTab === 'registrations' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                        )}
                    </button>
                    {userRole === 'Admin' && (
                        <button
                            onClick={() => setActiveTab('created')}
                            className={`pb-3 px-1 font-semibold transition-colors relative ${activeTab === 'created'
                                    ? 'text-emerald-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Created Events
                            {activeTab === 'created' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
            ) : (
                <div className="space-y-3">
                    {activeTab === 'registrations' ? (
                        registrations.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                                <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Registrations Yet</h3>
                                <p className="text-slate-500 mb-4">You haven't registered for any events</p>
                                <button
                                    onClick={() => navigate('/events')}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Browse Events
                                </button>
                            </div>
                        ) : (
                            registrations.map(event => (
                                <EventRow key={event.id} event={event} actionType="unregister" />
                            ))
                        )
                    ) : (
                        createdEvents.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                                <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Events Created</h3>
                                <p className="text-slate-500 mb-4">You haven't created any events yet</p>
                                <button
                                    onClick={() => navigate('/events/create')}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Create Event
                                </button>
                            </div>
                        ) : (
                            createdEvents.map(event => (
                                <EventRow key={event.id} event={event} actionType="manage" />
                            ))
                        )
                    )}
                </div>
            )}
        </div>
    );
}
