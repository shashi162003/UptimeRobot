import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const DashboardSidebar = ({ monitors, summary }) => {
    const upCount = monitors.filter(m => m.status === 'up').length;
    const downCount = monitors.filter(m => m.status === 'down').length;
    const pausedCount = monitors.filter(m => m.status === 'paused').length;
    const overallStatus = downCount > 0 ? 'down' : 'up';

    return (
        <div className="space-y-6">
            <div className="bg-[#18181B] p-6 rounded-lg shadow-lg border border-gray-800">
                <h3 className="font-semibold text-gray-200 mb-4">Current status</h3>
                <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${overallStatus === 'up' ? 'bg-green-500/20 animate-wave-green' : 'bg-red-500/20 animate-wave-red'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${overallStatus === 'up' ? 'bg-green-500' : 'bg-red-500'}`}>
                            {overallStatus === 'up' ? <CheckCircle size={32} className="text-white" /> : <AlertTriangle size={32} className="text-white" />}
                        </div>
                    </div>
                </div>
                <div className="flex justify-around text-center mt-4">
                    <div><p className="text-2xl font-bold text-red-500">{downCount}</p><p className="text-sm text-gray-400">Down</p></div>
                    <div><p className="text-2xl font-bold text-green-500">{upCount}</p><p className="text-sm text-gray-400">Up</p></div>
                    <div><p className="text-2xl font-bold text-gray-500">{pausedCount}</p><p className="text-sm text-gray-400">Paused</p></div>
                </div>
            </div>
            {summary && <div className="bg-[#18181B] p-6 rounded-lg shadow-lg border border-gray-800">
                <h3 className="font-semibold text-gray-200 mb-4">Last 24 hours</h3>
                <div className="flex items-baseline justify-between">
                    <p className="text-3xl font-bold text-green-400">{summary.overallUptimePercentage}%</p>
                    <p className="text-sm text-gray-400">Overall uptime</p>
                </div>
                <div className="flex items-baseline justify-between mt-4">
                    <p className="text-3xl font-bold text-red-400">{summary.totalChecks}</p>
                    <p className="text-sm text-gray-400">Incidents</p>
                </div>
            </div>}
        </div>
    );
};

export default DashboardSidebar;