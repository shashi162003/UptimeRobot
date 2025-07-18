import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import DashboardSidebar from './DashboardSidebar';
import MonitorListItem from './MonitorListItem';
import { PlusCircle } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import { Monitor } from 'lucide-react';

const DashboardPage = ({ setPage, setSelectedMonitorId }) => {
    const [monitors, setMonitors] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [monitorsData, summaryData] = await Promise.all([apiService.getMonitors(), apiService.getOverallSummary()]);
                setMonitors(monitorsData.data);
                setSummary(summaryData.data);
            } catch (error) { console.error("Failed to fetch dashboard data", error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Monitors</h1>
                    <button onClick={() => setPage('addMonitor')} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"><PlusCircle size={20} className="mr-2" /> New Monitor</button>
                </div>
                <div className="space-y-4">
                    {monitors.length > 0 ? (
                        monitors.map(monitor => <MonitorListItem key={monitor._id} monitor={monitor} onClick={() => setSelectedMonitorId(monitor._id)} />)
                    ) : (
                        <div className="text-center py-16 text-gray-500 bg-[#18181B] rounded-lg">
                            <Monitor size={48} className="mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">No monitors yet</h3>
                            <p>Click "New Monitor" to get started.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-1">
                <DashboardSidebar monitors={monitors} summary={summary} />
            </div>
        </div>
    );
};

export default DashboardPage;