import React from 'react';
import { Shield, Hash, User, MapPin, Phone } from 'lucide-react';

const AccountCard = ({ user, profile }) => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-900 shadow-xl text-white p-6 max-w-md w-full border border-blue-400/30">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -m-8 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -m-8 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-blue-200 uppercase tracking-widest mb-1">Meditrack Account</h3>
                        <p className="text-lg font-bold">
                            {user?.role === 'PATIENT' ? 'Patient Card' : 'Provider Card'}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl font-bold uppercase shadow-sm border border-white/20">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs text-blue-200 uppercase tracking-wider">Cardholder Name</p>
                            <p className="text-xl font-semibold tracking-wide">
                                {user?.firstName} {user?.lastName}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div>
                            <p className="text-xs text-blue-200 uppercase tracking-wider mb-1 flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {user?.role === 'PATIENT' ? 'Patient ID' : 'Provider ID'}
                            </p>
                            <p className="font-mono text-sm">
                                {user?.role === 'PATIENT' ? (user?.patientId ? `#PAT-${user.patientId}` : 'N/A') : (user?.providerId ? `#PRV-${user.providerId}` : 'N/A')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200 uppercase tracking-wider mb-1 flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                Gender
                            </p>
                            <p className="font-mono text-sm capitalize">
                                {profile?.gender ? profile.gender.toLowerCase() : 'Not set'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p className="text-xs text-blue-200 uppercase tracking-wider mb-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                Home Address
                            </p>
                            <p className="text-sm">
                                {profile?.homeAddress ? profile.homeAddress : 'Not provided'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-rose-300 uppercase tracking-wider mb-1 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                Emergency
                            </p>
                            <p className="text-sm font-medium">
                                {profile?.emergencyContactName || user?.emergencyContactName || 'Not provided'}
                            </p>
                            <p className="text-xs text-blue-100/70">
                                {profile?.emergencyContactPhone || user?.emergencyContactPhone || ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountCard;
