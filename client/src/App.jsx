import React, { useState, useEffect, useCallback } from 'react';
import apiService from './services/api';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OtpPage from './pages/auth/OtpPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MonitorDetailsPage from './pages/monitors/MonitorDetailsPage';
import AddMonitorPage from './pages/monitors/AddMonitorPage';
import SettingsPage from './pages/settings/SettingsPage';
import Toast from './components/common/Toast';
import Spinner from './components/common/Spinner';
import GlobalStyles from './components/GlobalStyles';

export default function App() {
  const [page, setPage] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [authFlow, setAuthFlow] = useState({ type: 'login', email: '' });
  const [selectedMonitorId, setSelectedMonitorId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const profile = await apiService.getProfile();
          setUser(profile.data);
          setPage('dashboard');
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          showToast('Session expired. Please log in again.', error);
        }
      } else {
        setPage('login');
        setUser(null);
      }
    };
    checkAuth();
  }, [token, showToast]);

  useEffect(() => {
    if (selectedMonitorId) setPage('monitorDetails');
  }, [selectedMonitorId]);

  const onLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setSelectedMonitorId(null);
  };

  const renderPage = () => {
    if (!user && token) return <div className="bg-gray-900 h-screen flex items-center justify-center"><Spinner /></div>;

    if (!token) {
      switch (page) {
        case 'register': return <RegisterPage setPage={setPage} setAuthFlow={setAuthFlow} showToast={showToast} />;
        case 'otp': return <OtpPage setToken={setToken} authFlow={authFlow} showToast={showToast} />;
        default: return <LoginPage setPage={setPage} setAuthFlow={setAuthFlow} showToast={showToast} />;
      }
    }

    return (
      <Layout user={user} setPage={setPage} onLogout={onLogout}>
        {(() => {
          switch (page) {
            case 'dashboard': return <DashboardPage setPage={setPage} setSelectedMonitorId={setSelectedMonitorId} />;
            case 'monitorDetails': return <MonitorDetailsPage monitorId={selectedMonitorId} setPage={setPage} showToast={showToast} />;
            case 'addMonitor': return <AddMonitorPage setPage={setPage} showToast={showToast} />;
            case 'settings': return <SettingsPage user={user} showToast={showToast} onUserUpdate={handleUserUpdate} />;
            default: return <DashboardPage setPage={setPage} setSelectedMonitorId={setSelectedMonitorId} />;
          }
        })()}
      </Layout>
    );
  };

  return (
    <div className="font-sans">
      <GlobalStyles />
      {renderPage()}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}