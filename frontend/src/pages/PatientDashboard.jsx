import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, Heart, Thermometer, Droplets, Wind, FileText, ClipboardList, Scale, Ruler, Calendar } from 'lucide-react';
import api from '../api/axiosConfig';

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [vitals, setVitals] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [healthProfile, setHealthProfile] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.patientId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch vitals
                try {
                    const vitalsResponse = await api.get(`/vitals/patient/${user.patientId}`);
                    if (vitalsResponse.data && vitalsResponse.data.length > 0) {
                        const latest = vitalsResponse.data[0];
                        setVitals({
                            temperature: latest.temperature,
                            bloodPressure: latest.bloodPressure,
                            heartRate: latest.heartRate,
                            oxygenSaturation: latest.oxygenSaturation,
                            lastUpdated: new Date(latest.timestamp).toLocaleString()
                        });
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
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) return <div className="p-8">Loading your health data...</div>;

    const VitalCard = ({ title, value, unit, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${colorClass}`}>
                <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    <span className="ml-1 text-sm font-medium text-gray-500">{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Patient'}</h1>
                    <p className="text-sm text-gray-500 mt-1">Here is your latest health overview. Last updated: {vitals?.lastUpdated || 'Never'}</p>
                </div>

                {/* Critical Info Highlight */}
                <div className="mt-4 md:mt-0 flex gap-4">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Known Allergies</p>
                        <p className="text-sm font-medium text-red-800">{healthProfile?.knownAllergies || 'None recorded'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <VitalCard
                    title="Heart Rate"
                    value={vitals?.heartRate || '--'}
                    unit="bpm"
                    icon={Heart}
                    colorClass="bg-red-500"
                />
                <VitalCard
                    title="Blood Pressure"
                    value={vitals?.bloodPressure || '--'}
                    unit="mmHg"
                    icon={Activity}
                    colorClass="bg-blue-500"
                />
                <VitalCard
                    title="Temperature"
                    value={vitals?.temperature || '--'}
                    unit="°C"
                    icon={Thermometer}
                    colorClass="bg-orange-500"
                />
                <VitalCard
                    title="Oxygen Level"
                    value={vitals?.oxygenSaturation || '--'}
                    unit="%"
                    icon={Wind}
                    colorClass="bg-teal-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Appointments & Assessments */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Appointments Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Calendar className="h-5 w-5 text-primary mr-2" />
                                Upcoming Appointments
                            </h3>
                            <a href="/appointments" className="text-sm font-medium text-primary hover:underline">View All</a>
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
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        apt.status === 'VERIFIED' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {apt.status}
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
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assess.clinicalNotes}</p>
                                        <p className="text-xs text-indigo-600 mt-2 font-medium">Recorded by Dr. {assess.provider?.user?.profile?.lastName || 'Provider'}</p>
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

                {/* Right Column: Physical Stats, Medications, Contact */}
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
                                    <p className="text-sm font-bold text-gray-900">{healthProfile?.height || '--'} cm</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg flex items-center space-x-3">
                                <Scale className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Weight</p>
                                    <p className="text-sm font-bold text-gray-900">{healthProfile?.weight || '--'} kg</p>
                                </div>
                            </div>
                        </div>
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

                    {/* Emergency Contact & Blood Type */}
                    <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Droplets className="h-5 w-5 text-orange-500 mr-2" />
                            Emergency & Blood
                        </h3>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-700 font-bold text-xl">
                                {healthProfile?.bloodType || '--'}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Blood Group</p>
                                <p className="text-sm font-medium text-gray-900">Patient Type</p>
                            </div>
                        </div>

                        {user?.emergencyContactName ? (
                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                <p className="text-xs text-orange-600 uppercase font-bold mb-1">Contact</p>
                                <p className="text-sm font-bold text-orange-900">{user.emergencyContactName}</p>
                                <p className="text-base font-bold text-orange-700 mt-1">{user.emergencyContactPhone}</p>
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-xs text-gray-500">No emergency contact.</p>
                                <a href="/profile" className="text-xs text-primary font-medium mt-1 inline-block">Update Profile</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
