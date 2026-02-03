import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Tag, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';

const categoryOptions = [
    { value: 'CLEAN_CITY_DRIVE', label: 'Clean City Drive' },
    { value: 'AWARENESS_WORKSHOP', label: 'Awareness Workshop' },
    { value: 'SOCIAL_CAMPAIGN', label: 'Social Campaign' },
    { value: 'HEALTH_CAMP', label: 'Health Camp' },
    { value: 'TREE_PLANTATION', label: 'Tree Plantation' },
    { value: 'BLOOD_DONATION', label: 'Blood Donation' },
    { value: 'COMMUNITY_MEETING', label: 'Community Meeting' }
];

export default function CreateEvent() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        eventDate: '',
        category: 'CLEAN_CITY_DRIVE',
        maxVolunteers: '',
        imageUrl: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // Prepare data
            const eventData = {
                ...formData,
                eventDate: new Date(formData.eventDate).toISOString(),
                maxVolunteers: formData.maxVolunteers ? parseInt(formData.maxVolunteers) : null
            };

            const response = await axios.post(
                'http://localhost:8080/api/events',
                eventData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Event created successfully!');
            navigate(`/events/${response.data.eventId}`);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Events</span>
            </button>

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Event</h2>
                <p className="text-slate-500">Organize a community event and invite volunteers</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Event Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Beach Cleanup Drive"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Tag size={16} className="inline mr-1" />
                        Event Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
                    >
                        {categoryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Describe the event, its purpose, and what volunteers will do..."
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Venue */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <MapPin size={16} className="inline mr-1" />
                        Venue *
                    </label>
                    <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Juhu Beach, Mumbai"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Date & Time */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Max Volunteers */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <Users size={16} className="inline mr-1" />
                        Maximum Volunteers
                    </label>
                    <input
                        type="number"
                        name="maxVolunteers"
                        value={formData.maxVolunteers}
                        onChange={handleChange}
                        min="1"
                        placeholder="Leave empty for unlimited"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty if there's no capacity limit</p>
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <ImageIcon size={16} className="inline mr-1" />
                        Event Image URL
                    </label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/event-image.jpg"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">Optional: Add a banner image for your event</p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating...
                            </>
                        ) : (
                            'Create Event'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
