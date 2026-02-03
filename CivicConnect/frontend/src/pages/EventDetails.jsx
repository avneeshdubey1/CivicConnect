import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Tag, ArrowLeft, Loader2, User, CheckCircle2, X } from 'lucide-react';

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

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- New States for Volunteer List ---
    const [showVolunteersModal, setShowVolunteersModal] = useState(false);
    const [volunteers, setVolunteers] = useState([]);
    const [loadingVolunteers, setLoadingVolunteers] = useState(false);

    // Check if user is Admin
    const isAdmin = localStorage.getItem('role') === 'Admin';

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvent(response.data);
        } catch (error) {
            console.error('Error fetching event details:', error);
            alert('Event not found');
            navigate('/events');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVolunteers = async () => {
        setLoadingVolunteers(true);
        setShowVolunteersModal(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/events/${id}/volunteers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVolunteers(response.data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch volunteers.');
            setShowVolunteersModal(false);
        } finally {
            setLoadingVolunteers(false);
        }
    };

    const handleRegister = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:8080/api/events/${id}/register`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Successfully registered as volunteer!');
            fetchEventDetails(); // Refresh to update registration status
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to register for event');
        }
    };

    const handleUnregister = async () => {
        if (!confirm('Are you sure you want to unregister from this event?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/events/${id}/register`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Successfully unregistered from event');
            fetchEventDetails();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unregister from event');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getCapacityPercentage = () => {
        if (!event?.maxVolunteers) return 0;
        return (event.registrationCount / event.maxVolunteers) * 100;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="space-y-6 relative">
            
            {/* --- VOLUNTEER LIST MODAL --- */}
            {showVolunteersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-bold text-slate-900">Registered Volunteers</h3>
                            <button onClick={() => setShowVolunteersModal(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            {loadingVolunteers ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-600" /></div>
                            ) : volunteers.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No volunteers registered yet.</div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {volunteers.map((vol, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{vol.username}</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    <div>{vol.email}</div>
                                                    <div className="text-xs text-slate-400">{vol.mobileNumber}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
                            <button onClick={() => setShowVolunteersModal(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-sm transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Back Button */}
            <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Events</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Image */}
                    {event.imageUrl && (
                        <div className="h-96 rounded-xl overflow-hidden bg-slate-100">
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Event Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${categoryColors[event.category]}`}>
                                <Tag size={14} className="inline mr-1" />
                                {categoryLabels[event.category]}
                            </span>
                            {event.isUserRegistered && (
                                <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 size={14} className="inline mr-1" />
                                    You're Registered
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{event.title}</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Calendar size={20} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Date & Time</p>
                                    <p className="font-semibold">{formatDate(event.eventDate)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <MapPin size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Venue</p>
                                    <p className="font-semibold">{event.venue}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Users size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Volunteers</p>
                                    <p className="font-semibold">
                                        {event.registrationCount} {event.maxVolunteers ? `/ ${event.maxVolunteers}` : ''} registered
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <User size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Organized by</p>
                                    <p className="font-semibold">{event.creatorName}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-3">About This Event</h2>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{event.description}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Registration Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Registration</h3>

                        {/* Capacity Progress */}
                        {event.maxVolunteers && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600">Capacity</span>
                                    <span className="font-semibold text-slate-900">
                                        {event.registrationCount} / {event.maxVolunteers}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getCapacityPercentage() >= 90 ? 'bg-red-500' :
                                                getCapacityPercentage() >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${Math.min(getCapacityPercentage(), 100)}%` }}
                                    />
                                </div>
                                {event.availableSlots !== null && (
                                    <p className="text-sm text-slate-500 mt-2">
                                        {event.availableSlots > 0
                                            ? `${event.availableSlots} slots remaining`
                                            : 'Event is full'}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {event.isUserRegistered ? (
                                <button
                                    onClick={handleUnregister}
                                    className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold transition-colors"
                                >
                                    Unregister
                                </button>
                            ) : event.availableSlots === 0 ? (
                                <button
                                    disabled
                                    className="w-full px-4 py-3 bg-slate-100 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
                                >
                                    Event Full
                                </button>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
                                >
                                    Register as Volunteer
                                </button>
                            )}

                            {/* 👇 NEW: View Volunteers Button (Only for Admins) */}
                            {isAdmin && (
                                <button
                                    onClick={fetchVolunteers}
                                    className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Users size={18} />
                                    View Volunteer List
                                </button>
                            )}
                        </div>

                        <p className="text-xs text-slate-500 text-center mt-3">
                            {event.isUserRegistered
                                ? 'You will receive updates about this event'
                                : 'Join us in making a difference!'}
                        </p>
                    </div>

                    {/* Event Status */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Status</span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                                    event.status === 'ONGOING' ? 'bg-green-100 text-green-700' :
                                        event.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                                            'bg-red-100 text-red-700'
                                }`}>
                                {event.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}