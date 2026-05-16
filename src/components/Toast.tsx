import React from 'react';
import { useStore } from '../store';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <CheckCircle size={16} color="var(--accent-success)" />}
          {t.type === 'error' && <XCircle size={16} color="var(--accent-danger)" />}
          {t.type === 'info' && <Info size={16} color="var(--accent-info)" />}
          <span style={{ flex: 1, fontSize: 13 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
