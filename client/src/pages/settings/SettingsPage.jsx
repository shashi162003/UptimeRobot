import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import { KeyRound, Mail, Trash2 } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { ChevronLeft } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { Monitor } from 'lucide-react';

const SettingsPage = ({ user, showToast, onUserUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({ username: user.username, email: user.email });
    const [passwordData, setPasswordData] = useState({ otp: '', newPassword: '' });
    const [channels, setChannels] = useState([]);
    const [newChannel, setNewChannel] = useState('');
    const [passwordChangeStep, setPasswordChangeStep] = useState('request');
    const [loading, setLoading] = useState({ profile: false, password: false, channels: false });

    const fetchChannels = useCallback(async () => {
        try {
            const response = await apiService.getChannels();
            setChannels(response.data);
        } catch (error) {
            showToast('Failed to load notification channels. ', error);
        }
    }, [showToast]);

    useEffect(() => {
        if (activeTab === 'notifications') {
            fetchChannels();
        }
    }, [activeTab, fetchChannels]);

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, profile: true }));
        try {
            const updatedUser = await apiService.updateProfile(profileData);
            onUserUpdate(updatedUser.data);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to update profile.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    };

    const handleRequestPasswordChange = async () => {
        setLoading(prev => ({ ...prev, password: true }));
        try {
            await apiService.requestPasswordChange();
            setPasswordChangeStep('verify');
            showToast('Password change OTP sent to your email.', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to request OTP.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    const handleVerifyPasswordChange = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, password: true }));
        try {
            await apiService.verifyPasswordChange(passwordData);
            setPasswordChangeStep('request');
            setPasswordData({ otp: '', newPassword: '' });
            showToast('Password changed successfully!', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to change password.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    const handleAddChannel = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, channels: true }));
        try {
            await apiService.createChannel({ type: 'email', target: newChannel });
            setNewChannel('');
            fetchChannels();
            showToast('Notification channel added!', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to add channel.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, channels: false }));
        }
    };

    const handleDeleteChannel = async (channelId) => {
        try {
            await apiService.deleteChannel(channelId);
            fetchChannels();
            showToast('Channel deleted.', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to delete channel.', 'error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
            <div className="flex border-b border-gray-800 mb-6">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-lg ${activeTab === 'profile' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Profile</button>
                <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 text-lg ${activeTab === 'notifications' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Notifications</button>
            </div>
            {activeTab === 'profile' && (
                <div className="bg-[#18181B] p-8 rounded-lg space-y-6">
                    <form onSubmit={handleProfileSubmit} className="space-y-4"><h2 className="text-xl font-semibold text-white">User Profile</h2><div><label className="block text-gray-400 text-sm font-bold mb-2">Username</label><input name="username" value={profileData.username} onChange={handleProfileChange} className="w-full bg-gray-800 text-white rounded py-2 px-3" /></div><div><label className="block text-gray-400 text-sm font-bold mb-2">Email</label><input name="email" value={profileData.email} onChange={handleProfileChange} className="w-full bg-gray-800 text-white rounded py-2 px-3" /></div><button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" disabled={loading.profile}>{loading.profile ? 'Saving...' : 'Save Changes'}</button></form>
                    <div className="border-t border-gray-800 pt-6"><h2 className="text-xl font-semibold text-white">Change Password</h2>{passwordChangeStep === 'request' && (<button onClick={handleRequestPasswordChange} className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center" disabled={loading.password}><KeyRound size={16} className="mr-2" /> {loading.password ? 'Sending...' : 'Request Password Change OTP'}</button>)}{passwordChangeStep === 'verify' && (<form onSubmit={handleVerifyPasswordChange} className="space-y-4 mt-4"><div><label className="block text-gray-400 text-sm font-bold mb-2">OTP</label><input name="otp" value={passwordData.otp} onChange={handlePasswordChange} className="w-full bg-gray-800 text-white rounded py-2 px-3" placeholder="Enter OTP from email" required /></div><div><label className="block text-gray-400 text-sm font-bold mb-2">New Password</label><input name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full bg-gray-800 text-white rounded py-2 px-3" placeholder="Enter new password" required /></div><button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" disabled={loading.password}>{loading.password ? 'Verifying...' : 'Verify & Change Password'}</button></form>)}</div>
                </div>
            )}
            {activeTab === 'notifications' && (
                <div className="bg-[#18181B] p-8 rounded-lg space-y-6">
                    <h2 className="text-xl font-semibold text-white">Notification Channels</h2>
                    <div className="space-y-4">{channels.map(channel => (<div key={channel._id} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"><div><p className="font-semibold text-white flex items-center"><Mail size={16} className="mr-2" /> Email</p><p className="text-sm text-gray-400 ml-6">{channel.target}</p></div><button onClick={() => handleDeleteChannel(channel._id)} className="text-red-500 hover:text-red-400"><Trash2 /></button></div>))}</div>
                    <div className="border-t border-gray-800 pt-6"><h2 className="text-xl font-semibold text-white">Add New Channel</h2><form onSubmit={handleAddChannel} className="flex items-end space-x-4 mt-4"><div className="flex-grow"><label className="block text-gray-400 text-sm font-bold mb-2">Email Address</label><input value={newChannel} onChange={(e) => setNewChannel(e.target.value)} className="w-full bg-gray-800 text-white rounded py-2 px-3" placeholder="new.email@example.com" required /></div><button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" disabled={loading.channels}>{loading.channels ? 'Adding...' : 'Add'}</button></form></div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;