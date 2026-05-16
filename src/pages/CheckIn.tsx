import React, { useState } from 'react';
import { useStore } from '../store';
import { calcProgress, calcWeightedScore, QUARTER_LABELS, UOM_LABELS } from '../data';
import type { Quarter, AchievementStatus } from '../types';
import { Save, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS: { value: AchievementStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started', color: '#475569' },
  { value: 'on_track', label: 'On Track', color: '#10b981' },
  { value: 'completed', label: 'Completed', color: '#6366f1' },
];

export default function CheckIn() {
  const { currentUser, sheets, updateAchievement } = useStore();
  const [activeQuarter, setActiveQuarter] = useState<Quarter>('q2');
  const [edits, setEdits] = useState<Record<string, { actualValue: string; status: AchievementStatus; notes: string }>>({});

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager';
  const mySheet = sheets.find(s => s.employeeId === currentUser.id);
  const teamSheets = isManager ? sheets.filter(s => {
    const emp = useStore.getState().users.find(u => u.id === s.employeeId);
    return emp?.managerId === currentUser.id;
  }) : [];

  const viewSheets = isManager ? teamSheets : (mySheet ? [mySheet] : []);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const activeSheet = viewSheets.find(s => s.id === (selectedSheet || viewSheets[0]?.id));

  const getEdit = (goalId: string, defaultActual?: number, defaultStatus?: AchievementStatus, defaultNotes?: string) =>
    edits[`${goalId}-${activeQuarter}`] || { actualValue: defaultActual?.toString() || '', status: defaultStatus || 'not_started', notes: defaultNotes || '' };

  const setEdit = (goalId: string, field: string, value: string) =>
    setEdits(e => ({ ...e, [`${goalId}-${activeQuarter}`]: { ...getEdit(goalId), [field]: value } }));

  const handleSave = (goalId: string, ach: { actualValue?: number; status: AchievementStatus; notes?: string }) => {
    const edit = getEdit(goalId, ach.actualValue, ach.status, ach.notes);
    updateAchievement(goalId, activeQuarter, edit.actualValue ? Number(edit.actualValue) : undefined, edit.status, edit.notes);
  };

  if (viewSheets.length === 0) return (
    <div className="animate-fade" style={{ textAlign: 'center', padding: 60 }}>
      <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
      <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No Approved Goals</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Check-ins are only available after goals are approved by your manager.</p>
    </div>
  );

  const overallScore = activeSheet ? calcWeightedScore(activeSheet.goals, activeQuarter) : 0;

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Quarterly Check-ins</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Track and update achievement progress per quarter</p>
      </div>

      {/* Quarter selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(Object.keys(QUARTER_LABELS) as Quarter[]).map(q => (
          <button key={q} onClick={() => setActiveQuarter(q)}
            style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${activeQuarter === q ? 'var(--accent-primary)' : 'var(--border)'}`, background: activeQuarter === q ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeQuarter === q ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: activeQuarter === q ? 600 : 400, transition: 'all 0.2s' }}>
            {QUARTER_LABELS[q]}
          </button>
        ))}
      </div>

      {/* Manager: employee selector */}
      {isManager && viewSheets.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {viewSheets.map(s => (
            <button key={s.id} onClick={() => setSelectedSheet(s.id)}
              style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${(selectedSheet || viewSheets[0]?.id) === s.id ? 'var(--accent-primary)' : 'var(--border)'}`, background: (selectedSheet || viewSheets[0]?.id) === s.id ? 'rgba(99,102,241,0.15)' : 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
              {s.employeeName}
            </button>
          ))}
        </div>
      )}

      {/* Score card */}
      {activeSheet && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: overallScore >= 80 ? 'var(--accent-success)' : overallScore >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>{overallScore}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Weighted Score</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{QUARTER_LABELS[activeQuarter]} Achievement Score — {activeSheet.employeeName}</div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className={`progress-fill ${overallScore >= 80 ? 'green' : overallScore >= 50 ? 'yellow' : 'red'}`} style={{ width: `${overallScore}%` }} />
            </div>
          </div>
          {overallScore >= 80 && <CheckCircle size={24} color="var(--accent-success)" />}
          {overallScore < 50 && overallScore > 0 && <AlertCircle size={24} color="var(--accent-danger)" />}
        </div>
      )}

      {/* Goals check-in */}
      {activeSheet && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeSheet.goals.map(g => {
            const ach = g.achievements.find(a => a.quarter === activeQuarter);
            if (!ach) return null;
            const edit = getEdit(g.id, ach.actualValue, ach.status, ach.notes);
            const progress = calcProgress(g.uomType, g.targetValue, edit.actualValue ? Number(edit.actualValue) : ach.actualValue, g.targetDate, edit.status as AchievementStatus);
            const isEditable = !ach.isLocked && !isManager;

            return (
              <div key={g.id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--accent-tertiary)', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: 4 }}>{g.thrustArea}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>{UOM_LABELS[g.uomType]}</span>
                      <span style={{ fontSize: 11, color: 'var(--accent-primary)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 4 }}>{g.weightage}% weight</span>
                      {ach.isLocked && <span style={{ fontSize: 11, color: 'var(--accent-warning)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4 }}>LOCKED</span>}
                    </div>
                    <h4 style={{ fontWeight: 600, fontSize: 15 }}>{g.title}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: progress >= 80 ? 'var(--accent-success)' : progress >= 50 ? 'var(--accent-warning)' : 'var(--text-muted)' }}>{progress}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>progress</div>
                  </div>
                </div>

                <div className="progress-bar" style={{ marginBottom: 20 }}>
                  <div className={`progress-fill ${progress >= 80 ? 'green' : progress >= 50 ? 'yellow' : 'red'}`} style={{ width: `${progress}%` }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {/* Target */}
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      {g.uomType === 'timeline' ? (g.targetDate ? new Date(g.targetDate).toLocaleDateString() : '—') :
                       g.uomType === 'zero_based' ? '0' :
                       `${(g.targetValue || 0).toLocaleString()}${g.uomType === 'percentage' ? '%' : ''}`}
                    </div>
                  </div>

                  {/* Actual */}
                  {g.uomType !== 'timeline' && g.uomType !== 'zero_based' ? (
                    <div className="form-group">
                      <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Actual {QUARTER_LABELS[activeQuarter]}</label>
                      <input className="form-input" type="number" value={edit.actualValue} onChange={e => setEdit(g.id, 'actualValue', e.target.value)} disabled={!isEditable} style={{ opacity: isEditable ? 1 : 0.6 }} />
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Actual</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{g.uomType === 'zero_based' ? 'Auto-calculated' : 'Based on status'}</div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="form-group">
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Status</label>
                    <select className="form-select" value={edit.status} onChange={e => setEdit(g.id, 'status', e.target.value)} disabled={!isEditable} style={{ opacity: isEditable ? 1 : 0.6 }}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Notes / Comments</label>
                  <textarea className="form-textarea" value={edit.notes} onChange={e => setEdit(g.id, 'notes', e.target.value)} placeholder="Describe what was achieved, blockers, next steps…" disabled={!isEditable} style={{ minHeight: 60, opacity: isEditable ? 1 : 0.6 }} />
                </div>

                {isEditable && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSave(g.id, ach)}>
                      <Save size={13} /> Save Achievement
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
