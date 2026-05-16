// ============================================================
// Core Types & Interfaces
// ============================================================

export type Role = 'employee' | 'manager' | 'admin';
export type GoalStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'locked';
export type UoMType = 'numeric' | 'percentage' | 'timeline' | 'zero_based';
export type AchievementStatus = 'not_started' | 'on_track' | 'completed';
export type Quarter = 'q1' | 'q2' | 'q3' | 'q4';
export type CyclePhase = 'goal_setting' | 'q1' | 'q2' | 'q3' | 'q4';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  managerId?: string;
  managerName?: string;
  avatar?: string;
}

export interface GoalCycle {
  id: string;
  name: string;
  phase: CyclePhase;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  isActive: boolean;
}

export interface Goal {
  id: string;
  sheetId: string;
  thrustArea: string;
  title: string;
  description: string;
  uomType: UoMType;
  targetValue?: number;
  targetDate?: string;
  weightage: number;
  isShared: boolean;
  isReadonly: boolean;
  parentGoalId?: string;
  achievements: Achievement[];
}

export type GoalSheet = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  cycleId: string;
  status: GoalStatus;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  version: number;
  goals: Goal[];
  comments: Comment[];
};

export interface Achievement {
  id: string;
  goalId: string;
  quarter: Quarter;
  actualValue?: number;
  status: AchievementStatus;
  notes?: string;
  submittedAt?: string;
  isLocked: boolean;
}

export interface Comment {
  id: string;
  goalSheetId: string;
  goalId?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  actorName: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Escalation {
  id: string;
  employeeName: string;
  department: string;
  type: string;
  level: number;
  daysOverdue: number;
  resolved: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalGoals: number;
  goalsApproved: number;
  goalsPending: number;
  avgProgress: number;
  completionRate: number;
  teamSize?: number;
}
