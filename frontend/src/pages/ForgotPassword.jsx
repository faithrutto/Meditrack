import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, ArrowRight, ChevronLeft, RefreshCcw } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            // Redirect to OTP verification with type PASSWORD_RESET
            navigate('/verify-otp', { state: { email, type: 'PASSWORD_RESET' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
                    }
                `}
            </style>

            <div className="glass max-w-md w-full rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <KeyRound size={120} />
                </div>

                <div className="relative z-10">
                    <Link to="/login" className="inline-flex items-center text-blue-300 hover:text-white mb-8 transition-colors text-sm">
                        <ChevronLeft size={16} className="mr-1" />
                        Back to Login
                    </Link>

                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                        <KeyRound className="text-blue-400" size={32} />
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                    <p className="text-blue-200/70 mb-8">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-blue-200/60 mb-2 ml-1">Email Address</label>
                            <div className="input-glass flex items-center rounded-2xl px-4 py-4">
                                <Mail className="text-blue-400 mr-3" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
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
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition duration-300 flex items-center justify-center group shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <RefreshCcw className="animate-spin mr-2" size={20} />
                            ) : (
                                <>
                                    Send Reset Code
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

export default ForgotPassword;
