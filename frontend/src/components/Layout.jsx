import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Activity, Calendar, Settings } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface shadow-md hidden md:flex md:flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-primary mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Medi<span className="text-primary">Track</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 relative">
                    <Link to="/" className="flex items-center px-4 py-3 text-gray-700 bg-blue-50 text-primary rounded-lg font-medium transition-colors">
                        <Activity className="h-5 w-5 mr-3" />
                        Dashboard
                    </Link>

                    <Link to="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
                        <Calendar className="h-5 w-5 mr-3" />
                        Appointments
                    </Link>

                    <Link to="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
                        <User className="h-5 w-5 mr-3" />
                        Profile
                    </Link>

                    {user?.role === 'ADMIN' && (
                        <Link to="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
                            <Settings className="h-5 w-5 mr-3" />
                            System Settings
                        </Link>
                    )}

                    <div className="absolute bottom-4 left-4 right-4">
                        <button
                            onClick={logout}
                            className="flex w-full items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-surface shadow-sm h-16 flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {user?.role === 'PATIENT' ? 'My Health Overview' :
                            user?.role === 'PROVIDER' ? 'Doctor Workspace' : 'Admin Control Panel'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-background">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
