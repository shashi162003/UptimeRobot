import React from 'react';
import { MoreVertical } from 'lucide-react';

const MonitorListItem = ({ monitor, onClick }) => {
    const uptimePercentage = Math.floor(Math.random() * (100 - 95 + 1) + 95); // Mock uptime
    const statusConfig = {
        up: { color: 'bg-green-500', text: 'Up' },
        down: { color: 'bg-red-500', text: 'Down' },
        paused: { color: 'bg-gray-500', text: 'Paused' }
    };

    return (
        <div onClick={onClick} className="flex items-center p-4 bg-[#18181B] rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-gray-800">
            <div className={`w-3 h-3 rounded-full mr-4 ${statusConfig[monitor.status].color} ${monitor.status !== 'paused' ? (monitor.status === 'up' ? 'animate-wave-green' : 'animate-wave-red') : ''}`}></div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-100">{monitor.name}</p>
                <p className="text-sm text-gray-400">{statusConfig[monitor.status].text} - {monitor.url}</p>
            </div>
            <div className="flex items-center space-x-0.5 mx-6 hidden md:flex">
                {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className={`h-6 w-1 rounded ${Math.random() > 0.1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                ))}
            </div>
            <div className="text-sm text-gray-300 w-20 text-right hidden lg:block">{uptimePercentage}%</div>
            <button className="p-2 text-gray-500 hover:text-white ml-4"><MoreVertical /></button>
        </div>
    );
};

export default MonitorListItem;