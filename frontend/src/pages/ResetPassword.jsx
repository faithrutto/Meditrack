import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Lock, ShieldCheck, ArrowRight, RefreshCcw, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const otp = location.state?.otp || '';

    useEffect(() => {
        if (!email || !otp) {
            navigate('/forgot-password');
        }
    }, [email, otp, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });

            alert('Password reset successful! You can now log in with your new password.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-teal-800 p-4">
            <style>
                {`
                    .glass {
                        background: rgba(255, 255, 255, 0.05);
                        backdrop-filter: blur(16px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    }
                    .input-glass {
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transition: all 0.3s ease;
                    }
                    .input-glass:focus-within {
                        background: rgba(255, 255, 255, 0.1);
                        border-color: rgba(255, 255, 255, 0.3);
                    }
                `}
            </style>

            <div className="glass max-w-md w-full rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={120} />
                </div>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                        <Lock className="text-indigo-400" size={32} />
                    </div>

                    <h1 className="text-3xl font-bold mb-2">New Password</h1>
                    <p className="text-blue-200/70 mb-8">
                        Secure your account with a strong new password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-blue-200/60 mb-2 ml-1">New Password</label>
                            <div className="input-glass flex items-center rounded-2xl px-4 py-4 relative">
                                <Lock className="text-indigo-400 mr-3" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-transparent border-none outline-none w-full text-white placeholder-blue-200/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-blue-300/50 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-200/60 mb-2 ml-1">Confirm Password</label>
                            <div className="input-glass flex items-center rounded-2xl px-4 py-4">
                                <Lock className="text-indigo-400 mr-3" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-transparent border-none outline-none w-full text-white placeholder-blue-200/30"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition duration-300 flex items-center justify-center group shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <RefreshCcw className="animate-spin mr-2" size={20} />
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
