import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar as CalendarIcon, FileText } from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);

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
                <StatCard title="Active Patients" value="24" icon={Users} colorClass="bg-blue-500" />
                <StatCard title="Today's Appointments" value="6" icon={CalendarIcon} colorClass="bg-green-500" />
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
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">10:00 AM</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Doe</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Routine Checkup</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Confirmed
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary hover:text-blue-900">Review</button>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">11:30 AM</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sarah Smith</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Blood Test Follow-up</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary hover:text-blue-900">Review</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
