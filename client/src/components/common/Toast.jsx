import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);
    const styles = { success: { icon: <CheckCircle />, bg: 'bg-green-600' }, error: { icon: <XCircle />, bg: 'bg-red-600' } };
    return (
        <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white transition-all duration-300 z-50 ${styles[type].bg}`}>
            <div className="mr-3">{styles[type].icon}</div>{message}
        </div>
    );
};

export default Toast;