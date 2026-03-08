import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar as CalendarIcon, FileText } from 'lucide-react';
import api from '../api/axiosConfig';

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientVitals, setPatientVitals] = useState(null);
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        oxygenSaturation: ''
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.providerId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch appointments for this doctor
                const response = await api.get(`/appointments/provider/${user.providerId}`);
                if (response.data) {
                    setAppointments(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch doctor appointments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const updateStatus = async (appointmentId, status) => {
        try {
            await api.put(`/appointments/${appointmentId}/status?status=${status}`);
            setAppointments(prev =>
                prev.map(a => a.appointmentId === appointmentId ? { ...a, status } : a)
            );
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleViewVitals = async (patientId) => {
        try {
            const vitalsResponse = await api.get(`/vitals/patient/${patientId}`);
            if (vitalsResponse.data && vitalsResponse.data.length > 0) {
                const latest = vitalsResponse.data[0];
                const normalizedVitals = {
                    ...latest,
                    vitalId: latest.vitalId ?? latest.vital_id,
                    heartRate: latest.heartRate ?? latest.hr ?? latest.heart_rate ?? latest.heartrate,
                    temperature: latest.temperature ?? latest.temp,
                    bloodPressure: latest.bloodPressure ?? latest.bp,
                    oxygenSaturation: latest.oxygenSaturation ?? latest.o2
                };
                setPatientVitals(normalizedVitals);
                setEditData({
                    temperature: normalizedVitals.temperature ?? '',
                    bloodPressure: normalizedVitals.bloodPressure ?? '',
                    heartRate: normalizedVitals.heartRate ?? '',
                    oxygenSaturation: normalizedVitals.oxygenSaturation ?? ''
                });
                setSelectedPatient(patientId);
                setIsVitalsModalOpen(true);
            } else {
                alert("No vitals recorded for this patient yet.");
            }
        } catch (err) {
            console.error("Failed to fetch vitals:", err);
        }
    };

    const handleUpdateVitals = async (e) => {
        e.preventDefault();
        const vitalIdToUpdate = patientVitals?.vitalId ?? patientVitals?.vital_id;
        if (!vitalIdToUpdate) return;

        try {
            const params = new URLSearchParams();
            if (editData.temperature) params.append('temp', editData.temperature);
            if (editData.bloodPressure) params.append('bp', editData.bloodPressure);
            if (editData.heartRate) params.append('hr', editData.heartRate);
            if (editData.oxygenSaturation) params.append('o2', editData.oxygenSaturation);

            await api.put(`/vitals/${vitalIdToUpdate}?${params.toString()}`);
            setIsVitalsModalOpen(false);
            alert("Vitals updated successfully.");
        } catch (err) {
            console.error("Failed to update vitals:", err);
            alert("Failed to update vitals.");
        }
    };

    if (loading) return <div className="p-8">Loading provider dashboard...</div>;

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${colorClass}`}>
                <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dr. {user?.lastName || 'Provider'} Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Here's your clinic activity for today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Active Patients" value="--" icon={Users} colorClass="bg-blue-500" />
                <StatCard title="Today's Appointments" value={appointments.length || "0"} icon={CalendarIcon} colorClass="bg-green-500" />
                <StatCard title="Pending Assessments" value="3" icon={FileText} colorClass="bg-orange-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
                    <button className="text-sm font-medium text-primary hover:text-blue-700">View All</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <tr key={apt.appointmentId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {new Date(apt.appointmentDate).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Patient #{apt.patient?.patientId || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {apt.purpose}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                apt.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                    apt.status === 'VERIFIED' ? 'bg-purple-100 text-purple-800' :
                                                        apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleViewVitals(apt.patient?.patientId)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                Vitals
                                            </button>
                                            {apt.status === 'PENDING' && (
                                                <button
                                                    onClick={() => updateStatus(apt.appointmentId, 'SCHEDULED')}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    Accept
                                                </button>
                                            )}
                                            {apt.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={() => updateStatus(apt.appointmentId, 'VERIFIED')}
                                                    className="text-purple-600 hover:text-purple-900 mr-3"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                            <button className="text-primary hover:text-blue-900">Review</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 whitespace-nowrap text-sm text-center text-gray-500">
                                        No upcoming appointments today.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vitals Modal for Doctor */}
            {isVitalsModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsVitalsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleUpdateVitals}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                                        Patient Vitals (Patient #{selectedPatient})
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                                            <input
                                                type="number"
                                                value={editData.heartRate}
                                                onChange={(e) => setEditData({ ...editData, heartRate: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Blood Pressure (mmHg)</label>
                                            <input
                                                type="text"
                                                value={editData.bloodPressure}
                                                onChange={(e) => setEditData({ ...editData, bloodPressure: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={editData.temperature}
                                                onChange={(e) => setEditData({ ...editData, temperature: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Oxygen Saturation (%)</label>
                                            <input
                                                type="number"
                                                value={editData.oxygenSaturation}
                                                onChange={(e) => setEditData({ ...editData, oxygenSaturation: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2 bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Update Vitals
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsVitalsModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
