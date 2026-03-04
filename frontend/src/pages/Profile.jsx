import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, ShieldCheck, Mail, Hash, Calendar, Settings, Moon, Sun, ClipboardList, Droplets, AlertTriangle, Phone } from 'lucide-react';
import api from '../api/axiosConfig';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [healthProfile, setHealthProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.patientId) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/records/profile/${user.patientId}`);
                setHealthProfile(response.data);
            } catch (err) {
                console.error("Failed to fetch health profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [user]);

    const DetailItem = ({ label, value, icon: Icon, colorClass = "text-gray-500" }) => (
        <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border dark:border-dark-border">
            <div className="p-2 bg-white dark:bg-dark-bg rounded-md shadow-sm border border-gray-100 dark:border-dark-border">
                <Icon className={`h-5 w-5 ${colorClass}`} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</label>
                <p className="mt-1 text-base text-gray-900 dark:text-gray-100 font-medium">{value || 'Not provided'}</p>
            </div>
        </div>
    );

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Personal Info Card */}
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-8">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold uppercase">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role?.toLowerCase()} Account</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem label="Full Name" value={`${user?.firstName} ${user?.lastName}`} icon={User} />
                    <DetailItem label="Email Address" value={user?.email} icon={Mail} />
                    <DetailItem label="Patient ID" value={user?.patientId ? `#${user.patientId}` : 'N/A'} icon={Hash} />
                    <DetailItem label="Blood Group" value={healthProfile?.bloodType} icon={Droplets} colorClass="text-red-500" />
                </div>
            </div>

            {/* Medical Info Card */}
            {user?.role === 'PATIENT' && (
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                        Medical Background
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem label="Known Allergies" value={healthProfile?.knownAllergies} icon={AlertTriangle} colorClass="text-red-600" />
                        <DetailItem label="Emergency Contact" value={user?.emergencyContactName} icon={User} colorClass="text-blue-600" />
                        <DetailItem label="Emergency Phone" value={user?.emergencyContactPhone} icon={Phone} colorClass="text-green-600" />
                        <DetailItem label="Registration Status" value="Active Patient" icon={ClipboardList} colorClass="text-indigo-600" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Security Settings */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                        Account Security
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border dark:border-dark-border">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Multi-Factor Authentication</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.mfaEnabled ? 'Currently active' : 'Not enabled'}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user?.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {user?.mfaEnabled ? 'ENABLED' : 'DISABLED'}
                            </span>
                        </div>
                        <button className="w-full text-center py-2 text-sm font-medium text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-primary transition-colors">
                            {user?.mfaEnabled ? 'Manage MFA Settings' : 'Enable MFA'}
                        </button>
                    </div>
                </div>

                {/* Account Preferences */}
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <Settings className="h-5 w-5 text-blue-500 mr-2" />
                        Preferences
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                            <div className="flex items-center space-x-3">
                                {theme === 'dark' ? (
                                    <Sun className="h-4 w-4 text-yellow-400" />
                                ) : (
                                    <Moon className="h-4 w-4 text-gray-400" />
                                )}
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
