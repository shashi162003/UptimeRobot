import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, ChevronLeft, Play, Pause } from 'lucide-react';
import Spinner from '../../components/common/Spinner';

const MonitorDetailsPage = ({ monitorId, setPage, showToast }) => {
    const [monitor, setMonitor] = useState(null);
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [monitorData, logsData, summaryData] = await Promise.all([
                apiService.getMonitorById(monitorId),
                apiService.getMonitorLogs(monitorId),
                apiService.getMonitorSummary(monitorId)
            ]);
            setMonitor(monitorData.data);
            setLogs(logsData.data);
            setSummary(summaryData.data);
        } catch (error) {
            showToast("Failed to load monitor details. ", error);
            setMonitor(null);
        } finally {
            setLoading(false);
        }
    }, [monitorId, showToast]);

    useEffect(() => {
        fetchData();
    }, [monitorId, fetchData, lastUpdated]);

    const handleTogglePause = async () => {
        if (!monitor) return;
        const action = monitor.status === 'paused' ? 'resume' : 'pause';
        try {
            await (action === 'pause' ? apiService.pauseMonitor(monitorId) : apiService.resumeMonitor(monitorId));
            showToast(`Monitor successfully ${action}d.`, 'success');
            setLastUpdated(Date.now());
        } catch (error) {
            showToast(`Failed to ${action} monitor. `, error);
        }
    };

    if (loading) return <Spinner />;
    if (!monitor) return <div className="text-center text-red-500 p-8 bg-[#18181B] rounded-lg">Failed to load monitor details. Please go back to the dashboard.</div>;

    const formattedLogs = logs.map(log => ({ name: new Date(log.timestamp).toLocaleTimeString(), time: log.responseTime }));

    return (
        <div className="space-y-6">
            <div>
                <button onClick={setPage} className="flex items-center text-sm text-indigo-400 hover:underline mb-2"><ChevronLeft size={16} className="mr-1" /> Back to Dashboard</button>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">{monitor.name}</h1>
                    <div className="flex space-x-2">
                        <button onClick={handleTogglePause} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                            {monitor.status === 'paused' ? <Play size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />}
                            {monitor.status === 'paused' ? 'Resume' : 'Pause'}
                        </button>
                    </div>
                </div>
                <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{monitor.url}</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#18181B] p-4 rounded-lg"><p className="text-sm text-gray-400">Current Status</p><p className={`text-xl font-bold ${monitor.status === 'down' ? 'text-red-500' : monitor.status === 'up' ? 'text-green-500' : 'text-gray-500'}`}>{monitor.status.toUpperCase()}</p></div>
                <div className="bg-[#18181B] p-4 rounded-lg"><p className="text-sm text-gray-400">Last Check</p><p className="text-xl font-bold">{new Date(monitor.lastChecked).toLocaleString()}</p></div>
                {summary && <>
                    <div className="bg-[#18181B] p-4 rounded-lg"><p className="text-sm text-gray-400">Uptime (24h)</p><p className="text-xl font-bold">{summary.uptimePercentage}%</p></div>
                    <div className="bg-[#18181B] p-4 rounded-lg"><p className="text-sm text-gray-400">Avg. Response</p><p className="text-xl font-bold">{summary.averageResponseTime}ms</p></div>
                </>}
            </div>
            <div className="bg-[#18181B] p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4">Response Time (ms)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedLogs.reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                        <XAxis dataKey="name" stroke="#A1A1AA" />
                        <YAxis stroke="#A1A1AA" />
                        <Tooltip contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A' }} />
                        <Line type="monotone" dataKey="time" stroke="#6366F1" strokeWidth={2} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 8, fill: '#6366F1' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-[#18181B] p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4">Latest Incidents</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-gray-800"><th className="p-2 text-sm text-gray-400">Status</th><th className="p-2 text-sm text-gray-400">Error</th><th className="p-2 text-sm text-gray-400">Timestamp</th></tr></thead>
                        <tbody>
                            {logs.filter(log => log.status === 'down').map((log) => (
                                <tr key={log._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-2"><span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded-full flex items-center w-fit"><AlertTriangle size={12} className="mr-1" /> Down</span></td>
                                    <td className="p-2 font-mono text-sm">{log.error}</td>
                                    <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonitorDetailsPage;