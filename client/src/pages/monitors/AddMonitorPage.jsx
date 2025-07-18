import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { ChevronLeft } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { PlusCircle } from 'lucide-react';
import { Monitor } from 'lucide-react';

const AddMonitorPage = ({ setPage, showToast }) => {
    const [formData, setFormData] = useState({ name: '', url: '', interval: 5 });
    const [channels, setChannels] = useState([]);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.getChannels()
            .then(data => setChannels(data.data))
            .catch(err => showToast('Failed to load notification channels from the server', err))
            .finally(() => setLoading(false));
    }, [showToast]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleChannelToggle = (channelId) => {
        setSelectedChannels(prev =>
            prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newMonitor = await apiService.createMonitor(formData);
            if (selectedChannels.length > 0) {
                await apiService.linkChannelsToMonitor(newMonitor.data._id, selectedChannels);
            }
            showToast('Monitor created successfully!', 'success');
            setPage('dashboard');
        } catch (error) {
            showToast(error.message || 'Failed to create monitor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => setPage('dashboard')} className="flex items-center text-sm text-indigo-400 hover:underline mb-4"><ChevronLeft size={16} className="mr-1" /> Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-white mb-6">Add New Monitor</h1>
            <form onSubmit={handleSubmit} className="bg-[#18181B] p-8 rounded-lg space-y-6">
                <div><label className="block text-gray-400 text-sm font-bold mb-2">Monitor Name</label><input name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 text-white rounded py-2 px-3" placeholder="e.g., My Personal Blog" required /></div>
                <div><label className="block text-gray-400 text-sm font-bold mb-2">URL to Monitor</label><input name="url" value={formData.url} onChange={handleChange} className="w-full bg-gray-800 text-white rounded py-2 px-3" placeholder="https://" required /></div>
                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Monitor Interval (minutes)</label>
                    <div className="flex space-x-2">{[1, 5, 15, 30, 60].map(val => <button key={val} type="button" onClick={() => setFormData({ ...formData, interval: val })} className={`${formData.interval === val ? 'bg-indigo-600' : 'bg-gray-700'} hover:bg-indigo-600 px-4 py-2 rounded-md`}>{val}m</button>)}</div>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Notify via</label>
                    <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                        {loading ? <Spinner /> : channels.length > 0 ? channels.map(channel => (
                            <label key={channel._id} className="flex items-center"><input type="checkbox" checked={selectedChannels.includes(channel._id)} onChange={() => handleChannelToggle(channel._id)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-indigo-600 rounded focus:ring-indigo-500" /><span className="ml-3 text-white">{channel.target}</span></label>
                        )) : <p className="text-gray-500 text-sm">No notification channels found. Please add one in Settings.</p>}
                    </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Monitor'}</button>
            </form>
        </div>
    );
};

export default AddMonitorPage;