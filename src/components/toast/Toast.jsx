import { useEffect, useState } from 'react';
import { useToastStore } from '../../stores/toastStore';

export default function Toast({ id, message, type }) {
  const [isExiting, setIsExiting] = useState(false);
  const removeToast = useToastStore((state) => state.removeToast);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(id);
    }, 300); // Match animation duration
  };

  useEffect(() => {
    // Start exit animation before auto-remove
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2700); // Start exiting 300ms before removal

    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'cancel';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-icon">
        <span className="material-symbols-outlined">{getIcon()}</span>
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={handleClose}>
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}