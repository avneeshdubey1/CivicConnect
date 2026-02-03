import { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Shield, Calendar, Edit2, Loader2 } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobileNumber: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = () => {
        // Get user data from localStorage (set during login)
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        const mobileNumber = localStorage.getItem('mobileNumber') || 'Not provided';

        const userData = {
            username,
            email,
            role,
            mobileNumber,
            createdAt: localStorage.getItem('createdAt') || new Date().toISOString()
        };

        setUser(userData);
        setFormData({
            username: username || '',
            email: email || '',
            mobileNumber: mobileNumber || ''
        });
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Update localStorage
        localStorage.setItem('username', formData.username);
        localStorage.setItem('email', formData.email);
        localStorage.setItem('mobileNumber', formData.mobileNumber);

        // Refresh user data
        fetchUserProfile();
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h2>
                <p className="text-slate-500">Manage your account information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <User size={40} className="text-white" />
                        </div>
                        <div className="text-white">
                            <h3 className="text-2xl font-bold">{user?.username}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield size={16} />
                                <span className="text-emerald-100">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-8 space-y-6">
                    {!isEditing ? (
                        <>
                            {/* View Mode */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Mail size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-slate-900 font-semibold">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <Phone size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Mobile Number</p>
                                        <p className="text-slate-900 font-semibold">{user?.mobileNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-50 rounded-lg">
                                        <Shield size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Role</p>
                                        <p className="text-slate-900 font-semibold">{user?.role}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <Calendar size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Member Since</p>
                                        <p className="text-slate-900 font-semibold">{formatDate(user?.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    <Edit2 size={16} />
                                    Edit Profile
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Edit Mode */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Account Status</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">Active</p>
                        </div>
                        <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <Shield size={24} className="text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Role</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{user?.role}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <User size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Verified</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">Yes</p>
                        </div>
                        <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <Mail size={24} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
