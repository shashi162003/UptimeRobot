import React, { useState } from 'react';
import AuthPageLayout from './AuthPageLayout';
import apiService from '../../services/api';

const LoginPage = ({ setPage, setAuthFlow, showToast }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await apiService.login(formData);
            setAuthFlow({ type: 'login', email: formData.email });
            setPage('otp');
        } catch (error) { showToast(error.message || 'Login failed', 'error'); }
        finally { setLoading(false); }
    };
    return (
        <AuthPageLayout title="Welcome back! Please sign in.">
            <form onSubmit={handleSubmit}>
                <div className="mb-4"><label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">Email</label><input className="w-full bg-gray-800 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required /></div>
                <div className="mb-6"><label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">Password</label><input className="w-full bg-gray-800 text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required /></div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Sending OTP...' : 'Sign In & Get OTP'}</button>
                <p className="text-center text-gray-400 text-sm mt-6">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setPage('register'); }} className="text-indigo-400 hover:underline">Register here</a></p>
            </form>
        </AuthPageLayout>
    );
};

export default LoginPage;