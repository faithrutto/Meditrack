import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, Plus, X, CheckCircle, XCircle, User } from 'lucide-react';
import api from '../api/axiosConfig';

// ─── Shared Status Badge ────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        SCHEDULED: 'bg-blue-100 text-blue-800',
        VERIFIED: 'bg-purple-100 text-purple-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

// ─── Patient View ─────────────────────────────────────────────────────────────
const PatientAppointments = ({ user }) => {
    const [appointments, setAppointments] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        providerId: '',
        date: '',
        time: '',
        purpose: '',
    });

    const fetchData = async () => {
        try {
            const [aptsRes, provsRes] = await Promise.all([
                api.get(`/appointments/patient/${user.patientId}`),
                api.get('/appointments/providers'),
            ]);
            setAppointments(aptsRes.data || []);
            setProviders(provsRes.data || []);
        } catch (err) {
            console.error('Failed to load appointment data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    const handleBook = async (e) => {
        e.preventDefault();
        setError('');
        setBooking(true);
        try {
            // Combine date + time into ISO datetime
            const dateTime = `${form.date}T${form.time}:00`;
            await api.post(
                `/appointments/book?patientId=${user.patientId}&providerId=${form.providerId}&date=${encodeURIComponent(dateTime)}&purpose=${encodeURIComponent(form.purpose)}`
            );
            setSuccess('Appointment booked successfully!');
            setShowModal(false);
            setForm({ providerId: '', date: '', time: '', purpose: '' });
            fetchData(); // refresh list
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Booking failed. The time slot may be taken.');
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading appointments...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
                    <p className="text-sm text-gray-500 mt-1">View and manage your upcoming visits</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setError(''); setSuccess(''); }}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Book Appointment
                </button>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" /> {success}
                </div>
            )}

            {/* Appointments List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {appointments.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
                        <p className="font-medium">No appointments yet</p>
                        <p className="text-sm mt-1">Book your first appointment using the button above</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Date & Time', 'Doctor', 'Purpose', 'Status'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((apt) => (
                                <tr key={apt.appointmentId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                            {new Date(apt.appointmentDate).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {apt.provider?.user?.profile ? (
                                            `Dr. ${apt.provider.user.profile.firstName} ${apt.provider.user.profile.lastName}`
                                        ) : (
                                            `Dr. #${apt.provider?.providerId || '—'}`
                                        )}
                                        {apt.provider?.specialization ? ` · ${apt.provider.specialization}` : ''}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{apt.appointmentPurpose}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={apt.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Book New Appointment</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                        )}

                        <form onSubmit={handleBook} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Healthcare Provider</label>
                                <select
                                    required
                                    value={form.providerId}
                                    onChange={e => setForm({ ...form, providerId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select a doctor…</option>
                                    {providers.map(p => (
                                        <option key={p.providerId} value={p.providerId}>
                                            {p.user?.profile ? (
                                                `Dr. ${p.user.profile.firstName} ${p.user.profile.lastName}`
                                            ) : (
                                                p.user?.email || `Provider #${p.providerId}`
                                            )}
                                            {p.specialization ? ` — ${p.specialization}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={form.time}
                                        onChange={e => setForm({ ...form, time: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="e.g. Annual checkup, follow-up on lab results…"
                                    value={form.purpose}
                                    onChange={e => setForm({ ...form, purpose: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={booking}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                                >
                                    {booking ? 'Booking…' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Doctor View ─────────────────────────────────────────────────────────────
const DoctorAppointments = ({ user }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null); // appointmentId being updated

    const fetchData = async () => {
        try {
            const res = await api.get(`/appointments/provider/${user.providerId}`);
            setAppointments(res.data || []);
        } catch (err) {
            console.error('Failed to load provider appointments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    const updateStatus = async (appointmentId, status) => {
        setUpdating(appointmentId);
        try {
            await api.put(`/appointments/${appointmentId}/status?status=${status}`);
            setAppointments(prev =>
                prev.map(a => a.appointmentId === appointmentId ? { ...a, status } : a)
            );
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading patient queue…</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Patient Appointments</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your scheduled visits and update their status</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {appointments.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-40" />
                        <p className="font-medium">No appointments scheduled</p>
                        <p className="text-sm mt-1">Appointments booked by patients will appear here</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Date & Time', 'Patient', 'Purpose', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((apt) => (
                                <tr key={apt.appointmentId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                            {new Date(apt.appointmentDate).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        Patient #{apt.patient?.patientId || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{apt.appointmentPurpose}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={apt.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            {apt.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        disabled={updating === apt.appointmentId}
                                                        onClick={() => updateStatus(apt.appointmentId, 'SCHEDULED')}
                                                        className="flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        disabled={updating === apt.appointmentId}
                                                        onClick={() => updateStatus(apt.appointmentId, 'CANCELLED')}
                                                        className="flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5 mr-1" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'SCHEDULED' && (
                                                <>
                                                    <button
                                                        disabled={updating === apt.appointmentId}
                                                        onClick={() => updateStatus(apt.appointmentId, 'VERIFIED')}
                                                        className="flex items-center px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                        Verify
                                                    </button>
                                                    <button
                                                        disabled={updating === apt.appointmentId}
                                                        onClick={() => updateStatus(apt.appointmentId, 'CANCELLED')}
                                                        className="flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5 mr-1" />
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'VERIFIED' && (
                                                <button
                                                    disabled={updating === apt.appointmentId}
                                                    onClick={() => updateStatus(apt.appointmentId, 'COMPLETED')}
                                                    className="flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                    Complete
                                                </button>
                                            )}
                                            {(apt.status === 'COMPLETED' || apt.status === 'CANCELLED') && (
                                                <span className="text-xs text-gray-400 italic">Closed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ─── Main Router ──────────────────────────────────────────────────────────────
const Appointments = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div className="p-8 text-gray-500">Please log in to view appointments.</div>;

    if (user.role === 'PATIENT') return <PatientAppointments user={user} />;
    if (user.role === 'PROVIDER') return <DoctorAppointments user={user} />;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointments</h2>
            <p className="text-gray-600">Appointment management for your role is not yet configured.</p>
        </div>
    );
};

export default Appointments;
