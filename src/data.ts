import type { GoalSheet, User, GoalCycle, AuditLog, Notification, Escalation, Quarter, AchievementStatus } from './types';
// ============================================================
// DEMO DATA — Sample users, goals, achievements for hackathon demo
// ============================================================

export const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Admin HR', email: 'admin@atomquest.com', role: 'admin', department: 'HR', avatar: 'AH' },
  { id: 'u2', name: 'Sarah Mitchell', email: 'sarah.mgr@atomquest.com', role: 'manager', department: 'Engineering', managerId: 'u1', managerName: 'Admin HR', avatar: 'SM' },
  { id: 'u3', name: 'John Carter', email: 'john.emp@atomquest.com', role: 'employee', department: 'Engineering', managerId: 'u2', managerName: 'Sarah Mitchell', avatar: 'JC' },
  { id: 'u4', name: 'Jane Doe', email: 'jane.emp@atomquest.com', role: 'employee', department: 'Engineering', managerId: 'u2', managerName: 'Sarah Mitchell', avatar: 'JD' },
  { id: 'u5', name: 'Raj Patel', email: 'raj.emp@atomquest.com', role: 'employee', department: 'Sales', managerId: 'u1', managerName: 'Admin HR', avatar: 'RP' },
  { id: 'u6', name: 'Maya Sharma', email: 'maya.mgr@atomquest.com', role: 'manager', department: 'Sales', managerId: 'u1', managerName: 'Admin HR', avatar: 'MS' },
];

export const DEMO_CYCLE: GoalCycle = {
  id: 'cy1',
  name: 'FY 2025–26',
  phase: 'q1',
  startDate: '2025-04-01',
  endDate: '2026-03-31',
  submissionDeadline: '2025-05-01',
  isActive: true,
};

