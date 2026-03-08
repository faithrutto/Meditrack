import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, Heart, Thermometer, Droplets, Wind, FileText, ClipboardList, Scale, Ruler, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [vitals, setVitals] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [healthProfile, setHealthProfile] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [vitalsHistory, setVitalsHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        if (!user?.patientId) {
            setLoading(false);
            return;
        }

        try {
            // Fetch vitals
            try {
                console.log("Fetching vitals for patientId:", user.patientId);
                const vitalsResponse = await api.get(`/vitals/patient/${user.patientId}`);
                console.log("Vitals API Response:", vitalsResponse.data);

                if (vitalsResponse.data && vitalsResponse.data.length > 0) {
                    const sortedHistory = [...vitalsResponse.data].sort((a, b) => {
                        const dateA = Array.isArray(a.timestamp)
                            ? new Date(a.timestamp[0], a.timestamp[1] - 1, a.timestamp[2], a.timestamp[3] || 0, a.timestamp[4] || 0)
                            : new Date(a.timestamp);
                        const dateB = Array.isArray(b.timestamp)
                            ? new Date(b.timestamp[0], b.timestamp[1] - 1, b.timestamp[2], b.timestamp[3] || 0, b.timestamp[4] || 0)
                            : new Date(b.timestamp);
                        return dateB - dateA;
                    });

                    setVitalsHistory(sortedHistory);

                    // Aggregate latest NON-NULL values
                    let aggregated = {
                        heartRate: null,
                        bloodPressure: null,
                        temperature: null,
                        oxygenSaturation: null,
                        lastUpdated: null
                    };

                    for (const record of sortedHistory) {
                        const hr = record.heartRate ?? record.hr ?? record.heart_rate ?? record.heartrate;
                        const bp = record.bloodPressure ?? record.bp ?? record.blood_pressure;
                        const temp = record.temperature ?? record.temp ?? record.temperature_val ?? record.temp_val;
                        const o2 = record.oxygenSaturation ?? record.o2 ?? record.oxygen_saturation;

                        console.log("Aggregating record:", record.timestamp, { hr, bp, temp, o2 });

                        if (aggregated.heartRate === null && hr !== null && hr !== undefined) aggregated.heartRate = hr;
                        if (aggregated.bloodPressure === null && bp !== null && bp !== undefined && bp !== '') aggregated.bloodPressure = bp;
                        if (aggregated.temperature === null && temp !== null && temp !== undefined) aggregated.temperature = temp;
                        if (aggregated.oxygenSaturation === null && o2 !== null && o2 !== undefined) aggregated.oxygenSaturation = o2;

                        // Use the timestamp of the absolute latest record as the "Last Updated"
                        if (aggregated.lastUpdated === null) {
                            let formattedDate = 'Recent';
                            if (record.timestamp) {
                                try {
                                    const date = Array.isArray(record.timestamp)
                                        ? new Date(record.timestamp[0], record.timestamp[1] - 1, record.timestamp[2], record.timestamp[3] || 0, record.timestamp[4] || 0)
                                        : new Date(record.timestamp);
                                    if (!isNaN(date.getTime())) formattedDate = date.toLocaleString();
                                } catch (e) { }
                            }
                            aggregated.lastUpdated = formattedDate;
                        }

                        // Break if we have everything
                        if (aggregated.heartRate && aggregated.bloodPressure && aggregated.temperature && aggregated.oxygenSaturation) break;
                    }

                    setVitals(aggregated);
                } else {
                    console.log("No vitals found for this patient.");
                    setVitals(null);
                    setVitalsHistory([]);
                }
            } catch (vErr) {
                console.error("Vitals fetch failed:", vErr);
            }

            // Fetch appointments
            try {
                const aptResponse = await api.get(`/appointments/patient/${user.patientId}`);
                setAppointments(aptResponse.data || []);
            } catch (aErr) {
                console.error("Appointments fetch failed:", aErr);
            }

            // Fetch health profile
            try {
                const profileResponse = await api.get(`/records/profile/${user.patientId}`);
                console.log("Health Profile API Response:", profileResponse.data);
                setHealthProfile(profileResponse.data);
            } catch (pErr) {
                console.error("Profile fetch failed:", pErr);
            }

            // Fetch assessments
            try {
                const assessResponse = await api.get(`/records/assessment/patient/${user.patientId}`);
                setAssessments(assessResponse.data || []);
            } catch (asErr) {
                console.error("Assessments fetch failed:", asErr);
            }

            // Fetch alerts
            try {
                const alertsRes = await api.get(`/alerts/patient/${user.patientId}`);
                setAlerts(alertsRes.data || []);
            } catch (alErr) {
                console.error("Alerts fetch failed:", alErr);
            }

            // Fetch communications (userId needed)
            if (user?.id) {
                try {
                    const commsRes = await api.get(`/communications/inbox/${user.id}`);
                    setMessages(commsRes.data || []);
                } catch (cErr) {
                    console.error("Comms fetch failed:", cErr);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    if (loading) return <div className="p-8">Loading your health data...</div>;

    const VitalCard = ({ title, value, unit, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${colorClass}`}>
                <Icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    <span className="ml-1 text-sm font-medium text-gray-500">{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Patient'}</h1>
                    <p className="text-sm text-gray-500 mt-1">Here is your latest health overview. Last updated: {vitals?.lastUpdated || 'Never'}</p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        title="Synchronize data with server"
                    >
                        <Activity className={`h-4 w-4 text-primary ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-bold text-gray-700">Sync Now</span>
                    </button>
                    <Link
                        to="/appointments"
                        className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Appointment
                    </Link>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Known Allergies</p>
                        <p className="text-sm font-medium text-red-800">{healthProfile?.knownAllergies || 'None recorded'}</p>
                    </div>
                </div>
            </div>

            {/* Alerts Section - Only show if there are unread alerts */}
            {alerts.filter(a => a.alertStatus === 'UNREAD').length > 0 && (
                <div className="space-y-3">
                    {alerts.filter(a => a?.alertStatus === 'UNREAD').map(alert => (
                        <div key={alert.alertId} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm animate-pulse">
                            <div className="flex items-center">
                                <Activity className="h-5 w-5 text-red-600 mr-3" />
                                <div>
                                    <p className="text-sm font-bold text-red-900 uppercase tracking-tight">
                                        {(alert.alertType || 'HEALTH_ALERT').replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-sm text-red-700">{alert.message || 'Abnormal reading detected'}</p>
                                </div>
                            </div>
                            <span className="text-xs text-red-500 font-medium">
                                {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Recent'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <VitalCard
                    title="Heart Rate"
                    value={vitals?.heartRate ?? '--'}
                    unit="bpm"
                    icon={Heart}
                    colorClass="bg-red-500"
                />
                <VitalCard
                    title="Blood Pressure"
                    value={vitals?.bloodPressure ?? '--'}
                    unit="mmHg"
                    icon={Activity}
                    colorClass="bg-blue-500"
                />
                <VitalCard
                    title="Temperature"
                    value={vitals?.temperature ?? '--'}
                    unit="°C"
                    icon={Thermometer}
                    colorClass="bg-orange-500"
                />
                <VitalCard
                    title="Oxygen Level"
                    value={vitals?.oxygenSaturation ?? '--'}
                    unit="%"
                    icon={Wind}
                    colorClass="bg-teal-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Appointments, Assessments, History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Vitals History - Showing "Appending" aspect */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Activity className="h-5 w-5 text-red-500 mr-2" />
                            Recent Vital History
                        </h3>
                        {vitalsHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 font-bold uppercase tracking-wider">
                                            <th className="pb-3 text-xs">Date</th>
                                            <th className="pb-3 text-xs">HR</th>
                                            <th className="pb-3 text-xs">BP</th>
                                            <th className="pb-3 text-xs">Temp</th>
                                            <th className="pb-3 text-xs">O2%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {vitalsHistory.slice(0, 5).map((v) => (
                                            <tr key={v.vitalId} className="hover:bg-gray-50">
                                                <td className="py-3 text-gray-500 text-xs">
                                                    {Array.isArray(v.timestamp)
                                                        ? `${v.timestamp[0]}-${v.timestamp[1]}-${v.timestamp[2]}`
                                                        : new Date(v.timestamp).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 font-bold text-red-600">{v.heartRate ?? v.hr ?? v.heart_rate ?? v.heartrate ?? '--'}</td>
                                                <td className="py-3 font-bold text-blue-600">{v.bloodPressure ?? v.bp ?? v.blood_pressure ?? '--'}</td>
                                                <td className="py-3 font-bold text-orange-600">{(v.temperature ?? v.temp ?? v.temp_val) ? `${v.temperature ?? v.temp ?? v.temp_val}°` : '--'}</td>
                                                <td className="py-3 font-bold text-teal-600">{(v.oxygenSaturation ?? v.o2 ?? v.oxygen_saturation) ? `${v.oxygenSaturation ?? v.o2 ?? v.oxygen_saturation}%` : '--'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                No vital history available.
                            </div>
                        )}
                    </div>

                    {/* Appointments Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Calendar className="h-5 w-5 text-primary mr-2" />
                                Upcoming Appointments
                            </h3>
                        </div>
                        {appointments.length > 0 ? (
                            <div className="space-y-4">
                                {appointments.slice(0, 3).map((apt) => (
                                    <div key={apt.appointmentId} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{new Date(apt.appointmentDate).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">{apt.appointmentPurpose}</p>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {apt.status || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                No upcoming appointments scheduled.
                            </div>
                        )}
                    </div>

                    {/* Clinical Feed Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <ClipboardList className="h-5 w-5 text-indigo-500 mr-2" />
                            Clinical Feed
                        </h3>
                        {assessments.length > 0 ? (
                            <div className="space-y-6">
                                {assessments.slice(0, 3).map((assess) => (
                                    <div key={assess.assessmentId} className="border-l-4 border-indigo-100 pl-4 py-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900">{assess.diagnosis}</h4>
                                            <span className="text-xs text-gray-500">{new Date(assess.assessmentDate).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{assess.clinicalNotes}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                No clinical assessments recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Physical Stats, Communications, Background */}
                <div className="space-y-8">
                    {/* Physical Stats Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Activity className="h-5 w-5 text-green-500 mr-2" />
                            Physical Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg flex items-center space-x-3">
                                <Ruler className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Height</p>
                                    <p className="text-sm font-bold text-gray-900">{healthProfile?.height ?? '--'} cm</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg flex items-center space-x-3">
                                <Scale className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Weight</p>
                                    <p className="text-sm font-bold text-gray-900">{healthProfile?.weight ?? '--'} kg</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Communications Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Wind className="h-5 w-5 text-primary mr-2" />
                            Recent Messages
                        </h3>
                        {messages.length > 0 ? (
                            <div className="space-y-4">
                                {messages.slice(0, 3).map((msg) => (
                                    <div key={msg.messageId} className={`p-3 rounded-lg border ${msg.read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-bold text-gray-900">Dr. {msg.sender?.profile?.lastName || 'Provider'}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '--'}</p>
                                        </div>
                                        <p className="text-xs text-gray-700 line-clamp-2">{msg.messageContent || 'No message content'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg text-xs">
                                No recent messages.
                            </div>
                        )}
                    </div>

                    {/* Medications & History */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FileText className="h-5 w-5 text-blue-500 mr-2" />
                            Health Background
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Medications</p>
                                <p className="text-sm text-gray-700 bg-blue-50/50 p-2 rounded border border-blue-100">
                                    {healthProfile?.currentMedications || 'None recorded'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medical History</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                                    {healthProfile?.pastMedicalHistory || 'No significant history recorded'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Emergency & Blood */}
                    <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Droplets className="h-5 w-5 text-orange-500 mr-2" />
                            Emergency & Blood
                        </h3>
                        <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                                {healthProfile?.bloodType || '--'}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Emergency Contact</p>
                                <p className="text-sm font-bold text-gray-900">{user?.emergencyContactPhone || 'No contact'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
