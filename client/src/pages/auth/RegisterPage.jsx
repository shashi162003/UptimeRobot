import React, { useState } from 'react';
import AuthPageLayout from './AuthPageLayout';
import apiService from '../../services/api';

const RegisterPage = ({ setPage, setAuthFlow, showToast }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await apiService.register(formData);
            setAuthFlow({ type: 'register', email: formData.email });
            setPage('otp');
        } catch (error) { showToast(error.message || 'Registration failed', 'error'); }
        finally { setLoading(false); }
    };
    return (
        <AuthPageLayout title="Create your account.">
            <form onSubmit={handleSubmit}>
                <div className="mb-4"><label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">Username</label><input className="w-full bg-gray-800 text-white rounded py-2 px-3" name="username" type="text" placeholder="yourusername" value={formData.username} onChange={handleChange} required /></div>
                <div className="mb-4"><label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">Email</label><input className="w-full bg-gray-800 text-white rounded py-2 px-3" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required /></div>
                <div className="mb-6"><label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">Password</label><input className="w-full bg-gray-800 text-white rounded py-2 px-3" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required /></div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>{loading ? 'Sending OTP...' : 'Register & Get OTP'}</button>
                <p className="text-center text-gray-400 text-sm mt-6">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }} className="text-indigo-400 hover:underline">Sign in</a></p>
            </form>
        </AuthPageLayout>
    );
};

export default RegisterPage;