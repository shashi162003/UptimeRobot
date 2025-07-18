import React, { useState } from 'react';
import AuthPageLayout from './AuthPageLayout';
import apiService from '../../services/api';

const OtpPage = ({ setToken, authFlow, showToast }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            let response;
            if (authFlow.type === 'login') {
                response = await apiService.verifyLogin({ email: authFlow.email, otp });
            } else {
                await apiService.verifyRegistration({ email: authFlow.email, otp });
                showToast('Registration successful! Please log in.', 'success');
                window.location.reload(); return;
            }
            localStorage.setItem('token', response.token);
            setToken(response.token);
        } catch (error) { showToast(error.message || 'OTP verification failed', 'error'); }
        finally { setLoading(false); }
    };
    return (
        <AuthPageLayout title="Verify Your Identity">
            <p className="text-center text-gray-300 mb-6">An OTP has been sent to <span className="font-bold text-white">{authFlow.email}</span>.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-6"><label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="otp">One-Time Password</label><input className="w-full bg-gray-800 text-white text-center text-2xl tracking-[1em] rounded py-3 px-3" id="otp" type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="••••••" required /></div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Continue'}</button>
            </form>
        </AuthPageLayout>
    );
};

export default OtpPage;