import React from 'react';
import { Monitor, Settings, LogOut } from 'lucide-react';
import Logo from '../Logo';


const Sidebar = ({ user, setPage, onLogout }) => (
    <div className="w-16 md:w-64 bg-[#111827] text-gray-400 flex flex-col h-full fixed">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6"><Logo />
            <span className="ml-3 text-xl font-bold text-gray-100 hidden md:block">UptimeTracker</span>
        </div>
        <nav className="flex-grow">
            <a href="#" onClick={(e) => { e.preventDefault(); setPage('dashboard'); }} className="flex items-center px-6 py-4 hover:bg-gray-800 text-gray-200 transition-colors"><Monitor /><span className="ml-4 hidden md:block">Dashboard</span></a>
            <a href="#" onClick={(e) => { e.preventDefault(); setPage('settings'); }} className="flex items-center px-6 py-4 hover:bg-gray-800 transition-colors"><Settings /><span className="ml-4 hidden md:block">Settings</span></a>
        </nav>
        <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-center md:justify-start">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-indigo-400">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
                <div className="ml-3 hidden md:block flex-1 overflow-hidden"><p className="font-semibold text-sm text-gray-200 truncate">{user?.username}</p><p className="text-xs text-gray-500 truncate">{user?.email}</p></div>
                <button onClick={onLogout} className="ml-auto p-2 hover:bg-gray-700 rounded-full hidden md:block"><LogOut /></button>
            </div>
        </div>
    </div>
);

export default Sidebar;