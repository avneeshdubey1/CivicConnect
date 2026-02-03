import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function EventCard({ event, onRegister }) {
  const navigate = useNavigate();

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

  const getCapacityPercentage = () => {
    if (!event.maxVolunteers) return 0;
    return (event.registrationCount / event.maxVolunteers) * 100;
  };

  const getCapacityColor = () => {
    const percentage = getCapacityPercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="h-48 overflow-hidden bg-slate-100">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[event.category]}`}>
            <Tag size={12} className="inline mr-1" />
            {categoryLabels[event.category]}
          </span>
          {event.isUserRegistered && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ Registered
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={16} className="text-slate-400" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={16} className="text-slate-400" />
            <span>
              {event.registrationCount} {event.maxVolunteers ? `/ ${event.maxVolunteers}` : ''} volunteers
            </span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        {event.maxVolunteers && (
          <div className="mb-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getCapacityColor()} transition-all duration-300`}
                style={{ width: `${Math.min(getCapacityPercentage(), 100)}%` }}
              />
            </div>
            {event.availableSlots !== null && (
              <p className="text-xs text-slate-500 mt-1">
                {event.availableSlots > 0 
                  ? `${event.availableSlots} slots remaining`
                  : 'Event is full'}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors"
          >
            View Details
          </button>
          {!event.isUserRegistered && event.availableSlots !== 0 && (
            <button
              onClick={() => onRegister(event.id)}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
