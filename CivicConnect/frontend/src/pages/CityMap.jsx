import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Filter, Map as MapIcon, Navigation, Phone, Plus, Save, X } from 'lucide-react';

// --- FIX: LEAFLET DEFAULT ICON BUG ---
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconMarker, iconRetinaUrl: iconRetina, shadowUrl: iconShadow,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper: Move map to user's location
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

// Helper: Calculate Distance (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

// Helper: Handle Map Clicks
function AddLocationMarker({ isAdding, onLocationSelect }) {
    useMapEvents({
        click(e) {
            if (isAdding) {
                onLocationSelect(e.latlng);
            }
        },
    });
    return null;
}

export default function CityMap() {
  const [position, setPosition] = useState({ lat: 19.0760, lng: 72.8777 });
  const [utilities, setUtilities] = useState([]);
  const [filter, setFilter] = useState('ALL');
  
  // Security & Mode States
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'HOSPITAL', contactNumber: '' });

  const fetchData = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/utilities', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUtilities(response.data);
    } catch (error) {
        console.error("Error fetching map data", error);
    }
  };

  useEffect(() => {
    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); }
      );
    }

    // --- SECURITY CHECK ---
    // Read the role we saved during Login
    const userRole = localStorage.getItem('role');
    
    // Check if role is 'Admin' (Matches your Java code: user.setRole("Admin"))
    if (userRole === 'Admin') {
        setIsAdmin(true);
    }
  }, []);

  const handleMapClick = (latlng) => {
    setNewLocation(latlng);
  };

  const saveNewLocation = async () => {
    try {
        const token = localStorage.getItem('token');
        const payload = {
            name: formData.name,
            type: formData.type,
            contactNumber: formData.contactNumber,
            lat: newLocation.lat,
            lng: newLocation.lng,
            address: "Custom Location"
        };

        await axios.post('http://localhost:8080/api/utilities', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setNewLocation(null);
        setIsAdding(false);
        setFormData({ name: '', type: 'HOSPITAL', contactNumber: '' });
        fetchData(); // Refresh map
        alert("New location added!");
    } catch (error) {
        alert("Failed to save. You might not have permission.");
    }
  };

  const handleGetDirections = (destLat, destLng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`, '_blank');
  };

  const filteredData = utilities.filter(place => filter === 'ALL' ? true : place.type === filter);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapIcon className="text-emerald-600" /> Public Utility Map
            </h2>
            <p className="text-sm text-slate-500">
                {isAdding ? "Tap anywhere on the map to add a point!" : "Find nearby services or add new ones."}
            </p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* --- ADMIN ONLY BUTTON --- */}
            {isAdmin && (
                <button 
                    onClick={() => { setIsAdding(!isAdding); setNewLocation(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isAdding ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                    {isAdding ? <><X size={18}/> Cancel Adding</> : <><Plus size={18}/> Add New Place</>}
                </button>
            )}

            {!isAdding && (
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-400" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-medium rounded-lg px-3 py-2">
                        <option value="ALL">All Amenities</option>
                        <option value="HOSPITAL">🏥 Hospitals</option>
                        <option value="POLICE">👮 Police Stations</option>
                        <option value="SCHOOL">🏫 Schools</option>
                    </select>
                </div>
            )}
        </div>
      </div>

      <div className={`flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0 ${isAdding ? 'cursor-crosshair ring-2 ring-emerald-500' : ''}`}>
        <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <AddLocationMarker isAdding={isAdding} onLocationSelect={handleMapClick} />
            <RecenterMap lat={position.lat} lng={position.lng} />

            <Marker position={[position.lat, position.lng]}>
                <Popup><div className="font-bold text-emerald-600 text-center">You are Here</div></Popup>
            </Marker>

            {filteredData.map(place => (
                <Marker key={place.id} position={[place.lat, place.lng]}>
                    <Popup>
                        <div className="min-w-[160px]">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 leading-tight w-2/3">{place.name}</h3>
                                <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    {calculateDistance(position.lat, position.lng, place.lat, place.lng)} km
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{place.address}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 font-medium">
                                <Phone size={12} className="text-emerald-600"/> {place.contactNumber}
                            </div>
                            <button onClick={() => handleGetDirections(place.lat, place.lng)}
                                className="flex items-center gap-1 w-full justify-center bg-emerald-600 text-white px-2 py-2 rounded text-xs font-semibold hover:bg-emerald-700">
                                <Navigation size={12} /> Get Directions
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* POPUP FORM FOR NEW PLACE */}
            {newLocation && (
                <Marker position={newLocation}>
                    <Popup minWidth={250} closeButton={false}>
                        <div className="p-1 space-y-3">
                            <h3 className="font-bold text-slate-800 border-b pb-2">Add New Utility</h3>
                            
                            <input 
                                type="text" placeholder="Name (e.g. City Library)" 
                                className="w-full text-sm border p-2 rounded"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            
                            <select 
                                className="w-full text-sm border p-2 rounded"
                                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="HOSPITAL">Hospital</option>
                                <option value="POLICE">Police Station</option>
                                <option value="SCHOOL">School</option>
                            </select>

                            <input 
                                type="text" placeholder="Phone Number" 
                                className="w-full text-sm border p-2 rounded"
                                value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                            />

                            <button onClick={saveNewLocation} className="w-full bg-emerald-600 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2">
                                <Save size={14} /> Save Location
                            </button>
                        </div>
                    </Popup>
                </Marker>
            )}

        </MapContainer>
      </div>
    </div>
  );
}