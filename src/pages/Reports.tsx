import React, { useState } from 'react';
import { useStore } from '../store';
import { calcProgress, calcWeightedScore, QUARTER_LABELS, UOM_LABELS } from '../data';
import type { Quarter } from '../types';
import { Download, Search, Filter } from 'lucide-react';

export default function Reports() {
  const { sheets, users } = useStore();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [quarter, setQuarter] = useState<Quarter>('q2');
  const [status, setStatus] = useState('');

  const depts = Array.from(new Set(users.map(u => u.department)));

  const filtered = sheets.filter(s => {
    const matchSearch = !search || s.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchDept = !dept || s.department === dept;
    const matchStatus = !status || s.status === status;
    return matchSearch && matchDept && matchStatus;
  });

  const exportCSV = () => {
    const rows = [['Employee', 'Department', 'Status', 'Goals', 'Q1', 'Q2', 'Q3', 'Q4']];
    filtered.forEach(s => {
      rows.push([s.employeeName, s.department, s.status, String(s.goals.length),
        ...(['q1','q2','q3','q4'] as Quarter[]).map(q => String(calcWeightedScore(s.goals, q)) + '%'),
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `goals-report-${quarter}.csv`; a.click();
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Achievement and planned vs actual reports with export</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" value={dept} onChange={e => setDept(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">All Departments</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)} style={{ minWidth: 140 }}>
            <option value="">All Statuses</option>
            {['draft','submitted','approved','rejected','locked'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
          </select>
          <select className="form-select" value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} style={{ minWidth: 140 }}>
            {(Object.keys(QUARTER_LABELS) as Quarter[]).map(q => <option key={q} value={q}>{QUARTER_LABELS[q]}</option>)}
          </select>
        </div>
      </div>

      {/* Report summary cards */}
      <div className="grid grid-4 gap-4 mb-6">
        {[
          { label: 'Total Employees', value: filtered.length, color: '#6366f1' },
          { label: 'Avg Score', value: filtered.length ? Math.round(filtered.reduce((s, sh) => s + calcWeightedScore(sh.goals, quarter), 0) / filtered.length) + '%' : '—', color: '#10b981' },
          { label: 'Approved', value: filtered.filter(s => s.status === 'locked').length, color: '#f59e0b' },
          { label: 'Pending', value: filtered.filter(s => s.status === 'submitted').length, color: '#ef4444' },
        ].map(c => (
          <div key={c.label} className="card stat-card" style={{ borderLeft: `3px solid ${c.color}` }}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color: c.color, fontSize: 24 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main table */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Achievement Report — {QUARTER_LABELS[quarter]}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} records</span>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>Goals</th>
                <th>Q1 Score</th>
                <th>Q2 Score</th>
                <th>Q3 Score</th>
                <th>Q4 Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.employeeName.slice(0, 2)}</div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{s.employeeName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.goals.length} goals</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.department}</span></td>
                  <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                  <td><span style={{ fontWeight: 600 }}>{s.goals.length}</span></td>
                  {(['q1','q2','q3','q4'] as Quarter[]).map(q => {
                    const score = calcWeightedScore(s.goals, q);
                    return (
                      <td key={q}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 50, display: 'inline-block' }}>
                            <div className={`progress-fill ${score >= 80 ? 'green' : score >= 50 ? 'yellow' : score > 0 ? 'red' : ''}`} style={{ width: `${score}%` }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: score >= 80 ? 'var(--accent-success)' : score >= 50 ? 'var(--accent-warning)' : 'var(--text-muted)' }}>
                            {score > 0 ? `${score}%` : '—'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Goal details expandable section */}
        {filtered.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Detailed Goal Breakdown — {quarter.toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.slice(0, 2).map(s => (
                <div key={s.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{s.employeeName}</div>
                  {s.goals.map(g => {
                    const ach = g.achievements.find(a => a.quarter === quarter);
                    const p = calcProgress(g.uomType, g.targetValue, ach?.actualValue, g.targetDate, ach?.status);
                    return (
                      <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)', width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{g.weightage}%</span>
                        <span>T: {g.targetValue?.toLocaleString() || '—'}</span>
                        <span>A: {ach?.actualValue?.toLocaleString() || '—'}</span>
                        <div className="progress-bar" style={{ flex: 1, maxWidth: 100 }}>
                          <div className={`progress-fill ${p >= 80 ? 'green' : p >= 50 ? 'yellow' : 'red'}`} style={{ width: `${p}%` }} />
                        </div>
                        <span style={{ color: p >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 600 }}>{p}%</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
