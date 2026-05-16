import React, { useState } from 'react';
import { useStore } from '../store';
import { DEMO_ESCALATIONS, DEMO_AUDIT_LOGS } from '../data';
import { Users, Lock, Unlock, Settings, AlertTriangle, Clock, Shield, Activity, ChevronRight } from 'lucide-react';

export default function AdminPanel() {
  const { currentUser, users, sheets, auditLogs, unlockSheet, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cycles' | 'audit' | 'escalations'>('overview');
  if (!currentUser || currentUser.role !== 'admin') return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Access denied.</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'cycles', label: 'Cycles', icon: Settings },
    { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
  ] as const;

  const escalationColors = ['var(--accent-warning)', 'var(--accent-danger)', 'var(--accent-danger)'];
  const escalationLabels = { not_submitted: 'Not Submitted', approval_pending: 'Approval Pending', checkin_overdue: 'Check-in Overdue' };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Panel</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Organization management, audit logs, and system configuration</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content', flexWrap: 'wrap' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', background: activeTab === t.id ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))' : 'transparent', color: activeTab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: activeTab === t.id ? 600 : 400, fontSize: 13, transition: 'all 0.15s' }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: users.length, color: '#6366f1' },
              { label: 'Active Sheets', value: sheets.length, color: '#10b981' },
              { label: 'Escalations', value: DEMO_ESCALATIONS.filter(e => !e.resolved).length, color: '#ef4444' },
              { label: 'Audit Events', value: auditLogs.length, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="card stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-2 gap-4">
            <div className="card p-6">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Goal Cycle — FY 2025–26</h3>
              {[
                { phase: 'Goal Setting', deadline: 'May 1, 2025', done: true },
                { phase: 'Q1 Check-in', deadline: 'Jul 31, 2025', done: true },
                { phase: 'Q2 Check-in', deadline: 'Oct 31, 2025', done: false },
                { phase: 'Q3 Check-in', deadline: 'Jan 31, 2026', done: false },
                { phase: 'Q4/Annual', deadline: 'Apr 30, 2026', done: false },
              ].map(p => (
                <div key={p.phase} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: p.done ? 'var(--accent-success)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', flexShrink: 0 }}>{p.done ? '✓' : ''}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: p.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{p.phase}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.deadline}</div>
                  </div>
                  {!p.done && <span style={{ fontSize: 11, color: 'var(--accent-warning)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4 }}>Upcoming</span>}
                </div>
              ))}
            </div>
            <div className="card p-6">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Audit Events</h3>
              {auditLogs.slice(0, 5).map(l => (
                <div key={l.id} style={{ display: 'flex', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.action === 'approve' ? 'var(--accent-success)' : l.action === 'reject' ? 'var(--accent-danger)' : 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}><span style={{ color: 'var(--accent-primary)' }}>{l.actorName}</span> {l.action}d {l.entityType.replace('_', ' ')}</div>
                    {l.fieldName && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.fieldName}: {l.oldValue} → {l.newValue}</div>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(l.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>User Management</span>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('info', 'User creation form coming soon!')}><Users size={13} /> Add User</button>
          </div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Manager</th><th>Status</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>{u.avatar || u.name.slice(0,2)}</div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</span>
                    </div></td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</span></td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-rejected' : u.role === 'manager' ? 'badge-locked' : 'badge-approved'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td><span style={{ fontSize: 13 }}>{u.department}</span></td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.managerName || '—'}</span></td>
                    <td><span className="badge badge-approved">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cycles */}
      {activeTab === 'cycles' && (
        <div>
          <div className="card p-6 mb-4">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Current Cycle Configuration</h3>
            <div className="grid grid-2 gap-4">
              {[
                { label: 'Cycle Name', value: 'FY 2025–26' },
                { label: 'Phase', value: 'Q2 Check-in', highlight: true },
                { label: 'Start Date', value: 'April 1, 2025' },
                { label: 'End Date', value: 'March 31, 2026' },
                { label: 'Goal Setting Deadline', value: 'May 1, 2025' },
                { label: 'Q2 Check-in Deadline', value: 'October 31, 2025' },
              ].map(f => (
                <div key={f.label} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: f.highlight ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{f.value}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => showToast('info', 'Cycle editor coming soon!')}><Settings size={13} /> Edit Cycle</button>
          </div>
          <div className="card p-6">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Locked Goal Sheets — Admin Unlock</h3>
            {sheets.filter(s => s.status === 'locked').map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{s.employeeName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Approved by {s.approvedBy} · {s.goals.length} goals</div>
                </div>
                <button className="btn btn-secondary btn-xs" onClick={() => unlockSheet(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Unlock size={12} /> Unlock
                </button>
              </div>
            ))}
            {sheets.filter(s => s.status === 'locked').length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No locked sheets.</p>}
          </div>
        </div>
      )}

      {/* Escalations */}
      {activeTab === 'escalations' && (
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600 }}>Active Escalations</span>
            <span style={{ fontSize: 12, color: 'var(--accent-danger)', marginLeft: 8, background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 10 }}>{DEMO_ESCALATIONS.filter(e => !e.resolved).length} active</span>
          </div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>Employee</th><th>Department</th><th>Type</th><th>Level</th><th>Days Overdue</th><th>Action</th></tr></thead>
              <tbody>
                {DEMO_ESCALATIONS.map(e => (
                  <tr key={e.id}>
                    <td><span style={{ fontWeight: 500, fontSize: 13 }}>{e.employeeName}</span></td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.department}</span></td>
                    <td><span style={{ fontSize: 12, color: escalationColors[e.level - 1] }}>{escalationLabels[e.type as keyof typeof escalationLabels]}</span></td>
                    <td>
                      <span style={{ background: `${escalationColors[e.level - 1]}20`, color: escalationColors[e.level - 1], padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                        {e.level === 1 ? 'Manager' : e.level === 2 ? 'Skip-Level' : 'HR'}
                      </span>
                    </td>
                    <td><span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>{e.daysOverdue}d</span></td>
                    <td><button className="btn btn-xs btn-secondary" onClick={() => showToast('success', 'Escalation resolved!')} style={{ fontSize: 12 }}>Resolve</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {activeTab === 'audit' && (
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600 }}>Immutable Audit Trail</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{auditLogs.length} events</span>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {auditLogs.map((l, i) => (
              <div key={l.id} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.action === 'approve' ? 'var(--accent-success)' : l.action === 'reject' ? 'var(--accent-danger)' : l.action === 'unlock' ? 'var(--accent-warning)' : 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      <span style={{ color: 'var(--accent-primary)' }}>{l.actorName}</span>
                      {' '}<span style={{ color: 'var(--text-muted)' }}>performed</span>{' '}
                      <span style={{ color: l.action === 'approve' ? 'var(--accent-success)' : l.action === 'reject' ? 'var(--accent-danger)' : 'var(--text-primary)', fontWeight: 600 }}>{l.action.toUpperCase()}</span>
                      {' '}<span style={{ color: 'var(--text-muted)' }}>on</span>{' '}
                      <span>{l.entityType.replace('_', ' ')}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 12 }}>{new Date(l.createdAt).toLocaleString()}</span>
                  </div>
                  {l.fieldName && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 4, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {l.fieldName}: <span style={{ color: 'var(--accent-danger)', textDecoration: 'line-through' }}>{l.oldValue}</span>
                      <ChevronRight size={10} />
                      <span style={{ color: 'var(--accent-success)' }}>{l.newValue}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
