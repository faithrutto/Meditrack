import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Mail, ArrowRight, RefreshCcw } from 'lucide-react';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const inputRefs = useRef([]);

    const email = location.state?.email || '';
    const type = location.state?.type || 'REGISTRATION';

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => clearInterval(timer);
    }, [resendTimer, email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the full 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:8080/api/auth/verify-otp', {
                email,
                otp: code,
                type
            });

            if (type === 'REGISTRATION') {
                alert('Account verified successfully! You can now log in.');
                navigate('/login');
            } else {
                navigate('/reset-password', { state: { email, otp: code } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        try {
            // Re-use register or forgot password logic depending on type
            const endpoint = type === 'REGISTRATION' ? '/api/auth/register-resend' : '/api/auth/forgot-password';
            // For now, let's assume forgot-password endpoint handles resend for RESET
            // For registration, we might need a specific resend endpoint or re-trigger register logic subtly
            // Let's implement /api/auth/resend-otp on backend for consistency
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });

            setResendTimer(60);
            setCanResend(false);
            alert('A new code has been sent to your email.');
        } catch (err) {
            setError('Failed to resend code.');
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
                    .otp-input {
                        width: 45px;
                        height: 55px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 12px;
                        text-align: center;
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: white;
                        transition: all 0.3s ease;
                    }
                    .otp-input:focus {
                        outline: none;
                        border-color: #4ade80;
                        box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
                        background: rgba(255, 255, 255, 0.15);
                    }
                `}
            </style>

            <div className="glass max-w-md w-full rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={120} />
                </div>

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <Mail className="text-emerald-400" size={40} />
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Verify Account</h1>
                    <p className="text-blue-200/70 mb-8">
                        We've sent a 6-digit code to <br />
                        <span className="text-white font-medium">{email}</span>
                    </p>

                    <form onSubmit={handleVerify}>
                        <div className="flex justify-between mb-8 gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="otp-input"
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-3 rounded-xl mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl transition duration-300 flex items-center justify-center group shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? (
                                <RefreshCcw className="animate-spin mr-2" size={20} />
                            ) : (
                                <>
                                    Verify & Continue
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-blue-200/50 mb-4">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={!canResend || loading}
                            className={`flex items-center mx-auto font-medium transition-colors ${canResend ? 'text-emerald-400 hover:text-emerald-300' : 'text-blue-200/30 cursor-not-allowed'
                                }`}
                        >
                            <RefreshCcw size={16} className={`mr-2 ${loading && 'animate-spin'}`} />
                            {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
