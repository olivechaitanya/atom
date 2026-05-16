import React, { useState } from 'react';
import { useStore } from '../store';
import { calcWeightedScore, QUARTER_LABELS } from '../data';
import type { Quarter } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

export default function Analytics() {
  const { currentUser, sheets, users } = useStore();
  const [activeQ, setActiveQ] = useState<Quarter>('q2');
  if (!currentUser) return null;

  const quarters: Quarter[] = ['q1', 'q2', 'q3', 'q4'];
  const depts = Array.from(new Set(users.map(u => u.department)));

  // QoQ trend per employee
  const empTrend = sheets.map(s => ({
    name: s.employeeName.split(' ')[0],
    ...Object.fromEntries(quarters.map(q => [QUARTER_LABELS[q], calcWeightedScore(s.goals, q)])),
  }));

  // Department average per quarter
  const deptData = depts.map(dept => {
    const empIds = users.filter(u => u.department === dept && u.role === 'employee').map(u => u.id);
    const deptSheets = sheets.filter(s => empIds.includes(s.employeeId));
    const row: Record<string, string | number> = { dept: dept.slice(0, 8) };
    quarters.forEach(q => {
      row[QUARTER_LABELS[q]] = deptSheets.length ? Math.round(deptSheets.reduce((a, s) => a + calcWeightedScore(s.goals, q), 0) / deptSheets.length) : 0;
    });
    return row;
  });

  // Thrust area distribution
  const thrustMap: Record<string, number> = {};
  sheets.forEach(s => s.goals.forEach(g => { thrustMap[g.thrustArea] = (thrustMap[g.thrustArea] || 0) + 1; }));
  const thrustData = Object.entries(thrustMap).map(([area, count]) => ({ area: area.slice(0, 12), count }));

  // Employee Q score radar
  const radarData = quarters.map(q => {
    const row: Record<string, string | number> = { quarter: QUARTER_LABELS[q] };
    sheets.slice(0, 3).forEach(s => { row[s.employeeName.split(' ')[0]] = calcWeightedScore(s.goals, q); });
    return row;
  });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Quarter-over-quarter trends, department performance, and goal distribution</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* QoQ Line Trend */}
        <div className="card p-6">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>QoQ Score Trends — All Employees</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={radarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              {sheets.slice(0, 3).map((s, i) => (
                <Line key={s.id} type="monotone" dataKey={s.employeeName.split(' ')[0]} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 4, fill: COLORS[i] }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Comparison */}
        <div className="card p-6">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Department Performance by Quarter</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              {quarters.map((q, i) => (
                <Bar key={q} dataKey={QUARTER_LABELS[q]} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Thrust Area Distribution */}
        <div className="card p-6">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Goal Distribution by Thrust Area</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={thrustData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="area" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="url(#thrustGrad)" radius={[0, 4, 4, 0]} />
              <defs>
                <linearGradient id="thrustGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Score Table */}
        <div className="card p-6">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Employee Scores — {QUARTER_LABELS[activeQ]}</h3>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {quarters.map(q => (
              <button key={q} onClick={() => setActiveQ(q)}
                style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${activeQ === q ? 'var(--accent-primary)' : 'var(--border)'}`, background: activeQ === q ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeQ === q ? 'var(--accent-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                {QUARTER_LABELS[q]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...sheets].sort((a, b) => calcWeightedScore(b.goals, activeQ) - calcWeightedScore(a.goals, activeQ)).map((s, i) => {
              const score = calcWeightedScore(s.goals, activeQ);
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>#{i + 1}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.employeeName.slice(0, 2)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s.employeeName}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: score >= 80 ? 'var(--accent-success)' : score >= 50 ? 'var(--accent-warning)' : 'var(--text-muted)' }}>{score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill ${score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red'}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
