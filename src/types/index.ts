// src/types/index.ts

export interface IEmployee {
  id: string;
  authUserId: string;
  departmentId: string;
  managerId?: string;
  position: string;
  hireDate: Date;
}

export interface ILeaveType {
  id: string;
  name: string;
  description: string;
  accrualRate: number; // Monthly rate (e.g., 1.66 for PTO)
  requiresDocumentation: boolean;
  requiresApproval: boolean;
  maxDays?: number;
}

export interface ILeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvalDate?: Date;
  comments?: string;
  documents?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  carryOver: number;
  expiry?: Date;
}
