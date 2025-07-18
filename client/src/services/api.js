const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

const apiService = {
    request: async (endpoint, options = {}) => {
        const { body, method = 'GET' } = options;
        const token = localStorage.getItem('token');
        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (token) headers.append('Authorization', `Bearer ${token}`);
        const config = { method, headers, body: body ? JSON.stringify(body) : undefined };
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'An error occurred');
            return data;
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    },
    register: (data) => apiService.request('/auth/register', { method: 'POST', body: data }),
    verifyRegistration: (data) => apiService.request('/auth/register/verify', { method: 'POST', body: data }),
    login: (data) => apiService.request('/auth/login', { method: 'POST', body: data }),
    verifyLogin: (data) => apiService.request('/auth/login/verify', { method: 'POST', body: data }),
    getProfile: () => apiService.request('/users/me'),
    updateProfile: (data) => apiService.request('/users/me', { method: 'PUT', body: data }),
    requestPasswordChange: () => apiService.request('/users/change-password/request', { method: 'POST' }),
    verifyPasswordChange: (data) => apiService.request('/users/change-password/verify', { method: 'PUT', body: data }),
    getMonitors: () => apiService.request('/monitors'),
    getMonitorById: (id) => apiService.request(`/monitors/${id}`),
    createMonitor: (data) => apiService.request('/monitors', { method: 'POST', body: data }),
    deleteMonitor: (id) => apiService.request(`/monitors/${id}`, { method: 'DELETE' }),
    pauseMonitor: (id) => apiService.request(`/monitors/${id}/pause`, { method: 'PUT' }),
    resumeMonitor: (id) => apiService.request(`/monitors/${id}/resume`, { method: 'PUT' }),
    getOverallSummary: () => apiService.request('/reports/summary'),
    getMonitorLogs: (id) => apiService.request(`/reports/monitors/${id}/logs`),
    getMonitorSummary: (id) => apiService.request(`/reports/monitors/${id}/summary`),
    getChannels: () => apiService.request('/notifications/channels'),
    createChannel: (data) => apiService.request('/notifications/channels', { method: 'POST', body: data }),
    deleteChannel: (id) => apiService.request(`/notifications/channels/${id}`, { method: 'DELETE' }),
    linkChannelsToMonitor: (monitorId, channelIds) => apiService.request(`/notifications/monitors/${monitorId}/channels`, { method: 'PUT', body: { channelIds } }),
};

export default apiService;