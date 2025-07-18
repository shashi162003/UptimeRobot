import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ user, setPage, onLogout, children }) => (
    <div className="flex h-screen bg-[#09090B] text-gray-200 font-sans">
        <Sidebar user={user} setPage={setPage} onLogout={onLogout} />
        <main className="flex-1 ml-16 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
);

export default Layout;