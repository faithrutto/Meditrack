import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Mfa = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext); // In a real app, this would be a separate verifyMfa call
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Placeholder for MFA verification logic
        try {
            console.log('Verifying MFA code:', code);
            // Simulate a successful verification and redirect
            setTimeout(() => {
                setLoading(false);
                navigate('/');
            }, 1000);
        } catch (err) {
            setError('Invalid verification code');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-primary mb-4">
                    <ShieldCheck className="h-12 w-12" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Multi-Factor Authentication
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter the code from your authenticator app
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Verification Code</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Mfa;
