import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Calendar, Plus, Search, Filter, Loader2 } from 'lucide-react';
import EventCard from '../components/EventCard';

const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'CLEAN_CITY_DRIVE', label: 'Clean City Drive' },
    { value: 'AWARENESS_WORKSHOP', label: 'Awareness Workshop' },
    { value: 'SOCIAL_CAMPAIGN', label: 'Social Campaign' },
    { value: 'HEALTH_CAMP', label: 'Health Camp' },
    { value: 'TREE_PLANTATION', label: 'Tree Plantation' },
    { value: 'BLOOD_DONATION', label: 'Blood Donation' },
    { value: 'COMMUNITY_MEETING', label: 'Community Meeting' }
];

export default function Events() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        fetchEvents();
        fetchUserRole();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [searchTerm, selectedCategory, events]);

    const fetchUserRole = () => {
        const role = localStorage.getItem('role');
        setUserRole(role || 'Citizen');
    };

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(response.data);
            setFilteredEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterEvents = () => {
        let filtered = events;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.venue.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(event => event.category === selectedCategory);
        }

        setFilteredEvents(filtered);
    };

    const handleRegister = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:8080/api/events/${eventId}/register`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh events to update registration status
            fetchEvents();
            alert('Successfully registered as volunteer!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to register for event');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Events & Volunteering</h2>
                    <p className="text-slate-500">Discover and participate in community events</p>
                </div>
                {userRole === 'Admin' && (
                    <button
                        onClick={() => navigate('/events/create')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Event
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                        >
                            {categoryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-emerald-600" size={40} />
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No events found</h3>
                    <p className="text-slate-500">
                        {searchTerm || selectedCategory
                            ? 'Try adjusting your filters'
                            : 'Check back later for upcoming events'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onRegister={handleRegister}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