export const DEMO_SHEETS: GoalSheet[] = [
  {
    id: 'gs1',
    employeeId: 'u3',
    employeeName: 'John Carter',
    department: 'Engineering',
    cycleId: 'cy1',
    status: 'approved',
    submittedAt: '2025-04-28T10:00:00Z',
    approvedAt: '2025-04-29T14:30:00Z',
    approvedBy: 'Sarah Mitchell',
    version: 2,
    goals: [
      {
        id: 'g1', sheetId: 'gs1',
        thrustArea: 'Product Quality',
        title: 'Reduce Bug Count',
        description: 'Reduce production bugs by implementing better code reviews and automated testing.',
        uomType: 'numeric', targetValue: 50, weightage: 25,
        isShared: false, isReadonly: false,
        achievements: [
          { id: 'a1', goalId: 'g1', quarter: 'q1', actualValue: 38, status: 'on_track', notes: 'Improved test coverage significantly.', submittedAt: '2025-07-15T09:00:00Z', isLocked: true },
          { id: 'a2', goalId: 'g1', quarter: 'q2', actualValue: 22, status: 'on_track', notes: 'New linting rules added.', submittedAt: '2025-10-10T09:00:00Z', isLocked: false },
          { id: 'a3', goalId: 'g1', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a4', goalId: 'g1', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
      {
        id: 'g2', sheetId: 'gs1',
        thrustArea: 'Delivery',
        title: 'On-Time Sprint Delivery',
        description: 'Achieve 95%+ on-time delivery rate for all sprint commitments.',
        uomType: 'percentage', targetValue: 95, weightage: 30,
        isShared: false, isReadonly: false,
        achievements: [
          { id: 'a5', goalId: 'g2', quarter: 'q1', actualValue: 92, status: 'on_track', submittedAt: '2025-07-15T09:00:00Z', isLocked: true },
          { id: 'a6', goalId: 'g2', quarter: 'q2', actualValue: 97, status: 'completed', submittedAt: '2025-10-10T09:00:00Z', isLocked: false },
          { id: 'a7', goalId: 'g2', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a8', goalId: 'g2', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
      {
        id: 'g3', sheetId: 'gs1',
        thrustArea: 'Learning & Development',
        title: 'Complete Cloud Certification',
        description: 'Obtain AWS Solutions Architect certification by Q2.',
        uomType: 'timeline', targetDate: '2025-09-30', weightage: 20,
        isShared: false, isReadonly: false,
        achievements: [
          { id: 'a9', goalId: 'g3', quarter: 'q1', actualValue: undefined, status: 'on_track', notes: 'Enrolled in prep course.', submittedAt: '2025-07-15T09:00:00Z', isLocked: true },
          { id: 'a10', goalId: 'g3', quarter: 'q2', actualValue: undefined, status: 'completed', notes: 'Certified!', submittedAt: '2025-10-10T09:00:00Z', isLocked: false },
          { id: 'a11', goalId: 'g3', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a12', goalId: 'g3', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
      {
        id: 'g4', sheetId: 'gs1',
        thrustArea: 'Cost Management',
        title: 'Infrastructure Cost Reduction',
        description: 'Reduce cloud infrastructure costs through optimization.',
        uomType: 'numeric', targetValue: 200000, weightage: 25,
        isShared: true, isReadonly: false,
        achievements: [
          { id: 'a13', goalId: 'g4', quarter: 'q1', actualValue: 210000, status: 'on_track', submittedAt: '2025-07-15T09:00:00Z', isLocked: true },
          { id: 'a14', goalId: 'g4', quarter: 'q2', actualValue: 185000, status: 'completed', submittedAt: '2025-10-10T09:00:00Z', isLocked: false },
          { id: 'a15', goalId: 'g4', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a16', goalId: 'g4', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
    ],
    comments: [
      { id: 'c1', goalSheetId: 'gs1', authorId: 'u2', authorName: 'Sarah Mitchell', content: 'Good goals! Adjusted the bug count target to 50 to be more realistic.', createdAt: '2025-04-29T14:00:00Z' },
      { id: 'c2', goalSheetId: 'gs1', authorId: 'u3', authorName: 'John Carter', content: 'Understood, I will work towards it!', createdAt: '2025-04-29T15:00:00Z' },
    ],
  },
  {
    id: 'gs2',
    employeeId: 'u4',
    employeeName: 'Jane Doe',
    department: 'Engineering',
    cycleId: 'cy1',
    status: 'submitted',
    submittedAt: '2025-04-30T11:00:00Z',
    version: 1,
    goals: [
      {
        id: 'g5', sheetId: 'gs2',
        thrustArea: 'Product Quality',
        title: 'Improve Test Coverage',
        description: 'Achieve 80%+ unit test coverage across all modules.',
        uomType: 'percentage', targetValue: 80, weightage: 35,
        isShared: false, isReadonly: false,
        achievements: [
          { id: 'a17', goalId: 'g5', quarter: 'q1', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a18', goalId: 'g5', quarter: 'q2', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a19', goalId: 'g5', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a20', goalId: 'g5', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
      {
        id: 'g6', sheetId: 'gs2',
        thrustArea: 'Delivery',
        title: 'Feature Delivery Rate',
        description: 'Deliver all assigned features on schedule.',
        uomType: 'percentage', targetValue: 90, weightage: 35,
        isShared: false, isReadonly: false,
        achievements: [
          { id: 'a21', goalId: 'g6', quarter: 'q1', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a22', goalId: 'g6', quarter: 'q2', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a23', goalId: 'g6', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a24', goalId: 'g6', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
      {
        id: 'g7', sheetId: 'gs2',
        thrustArea: 'Cost Management',
        title: 'Infrastructure Cost Reduction',
        description: 'Shared departmental cost reduction goal.',
        uomType: 'numeric', targetValue: 200000, weightage: 30,
        isShared: true, isReadonly: true, parentGoalId: 'g4',
        achievements: [
          { id: 'a25', goalId: 'g7', quarter: 'q1', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a26', goalId: 'g7', quarter: 'q2', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a27', goalId: 'g7', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a28', goalId: 'g7', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
    ],
    comments: [],
  },
  {
    id: 'gs3',
    employeeId: 'u5',
    employeeName: 'Raj Patel',
    department: 'Sales',
    cycleId: 'cy1',
    status: 'draft',
    version: 1,
    goals: [
      {
        id: 'g8', sheetId: 'gs3',
        thrustArea: 'Revenue',
        title: 'Sales Revenue Target',
        description: 'Achieve quarterly sales revenue targets.',
        uomType: 'numeric', targetValue: 5000000, weightage: 50,
        isShared: false, isReadonly: false,
        achievements: [
          { id: 'a29', goalId: 'g8', quarter: 'q1', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a30', goalId: 'g8', quarter: 'q2', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a31', goalId: 'g8', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a32', goalId: 'g8', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
      {
        id: 'g9', sheetId: 'gs3',
        thrustArea: 'Customer',
        title: 'New Customer Acquisition',
        description: 'Acquire 20 new enterprise clients.',
        uomType: 'numeric', targetValue: 20, weightage: 50,
        isShared: false, isReadonly: false,
        achievements: [
          { id: 'a33', goalId: 'g9', quarter: 'q1', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a34', goalId: 'g9', quarter: 'q2', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a35', goalId: 'g9', quarter: 'q3', actualValue: undefined, status: 'not_started', isLocked: false },
          { id: 'a36', goalId: 'g9', quarter: 'q4', actualValue: undefined, status: 'not_started', isLocked: false },
        ],
      },
    ],
    comments: [],
  },
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', entityType: 'goal', entityId: 'g1', actorName: 'Sarah Mitchell', action: 'update', fieldName: 'targetValue', oldValue: '60', newValue: '50', createdAt: '2025-04-29T14:05:00Z' },
  { id: 'al2', entityType: 'goal_sheet', entityId: 'gs1', actorName: 'Sarah Mitchell', action: 'approve', createdAt: '2025-04-29T14:30:00Z' },
  { id: 'al3', entityType: 'goal_sheet', entityId: 'gs1', actorName: 'John Carter', action: 'submit', createdAt: '2025-04-28T10:00:00Z' },
  { id: 'al4', entityType: 'achievement', entityId: 'a1', actorName: 'John Carter', action: 'update', fieldName: 'actualValue', oldValue: '40', newValue: '38', createdAt: '2025-07-15T09:30:00Z' },
  { id: 'al5', entityType: 'goal', entityId: 'g2', actorName: 'Admin HR', action: 'unlock', createdAt: '2025-05-01T10:00:00Z' },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u3', type: 'approval', title: 'Goals Approved', message: 'Your goal sheet for FY 2025–26 has been approved by Sarah Mitchell.', isRead: false, createdAt: '2025-04-29T14:30:00Z' },
  { id: 'n2', userId: 'u2', type: 'submission', title: 'Goal Sheet Submitted', message: 'Jane Doe has submitted her goal sheet for FY 2025–26. Please review.', isRead: false, createdAt: '2025-04-30T11:00:00Z' },
  { id: 'n3', userId: 'u3', type: 'reminder', title: 'Q2 Check-in Due', message: 'Q2 achievement check-in deadline is October 31. Please update your progress.', isRead: true, createdAt: '2025-10-15T08:00:00Z' },
  { id: 'n4', userId: 'u1', type: 'escalation', title: 'Escalation Alert', message: 'Raj Patel has not submitted goals for FY 2025–26. Deadline was May 1.', isRead: false, createdAt: '2025-05-04T08:00:00Z' },
];

export const DEMO_ESCALATIONS: Escalation[] = [
  { id: 'e1', employeeName: 'Raj Patel', department: 'Sales', type: 'not_submitted', level: 2, daysOverdue: 15, resolved: false, createdAt: '2025-05-04T08:00:00Z' },
  { id: 'e2', employeeName: 'Alex Kim', department: 'Marketing', type: 'approval_pending', level: 1, daysOverdue: 7, resolved: false, createdAt: '2025-05-08T08:00:00Z' },
  { id: 'e3', employeeName: 'Tom Brady', department: 'Finance', type: 'checkin_overdue', level: 3, daysOverdue: 21, resolved: false, createdAt: '2025-10-25T08:00:00Z' },
];

// ============================================================
// Calculation Engine
// ============================================================
export function calcProgress(uomType: string, target?: number, actual?: number, targetDate?: string, completionStatus?: AchievementStatus): number {
  if (uomType === 'zero_based') return actual === 0 ? 100 : 0;
  if (uomType === 'timeline') return completionStatus === 'completed' ? 100 : completionStatus === 'on_track' ? 50 : 0;
  if (!target || target === 0) return 0;
  if (actual === undefined || actual === null) return 0;
  // numeric/percentage: higher is better
  return Math.min(Math.round((actual / target) * 100), 100);
}

export function calcWeightedScore(goals: { uomType: string; targetValue?: number; targetDate?: string; weightage: number; achievements: { quarter: Quarter; actualValue?: number; status: AchievementStatus }[] }[], quarter: Quarter): number {
  let total = 0;
  for (const g of goals) {
    const ach = g.achievements.find(a => a.quarter === quarter);
    const p = calcProgress(g.uomType, g.targetValue, ach?.actualValue, g.targetDate, ach?.status);
    total += (p * g.weightage) / 100;
  }
  return Math.round(total);
}

export function validateWeightage(goals: { weightage: number }[]): { valid: boolean; total: number; errors: string[] } {
  const total = goals.reduce((s, g) => s + (g.weightage || 0), 0);
  const errors: string[] = [];
  if (total !== 100) errors.push(`Total weightage is ${total}% — must equal exactly 100%`);
  if (goals.length > 8) errors.push('Maximum 8 goals per employee');
  goals.forEach(g => { if (g.weightage < 10) errors.push('Each goal must have at least 10% weightage'); });
  return { valid: errors.length === 0, total, errors };
}

export const QUARTER_LABELS: Record<Quarter, string> = { q1: 'Q1 (Jul)', q2: 'Q2 (Oct)', q3: 'Q3 (Jan)', q4: 'Q4 (Apr)' };
export const UOM_LABELS: Record<string, string> = { numeric: 'Numeric', percentage: 'Percentage (%)', timeline: 'Timeline', zero_based: 'Zero-Based' };
export const STATUS_LABELS: Record<string, string> = { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected', locked: 'Locked' };
