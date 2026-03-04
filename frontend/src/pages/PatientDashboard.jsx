import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, Heart, Thermometer, Droplets, Wind } from 'lucide-react';
import api from '../api/axiosConfig';

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [vitals, setVitals] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch vitals using user ID
        // api.get(`/vitals/patient/${user.id}`).then(...)
        setTimeout(() => {
            setVitals({
                temperature: 36.8,
                bloodPressure: '120/80',
                heartRate: 72,
                oxygenSaturation: 98,
                lastUpdated: new Date().toLocaleString()
            });
            setLoading(false);
        }, 1000);
    }, []);

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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Patient'}</h1>
                <p className="text-sm text-gray-500 mt-1">Here is your latest health overview. Last updated: {vitals?.lastUpdated}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <VitalCard
                    title="Heart Rate"
                    value={vitals?.heartRate}
                    unit="bpm"
                    icon={Heart}
                    colorClass="bg-red-500"
                />
                <VitalCard
                    title="Blood Pressure"
                    value={vitals?.bloodPressure}
                    unit="mmHg"
                    icon={Activity}
                    colorClass="bg-blue-500"
                />
                <VitalCard
                    title="Temperature"
                    value={vitals?.temperature}
                    unit="°C"
                    icon={Thermometer}
                    colorClass="bg-orange-500"
                />
                <VitalCard
                    title="Oxygen Level"
                    value={vitals?.oxygenSaturation}
                    unit="%"
                    icon={Wind}
                    colorClass="bg-teal-500"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Appointments</h3>
                <div className="text-center py-8 text-gray-500">
                    No upcoming appointments scheduled.
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
