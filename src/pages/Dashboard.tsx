import React from 'react';
import { useStore } from '../store';
import { calcProgress, calcWeightedScore, QUARTER_LABELS } from '../data';

import { Target, TrendingUp, CheckCircle, Clock, AlertTriangle, Users, Award, Activity } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

function ProgressRing({ value, size = 80, color = '#6366f1' }: { value: number; size?: number; color?: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8} strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x={size/2} y={size/2} dominantBaseline="middle" textAnchor="middle" fill="#f1f5f9" fontSize={14} fontWeight={700} style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>{value}%</text>
    </svg>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div className="card stat-card" style={{ background: 'var(--bg-glass)', borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color }}>{value}</div>
          {sub && <div className="stat-sub">{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, sheets, users } = useStore();
  if (!currentUser) return null;

  const mySheet = sheets.find(s => s.employeeId === currentUser.id);
  const teamSheets = sheets.filter(s => {
    const emp = users.find(u => u.id === s.employeeId);
    return emp?.managerId === currentUser.id;
  });
  const allSheets = sheets;

  const quarters = ['q1','q2','q3','q4'] as const;

  // Score data for charts
  const trendData = quarters.map(q => {
    const label = QUARTER_LABELS[q];
    if (currentUser.role === 'employee' && mySheet) {
      return { quarter: label, score: calcWeightedScore(mySheet.goals, q) };
    }
    if (currentUser.role === 'manager') {
      const avg = teamSheets.length ? Math.round(teamSheets.reduce((s, sh) => s + calcWeightedScore(sh.goals, q), 0) / teamSheets.length) : 0;
      return { quarter: label, score: avg };
    }
    const avg = allSheets.length ? Math.round(allSheets.reduce((s, sh) => s + calcWeightedScore(sh.goals, q), 0) / allSheets.length) : 0;
    return { quarter: label, score: avg };
  });

  // Role-specific content
  if (currentUser.role === 'employee') {
    const approvedGoals = mySheet?.goals.length || 0;
    const score = mySheet ? calcWeightedScore(mySheet.goals, 'q2') : 0;
    const statusColor = (s?: string) => s === 'approved' || s === 'locked' ? 'var(--accent-success)' : s === 'submitted' ? 'var(--accent-info)' : s === 'rejected' ? 'var(--accent-danger)' : 'var(--text-muted)';

    return (
      <div className="animate-fade">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Welcome back, {currentUser.name.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>FY 2025–26 · {currentUser.department}</p>
        </div>

        <div className="grid grid-4 gap-4 mb-6">
          <StatCard label="Goals Set" value={approvedGoals} sub={`of 8 max`} color="#6366f1" icon={Target} />
          <StatCard label="Q2 Score" value={`${score}%`} sub="Weighted" color="#10b981" icon={TrendingUp} />
          <StatCard label="Sheet Status" value={mySheet?.status || 'No Sheet'} sub={mySheet?.submittedAt ? 'Submitted' : 'Draft'} color={statusColor(mySheet?.status)} icon={CheckCircle} />
          <StatCard label="Goals Approved" value={mySheet?.status === 'locked' || mySheet?.status === 'approved' ? approvedGoals : 0} sub="Locked & finalized" color="#f59e0b" icon={Award} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Progress Ring + Goals */}
          <div className="card p-6">
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Q2 Overall Progress</h3>
            {mySheet ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <ProgressRing value={score} size={100} color={score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'} />
                <div style={{ flex: 1 }}>
                  {mySheet.goals.slice(0,3).map(g => {
                    const ach = g.achievements.find(a => a.quarter === 'q2');
                    const p = calcProgress(g.uomType, g.targetValue, ach?.actualValue, g.targetDate, ach?.status);
                    return (
                      <div key={g.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                          <span style={{ fontWeight: 600, color: p >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>{p}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className={`progress-fill ${p >= 80 ? 'green' : p >= 50 ? 'yellow' : 'red'}`} style={{ width: `${p}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <Target size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>No goals set yet</p>
              </div>
            )}
          </div>

          {/* Trend chart */}
          <div className="card p-6">
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Quarterly Score Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trendData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="score" fill="url(#scoreGrad)" radius={[4,4,0,0]} />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals table */}
        {mySheet && (
          <div className="card mt-6">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 600 }}>My Goals — FY 2025–26</h3>
            </div>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr><th>Goal</th><th>Thrust Area</th><th>Weightage</th><th>Q1</th><th>Q2</th><th>Status</th></tr></thead>
                <tbody>
                  {mySheet.goals.map(g => {
                    const q1 = g.achievements.find(a => a.quarter === 'q1');
                    const q2 = g.achievements.find(a => a.quarter === 'q2');
                    const p1 = calcProgress(g.uomType, g.targetValue, q1?.actualValue, g.targetDate, q1?.status);
                    const p2 = calcProgress(g.uomType, g.targetValue, q2?.actualValue, g.targetDate, q2?.status);
                    return (
                      <tr key={g.id}>
                        <td><div style={{ fontWeight: 500, fontSize: 13 }}>{g.title}</div>{g.isShared && <span style={{ fontSize: 10, color: 'var(--accent-tertiary)', background: 'rgba(6,182,212,0.1)', padding: '1px 6px', borderRadius: 4 }}>SHARED</span>}</td>
                        <td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.thrustArea}</span></td>
                        <td><span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{g.weightage}%</span></td>
                        <td>{q1?.status !== 'not_started' ? <span style={{ color: p1 >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 600 }}>{p1}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>{q2?.status !== 'not_started' ? <span style={{ color: p2 >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)', fontWeight: 600 }}>{p2}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td><span className={`badge badge-${q2?.status || 'not_started'}`}>{q2?.status?.replace('_',' ') || 'Not Started'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Manager Dashboard
  if (currentUser.role === 'manager') {
    const approved = teamSheets.filter(s => s.status === 'locked' || s.status === 'approved').length;
    const pending = teamSheets.filter(s => s.status === 'submitted').length;
    const draft = teamSheets.filter(s => s.status === 'draft').length;
    return (
      <div className="animate-fade">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Manager Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Team overview · FY 2025–26 · {currentUser.department}</p>
        </div>
        <div className="grid grid-4 gap-4 mb-6">
          <StatCard label="Team Size" value={teamSheets.length} sub="Direct reports" color="#6366f1" icon={Users} />
          <StatCard label="Approved" value={approved} sub="Sheets locked" color="#10b981" icon={CheckCircle} />
          <StatCard label="Pending Review" value={pending} sub="Awaiting approval" color="#f59e0b" icon={Clock} />
          <StatCard label="Not Submitted" value={draft} sub="Draft/not submitted" color="#ef4444" icon={AlertTriangle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card p-6">
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Team Q2 Scores</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teamSheets.map(s => ({ name: s.employeeName.split(' ')[0], score: calcWeightedScore(s.goals, 'q2') }))} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="score" fill="url(#teamGrad)" radius={[4,4,0,0]} />
                <defs><linearGradient id="teamGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Team Status</h3>
            {teamSheets.map(s => {
              const score = calcWeightedScore(s.goals, 'q2');
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.employeeName.slice(0,2)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s.employeeName}</span>
                      <span className={`badge badge-${s.status}`}>{s.status}</span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill ${score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'blue'}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', width: 36, textAlign: 'right' }}>{score}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const totalEmps = users.filter(u => u.role === 'employee').length;
  const totalApproved = allSheets.filter(s => s.status === 'locked' || s.status === 'approved').length;
  const totalPending = allSheets.filter(s => s.status === 'submitted').length;
  const completionRate = allSheets.length ? Math.round((totalApproved / allSheets.length) * 100) : 0;
  const deptData = Array.from(new Set(users.map(u => u.department))).map(dept => {
    const empIds = users.filter(u => u.department === dept && u.role === 'employee').map(u => u.id);
    const deptSheets = allSheets.filter(s => empIds.includes(s.employeeId));
    const approved = deptSheets.filter(s => s.status === 'locked').length;
    return { dept: dept.slice(0,7), total: deptSheets.length, approved };
  });

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Organization overview · FY 2025–26</p>
      </div>
      <div className="grid grid-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={totalEmps} sub="Active" color="#6366f1" icon={Users} />
        <StatCard label="Sheets Approved" value={totalApproved} sub={`of ${allSheets.length} total`} color="#10b981" icon={CheckCircle} />
        <StatCard label="Pending Approval" value={totalPending} sub="Awaiting review" color="#f59e0b" icon={Clock} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} sub="Goal setting phase" color="#06b6d4" icon={Activity} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card p-6">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Department Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="total" name="Total" fill="rgba(99,102,241,0.4)" radius={[4,4,0,0]} />
              <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Overall Completion</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <ProgressRing value={completionRate} size={120} color="#6366f1" />
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{totalApproved} of {allSheets.length} employees completed goal setting</p>
            {[{label:'Approved/Locked', count: totalApproved, color:'var(--accent-success)'},{label:'Pending', count: totalPending, color:'var(--accent-warning)'},{label:'Draft', count: allSheets.filter(s=>s.status==='draft').length, color:'var(--text-muted)'}].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: r.color }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
