import React from 'react';


const AuthPageLayout = ({ title, children }) => (
    <div className="min-h-screen bg-[#09090B] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <img src="/logo.svg" alt="Logo" className="inline-block w-16 h-16 mb-4" />
                <h1 className="text-3xl font-bold text-white">Uptime Monitor</h1>
                <p className="text-gray-400 mt-2">{title}</p>
            </div>
            <div className="bg-[#18181B] p-8 rounded-lg shadow-lg">{children}</div>
        </div>
    </div>
);

export default AuthPageLayout;