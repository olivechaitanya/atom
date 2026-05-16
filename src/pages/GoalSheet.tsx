import { useState } from 'react';
import { useStore } from '../store';
import { validateWeightage, UOM_LABELS, DEMO_CYCLE } from '../data';
import type { Goal, GoalStatus, UoMType } from '../types';
import { Plus, Trash2, Edit2, Lock, Send, RotateCcw, Check, X, MessageSquare, AlertCircle } from 'lucide-react';

const THRUST_AREAS = ['Product Quality', 'Delivery', 'Learning & Development', 'Cost Management', 'Revenue', 'Customer', 'Innovation', 'People & Culture', 'Process Improvement', 'Compliance'];

function GoalForm({ sheetId, goal, onClose }: { sheetId: string; goal?: Goal; onClose: () => void }) {
  const { addGoalToSheet, updateGoal, showToast } = useStore();
  const [form, setForm] = useState({
    thrustArea: goal?.thrustArea || '',
    title: goal?.title || '',
    description: goal?.description || '',
    uomType: (goal?.uomType || 'numeric') as UoMType,
    targetValue: goal?.targetValue?.toString() || '',
    targetDate: goal?.targetDate || '',
    weightage: goal?.weightage?.toString() || '',
  });

  const handleSave = async () => {
    if (!form.thrustArea || !form.title || !form.weightage) { showToast('error', 'Please fill all required fields'); return; }
    const w = Number(form.weightage);
    if (w < 10 || w > 100) { showToast('error', 'Weightage must be between 10% and 100%'); return; }
    const data = {
      sheetId,
      thrustArea: form.thrustArea, title: form.title, description: form.description,
      uomType: form.uomType, targetValue: form.targetValue ? Number(form.targetValue) : undefined,
      targetDate: form.targetDate || undefined, weightage: w, isShared: false, isReadonly: false,
    };
    if (goal) { await updateGoal(sheetId, goal.id, data); showToast('success', 'Goal updated!'); }
    else { await addGoalToSheet(sheetId, data); showToast('success', 'Goal added!'); }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{goal ? 'Edit Goal' : 'Add New Goal'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Thrust Area *</label>
              <select className="form-select" value={form.thrustArea} onChange={e => setForm(f => ({ ...f, thrustArea: e.target.value }))}>
                <option value="">Select area…</option>
                {THRUST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">UoM Type *</label>
              <select className="form-select" value={form.uomType} onChange={e => setForm(f => ({ ...f, uomType: e.target.value as UoMType }))}>
                {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter a clear, measurable goal title…" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe how this goal will be measured and achieved…" />
          </div>
          <div className="grid grid-2 gap-4">
            {form.uomType !== 'timeline' && form.uomType !== 'zero_based' && (
              <div className="form-group">
                <label className="form-label">Target Value *</label>
                <input className="form-input" type="number" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} placeholder={form.uomType === 'percentage' ? 'e.g. 95' : 'e.g. 1000000'} />
              </div>
            )}
            {form.uomType === 'timeline' && (
              <div className="form-group">
                <label className="form-label">Target Date *</label>
                <input className="form-input" type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Weightage (%) * <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>min 10%</span></label>
              <input className="form-input" type="number" min={10} max={100} value={form.weightage} onChange={e => setForm(f => ({ ...f, weightage: e.target.value }))} placeholder="e.g. 25" />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}><Check size={14} /> Save Goal</button>
        </div>
      </div>
    </div>
  );
}

function CommentBox({ sheetId }: { sheetId: string }) {
  const { currentUser, sheets, addComment } = useStore();
  const [text, setText] = useState('');
  const sheet = sheets.find(s => s.id === sheetId);
  if (!sheet || !currentUser) return null;
  const send = () => {
    if (!text.trim()) return;
    addComment(sheetId, currentUser.id, currentUser.name, text.trim());
    setText('');
  };
  return (
    <div className="card mt-6">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={15} color="var(--accent-primary)" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Comments & Discussion</span>
      </div>
      <div style={{ padding: '12px 20px' }}>
        {sheet.comments.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 0' }}>No comments yet.</p>
          : sheet.comments.map(c => (
            <div key={c.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>{c.authorName.slice(0, 2)}</div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.authorName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 34 }}>{c.content}</p>
            </div>
          ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="form-input" value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment…" onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={send} disabled={!text.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default function GoalSheet() {
  // All hooks at the top — no conditional hook calls
  const { currentUser, sheets, submitSheet, approveSheet, rejectSheet, unlockSheet, deleteGoal, showToast, users } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | undefined>();
  const [rejectComment, setRejectComment] = useState('');
  const [showReject, setShowReject] = useState<string | null>(null);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

  if (!currentUser) return null;

  const isManager = currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  const mySheet = sheets.find(s => s.employeeId === currentUser.id);

  const teamSheets = sheets.filter(s => {
    const emp = users.find(u => u.id === s.employeeId);
    return emp?.managerId === currentUser.id;
  });

  const activeSheet = (isManager || isAdmin)
    ? (selectedSheetId ? sheets.find(s => s.id === selectedSheetId) : (isManager ? teamSheets[0] : sheets[0]))
    : mySheet;

  const isLocked = activeSheet?.status === 'locked';
  const canEdit = !isLocked && activeSheet?.status !== 'submitted' && (activeSheet?.employeeId === currentUser.id || isAdmin);

  const createSheet = () => {
    useStore.setState(s => ({
      sheets: [...s.sheets, {
        id: `gs_${Date.now()}`, employeeId: currentUser.id, employeeName: currentUser.name,
        department: currentUser.department, cycleId: DEMO_CYCLE.id, status: 'draft' as GoalStatus,
        version: 1, goals: [], comments: [],
      }],
    }));
  };

  const validation = activeSheet ? validateWeightage(activeSheet.goals) : { valid: false, total: 0, errors: [] };
  const canSubmit = !!(activeSheet && activeSheet.status === 'draft' && validation.valid && activeSheet.goals.length > 0);

  const handleSubmit = async () => { if (activeSheet) await submitSheet(activeSheet.id); };
  const handleApprove = async () => { if (activeSheet) await approveSheet(activeSheet.id,currentUser.id); };
  const handleReject = async () => {
    if (!activeSheet || !rejectComment.trim()) { showToast('error', 'Please enter a rejection reason'); return; }
    rejectSheet(activeSheet.id, rejectComment);
    setShowReject(null);
    setRejectComment('');
  };

  const displaySheets = isManager ? teamSheets : sheets;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {isManager || isAdmin ? 'Goal Sheets' : 'My Goal Sheet'} — FY 2025–26
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {isManager ? 'Review and approve team goal sheets' : isAdmin ? 'All employee goal sheets' : `${currentUser.department} · ${activeSheet ? 'Edit your goals before submission' : 'Create your goal sheet to get started'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isManager && !isAdmin && activeSheet && canEdit && activeSheet.goals.length < 8 && (
            <button className="btn btn-primary" onClick={() => { setEditGoal(undefined); setShowForm(true); }}>
              <Plus size={15} /> Add Goal
            </button>
          )}
          {!isManager && !isAdmin && activeSheet && canEdit && (
            <button className="btn btn-success" disabled={!canSubmit} onClick={handleSubmit} title={!canSubmit ? validation.errors.join(', ') : ''}>
              <Send size={14} /> Submit
            </button>
          )}
          {(isManager || isAdmin) && activeSheet?.status === 'submitted' && (
            <>
              <button className="btn btn-success btn-sm" onClick={handleApprove}><Check size={14} /> Approve</button>
              <button className="btn btn-danger btn-sm" onClick={() => setShowReject(activeSheet.id)}><X size={14} /> Reject</button>
            </>
          )}
          {isAdmin && activeSheet?.status === 'locked' && (
            <button className="btn btn-secondary btn-sm" onClick={() => unlockSheet(activeSheet.id)}><RotateCcw size={14} /> Unlock</button>
          )}
        </div>
      </div>

      {/* Sheet selector for manager/admin */}
      {(isManager || isAdmin) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {displaySheets.map(s => {
            const isActive = selectedSheetId === s.id || (!selectedSheetId && displaySheets[0]?.id === s.id);
            return (
              <button key={s.id} onClick={() => setSelectedSheetId(s.id)}
                style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border)'}`, background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {s.employeeName} <span className={`badge badge-${s.status}`}>{s.status}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* No sheet empty state */}
      {!activeSheet && !isManager && !isAdmin && (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Plus size={28} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No Goal Sheet Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Create your goal sheet to start setting goals for FY 2025–26</p>
          <button className="btn btn-primary" onClick={createSheet} style={{ margin: '0 auto' }}>Create Goal Sheet</button>
        </div>
      )}

      {activeSheet && (
        <>
          {/* Status banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, marginBottom: 20, background: activeSheet.status === 'locked' ? 'rgba(245,158,11,0.1)' : activeSheet.status === 'rejected' ? 'rgba(239,68,68,0.1)' : activeSheet.status === 'submitted' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeSheet.status === 'locked' ? 'rgba(245,158,11,0.3)' : activeSheet.status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` }}>
            {activeSheet.status === 'locked' && <Lock size={15} color="var(--accent-warning)" />}
            {activeSheet.status === 'submitted' && <Send size={15} color="var(--accent-info)" />}
            {activeSheet.status === 'rejected' && <AlertCircle size={15} color="var(--accent-danger)" />}
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {activeSheet.status === 'locked' ? `Approved by ${activeSheet.approvedBy} on ${new Date(activeSheet.approvedAt!).toLocaleDateString()}` :
               activeSheet.status === 'submitted' ? `Submitted ${new Date(activeSheet.submittedAt!).toLocaleDateString()} — Awaiting review` :
               activeSheet.status === 'rejected' ? 'Returned for rework — See comments below' :
               'Draft — Add goals then submit before the deadline'}
            </span>
            <span className={`badge badge-${activeSheet.status}`} style={{ marginLeft: 'auto' }}>{activeSheet.status}</span>
          </div>

          {/* Weightage meter (draft only) */}
          {(canEdit || activeSheet.status === 'draft') && (
            <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Total Weightage</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: validation.total === 100 ? 'var(--accent-success)' : validation.total > 100 ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>{validation.total}%</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ 100%</span>
                  {validation.total === 100 && <Check size={16} color="var(--accent-success)" />}
                </div>
              </div>
              <div className="weightage-meter">
                <div className={`weightage-fill ${validation.total === 100 ? 'valid' : validation.total > 100 ? 'over' : 'under'}`} style={{ width: `${Math.min(validation.total, 100)}%` }} />
              </div>
              {validation.errors.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {validation.errors.map((e, i) => <span key={i} style={{ fontSize: 12, color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> {e}</span>)}
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>✓ Min 10% per goal</span><span>✓ Max 8 goals</span><span>✓ Total = 100%</span>
                <span style={{ marginLeft: 'auto' }}>{activeSheet.goals.length}/8 goals</span>
              </div>
            </div>
          )}

          {/* Goals list */}
          {activeSheet.goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 14 }}>No goals added yet. Click "Add Goal" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeSheet.goals.map((g, idx) => (
                <div key={g.id} className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>#{idx + 1}</span>
                        <span style={{ fontSize: 11, color: 'var(--accent-tertiary)', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: 4 }}>{g.thrustArea}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>{UOM_LABELS[g.uomType]}</span>
                        {g.isShared && <span style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 4 }}>SHARED</span>}
                        {g.isReadonly && <span style={{ fontSize: 11, color: 'var(--accent-danger)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 4 }}>READ-ONLY</span>}
                      </div>
                      <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{g.title}</h4>
                      {g.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{g.description}</p>}
                      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 13, flexWrap: 'wrap' }}>
                        {g.targetValue !== undefined && <span style={{ color: 'var(--text-muted)' }}>Target: <strong style={{ color: 'var(--text-primary)' }}>{g.targetValue.toLocaleString()}{g.uomType === 'percentage' ? '%' : ''}</strong></span>}
                        {g.targetDate && <span style={{ color: 'var(--text-muted)' }}>Deadline: <strong style={{ color: 'var(--text-primary)' }}>{new Date(g.targetDate).toLocaleDateString()}</strong></span>}
                        <span style={{ color: 'var(--text-muted)' }}>Weightage: <strong style={{ color: 'var(--accent-primary)' }}>{g.weightage}%</strong></span>
                      </div>
                    </div>
                    {canEdit && !g.isReadonly && (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button className="btn btn-secondary btn-xs" onClick={() => { setEditGoal(g); setShowForm(true); }}><Edit2 size={12} /></button>
                        <button onClick={() => deleteGoal(activeSheet.id, g.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--accent-danger)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <CommentBox sheetId={activeSheet.id} />
        </>
      )}

      {/* Reject modal */}
      {showReject && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Return for Rework</h3>
              <button className="modal-close" onClick={() => setShowReject(null)}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for rejection *</label>
              <textarea className="form-textarea" value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder="Provide specific feedback for the employee…" style={{ minHeight: 100 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowReject(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}><X size={14} /> Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {showForm && activeSheet && (
        <GoalForm sheetId={activeSheet.id} goal={editGoal} onClose={() => { setShowForm(false); setEditGoal(undefined); }} />
      )}
    </div>
  );
}
