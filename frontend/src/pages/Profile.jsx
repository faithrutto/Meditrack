import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, ShieldCheck, Mail, Hash, Calendar, Settings, Moon, Sun, ClipboardList, Droplets, AlertTriangle, Phone, Activity } from 'lucide-react';
import api from '../api/axiosConfig';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [healthProfile, setHealthProfile] = useState(null);
    const [vitals, setVitals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingVitals, setUpdatingVitals] = useState(false);
    const [vitalsEditData, setVitalsEditData] = useState({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        oxygenSaturation: ''
    });
    const [profileEditData, setProfileEditData] = useState({
        height: '',
        weight: '',
        bloodType: '',
        knownAllergies: '',
        currentMedications: '',
        pastMedicalHistory: ''
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);

    const fetchData = async () => {
        if (!user?.patientId) {
            setLoading(false);
            return;
        }
        try {
            const [profileRes, vitalsRes] = await Promise.all([
                api.get(`/records/profile/${user.patientId}`),
                api.get(`/vitals/patient/${user.patientId}`)
            ]);

            if (profileRes.data) {
                const profile = profileRes.data;
                setHealthProfile(profile);
                setProfileEditData({
                    height: profile.height || '',
                    weight: profile.weight || '',
                    bloodType: profile.bloodType || '',
                    knownAllergies: profile.knownAllergies || '',
                    currentMedications: profile.currentMedications || '',
                    pastMedicalHistory: profile.pastMedicalHistory || ''
                });
            }

            if (vitalsRes.data && vitalsRes.data.length > 0) {
                // Aggregate latest NON-NULL values from history
                const sortedHistory = [...vitalsRes.data].sort((a, b) => {
                    const dateA = Array.isArray(a.timestamp)
                        ? new Date(a.timestamp[0], a.timestamp[1] - 1, a.timestamp[2], a.timestamp[3] || 0, a.timestamp[4] || 0)
                        : new Date(a.timestamp);
                    const dateB = Array.isArray(b.timestamp)
                        ? new Date(b.timestamp[0], b.timestamp[1] - 1, b.timestamp[2], b.timestamp[3] || 0, b.timestamp[4] || 0)
                        : new Date(b.timestamp);
                    return dateB - dateA;
                });

                let aggregated = {
                    temperature: '',
                    bloodPressure: '',
                    heartRate: '',
                    oxygenSaturation: ''
                };

                for (const record of sortedHistory) {
                    const hr = record.heartRate ?? record.hr ?? record.heart_rate ?? record.heartrate;
                    const bp = record.bloodPressure ?? record.bp ?? record.blood_pressure;
                    const temp = record.temperature ?? record.temp ?? record.temperature_val;
                    const o2 = record.oxygenSaturation ?? record.o2 ?? record.oxygen_saturation;

                    if (aggregated.heartRate === '' && hr !== null && hr !== undefined) aggregated.heartRate = hr;
                    if (aggregated.bloodPressure === '' && bp !== null && bp !== undefined && bp !== '') aggregated.bloodPressure = bp;
                    if (aggregated.temperature === '' && temp !== null && temp !== undefined) aggregated.temperature = temp;
                    if (aggregated.oxygenSaturation === '' && o2 !== null && o2 !== undefined) aggregated.oxygenSaturation = o2;

                    if (aggregated.heartRate !== '' && aggregated.bloodPressure !== '' && aggregated.temperature !== '' && aggregated.oxygenSaturation !== '') break;
                }

                setVitals(aggregated);
                setVitalsEditData(aggregated);
            }
        } catch (err) {
            console.error("Failed to fetch profile/vitals:", err);
            if (err.response) {
                console.error("Full Error Response Data:", err.response.data);
                console.error("Status:", err.response.status);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleUpdateVitals = async (e) => {
        e.preventDefault();

        // Check if at least one field is filled
        if (!vitalsEditData.temperature && !vitalsEditData.bloodPressure && !vitalsEditData.heartRate && !vitalsEditData.oxygenSaturation) {
            alert("Please fill at least one vital sign field.");
            return;
        }

        setUpdatingVitals(true);
        try {
            const params = new URLSearchParams();
            if (vitalsEditData.temperature !== '') params.append('temp', vitalsEditData.temperature);
            if (vitalsEditData.bloodPressure !== '') params.append('bp', vitalsEditData.bloodPressure);
            if (vitalsEditData.heartRate !== '') params.append('hr', vitalsEditData.heartRate);
            if (vitalsEditData.oxygenSaturation !== '') params.append('o2', vitalsEditData.oxygenSaturation);
            params.append('patientId', user.patientId);

            // Always POST a new record to keep history
            await api.post(`/vitals/record?${params.toString()}`);
            alert("Vital signs recorded and appended to your history!");

            // Clear vitals form after successful save
            setVitalsEditData({
                temperature: '',
                bloodPressure: '',
                heartRate: '',
                oxygenSaturation: ''
            });

            fetchData();
        } catch (err) {
            console.error("Failed to save vitals:", err);
            alert("Failed to save vitals. Please check your inputs.");
        } finally {
            setUpdatingVitals(false);
        }
    };

    const handleUpdateHealthProfile = async (e) => {
        if (e) e.preventDefault();
        setUpdatingProfile(true);
        try {
            // Transform data: convert empty strings to null for numeric fields
            const payload = {
                ...profileEditData,
                height: profileEditData.height === '' ? null : parseFloat(profileEditData.height),
                weight: profileEditData.weight === '' ? null : parseFloat(profileEditData.weight)
            };

            console.log("Updating health profile with payload:", payload);
            await api.put(`/records/profile/${user.patientId}`, payload);
            fetchData();
            return true;
        } catch (err) {
            console.error("Failed to update health profile. Status:", err.response?.status);
            console.error("Error data:", err.response?.data);
            return false;
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setUpdatingVitals(true);

        try {
            // 1. Save Vitals if any filled
            const hasVitals = vitalsEditData.temperature !== '' || vitalsEditData.bloodPressure !== '' ||
                vitalsEditData.heartRate !== '' || vitalsEditData.oxygenSaturation !== '';

            let vitalsSuccess = true;
            if (hasVitals) {
                const params = new URLSearchParams();
                if (vitalsEditData.temperature !== '') params.append('temp', vitalsEditData.temperature);
                if (vitalsEditData.bloodPressure !== '') params.append('bp', vitalsEditData.bloodPressure);
                if (vitalsEditData.heartRate !== '') params.append('hr', vitalsEditData.heartRate);
                if (vitalsEditData.oxygenSaturation !== '') params.append('o2', vitalsEditData.oxygenSaturation);
                params.append('patientId', user.patientId);
                await api.post(`/vitals/record?${params.toString()}`);
            }

            // 2. Save Health Profile
            const profileSuccess = await handleUpdateHealthProfile();

            if (profileSuccess) {
                alert("Health records updated successfully! Redirecting to dashboard...");
                navigate('/patient');
            } else {
                alert("The server rejected the health profile update. Please open the browser console (F12) to see the exact error.");
            }
        } catch (err) {
            const status = err.response?.status || "Unknown";
            const message = err.response?.data?.message || err.message;
            const details = err.response?.data?.details || "";
            alert(`Critical Error (${status}): ${message} ${details}`);
        } finally {
            setUpdatingProfile(false);
            setUpdatingVitals(false);
        }
    };

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
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border dark:border-dark-border">
                        <div className="p-2 bg-white dark:bg-dark-bg rounded-md shadow-sm border border-gray-100 dark:border-dark-border">
                            <Droplets className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Blood Group</label>
                            <input
                                type="text"
                                value={profileEditData.bloodType}
                                onChange={(e) => setProfileEditData({ ...profileEditData, bloodType: e.target.value })}
                                className="mt-1 block w-full border-none bg-transparent p-0 text-base text-gray-900 dark:text-gray-100 font-medium focus:ring-0"
                                placeholder="Not provided"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Info Card */}
            {user?.role === 'PATIENT' && (
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                            Medical Background & Stats
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border dark:border-dark-border">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Height (cm)</label>
                                <input
                                    type="number"
                                    value={profileEditData.height}
                                    onChange={(e) => setProfileEditData({ ...profileEditData, height: e.target.value })}
                                    className="w-full bg-transparent border-none p-0 text-base font-medium focus:ring-0"
                                    placeholder="e.g. 175"
                                />
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border dark:border-dark-border">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={profileEditData.weight}
                                    onChange={(e) => setProfileEditData({ ...profileEditData, weight: e.target.value })}
                                    className="w-full bg-transparent border-none p-0 text-base font-medium focus:ring-0"
                                    placeholder="e.g. 70"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border dark:border-dark-border">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Known Allergies</label>
                                <textarea
                                    value={profileEditData.knownAllergies}
                                    onChange={(e) => setProfileEditData({ ...profileEditData, knownAllergies: e.target.value })}
                                    className="w-full bg-transparent border-none p-0 text-base font-medium focus:ring-0 resize-none"
                                    placeholder="None disclosed"
                                    rows="2"
                                />
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border dark:border-dark-border">
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current Medications</label>
                                <textarea
                                    value={profileEditData.currentMedications}
                                    onChange={(e) => setProfileEditData({ ...profileEditData, currentMedications: e.target.value })}
                                    className="w-full bg-transparent border-none p-0 text-base font-medium focus:ring-0 resize-none"
                                    placeholder="None"
                                    rows="2"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Settings & Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vital Signs Card */}
                {user?.role === 'PATIENT' && (
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6 row-span-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                            <ClipboardList className="h-5 w-5 text-primary mr-2" />
                            Current Vital Signs
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heart Rate (bpm)</label>
                                <input
                                    type="number"
                                    value={vitalsEditData.heartRate}
                                    onChange={(e) => setVitalsEditData({ ...vitalsEditData, heartRate: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-3 bg-gray-50 dark:bg-dark-bg dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Pressure (mmHg)</label>
                                <input
                                    type="text"
                                    value={vitalsEditData.bloodPressure}
                                    onChange={(e) => setVitalsEditData({ ...vitalsEditData, bloodPressure: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-3 bg-gray-50 dark:bg-dark-bg dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={vitalsEditData.temperature}
                                    onChange={(e) => setVitalsEditData({ ...vitalsEditData, temperature: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-3 bg-gray-50 dark:bg-dark-bg dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Oxygen Saturation (%)</label>
                                <input
                                    type="number"
                                    value={vitalsEditData.oxygenSaturation}
                                    onChange={(e) => setVitalsEditData({ ...vitalsEditData, oxygenSaturation: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-3 bg-gray-50 dark:bg-dark-bg dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Security & Submit */}
                <div className="space-y-8">
                    {user?.role === 'PATIENT' && (
                        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6 border-t-4 border-t-primary">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <Activity className="h-5 w-5 text-primary mr-2" />
                                Action Center
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">Confirm and save all your health entries. You will be redirected to your dashboard.</p>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={updatingProfile || updatingVitals}
                                className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-primary hover:bg-blue-700 shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {updatingProfile || updatingVitals ? 'Processing...' : 'Finalize & See Dashboard'}
                            </button>
                        </div>
                    )}
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
