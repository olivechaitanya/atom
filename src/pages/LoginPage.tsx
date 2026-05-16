import React, { useState } from 'react';
import { useStore } from '../store';

const DEMO_CREDS = [
  { label: 'Admin / HR', email: 'admin@atomquest.com', role: 'Admin' },
  { label: 'Manager — Sarah', email: 'sarah.mgr@atomquest.com', role: 'Manager' },
  { label: 'Employee — John', email: 'john.emp@atomquest.com', role: 'Employee' },
  { label: 'Employee — Jane', email: 'jane.emp@atomquest.com', role: 'Employee' },
  { label: 'Employee — Raj', email: 'raj.emp@atomquest.com', role: 'Employee' },
];

export default function LoginPage() {
  const login = useStore(s => s.login);
  const showToast = useStore(s => s.showToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email.trim(), password);
    if (!ok) showToast('error', 'Invalid email. Use one of the demo accounts below.');
    setLoading(false);
  };

  const quickLogin = async (e: string) => {
    setLoading(true);
    await login(e, 'demo123');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-900)', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        {/* Left — Branding */}
        <div className="animate-slide" style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif' }}>A</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>AtomQuest</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>HACKATHON 1.0</div>
            </div>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1.1, marginBottom: 16 }}>
            In-House Goal<br />
            <span className="gradient-text">Setting & Tracking</span><br />
            Portal
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
            Digitize your entire employee goal lifecycle — from creation and alignment to quarterly tracking and performance analytics.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['✓ Real-time weightage validation', '✓ Manager approval workflow', '✓ Quarterly achievement tracking', '✓ Progress score calculation engine', '✓ Audit trail & governance'].map(f => (
              <div key={f} style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--accent-success)' }}>{f.slice(0,1)}</span>{f.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login form */}
        <div className="animate-fade">
          <div className="card" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Sign In</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>Enter your email to access the portal</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your.name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: 'center', padding: '12px 20px' }}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <div className="divider" style={{ margin: '24px 0' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>Quick Demo Login</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_CREDS.map(c => (
                <button key={c.email} onClick={() => quickLogin(c.email)} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-primary)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'; (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 600, background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 4 }}>{c.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout fix */}
      <style>{`@media(max-width:768px){.login-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
