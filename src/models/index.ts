// src/models/index.ts

// Core Models
export { Employee } from './Employee';
export { Department } from './Department';
export { LeaveType } from './LeaveType';
export { LeaveRequest } from './LeaveRequest';
export { LeaveBalance } from './LeaveBalance';
export { Document } from './Document';
export { Holiday } from './Holiday';
export { Notification } from './Notification';
export { AuditLog } from './AuditLog';
export { Attendance, AttendanceStatus, VerificationMethod } from './Attendance';

// Authentication Models
export { User, UserStatus, AuthProvider } from './User';
export { Role } from './Role';

// New HR Models
export { JobPosting, JobStatus, EmploymentType } from './JobPosting';
export { JobApplication, ApplicationStatus } from './JobApplication';
export { Interview, InterviewType, InterviewStatus, InterviewResult } from './Interview';
export { Salary, SalaryType, PayFrequency } from './Salary';
export { Benefit, BenefitType, BenefitCategory } from './Benefit';
export { EmployeeBenefit, EnrollmentStatus } from './EmployeeBenefit';
export { Bonus, BonusType, BonusStatus } from './Bonus';
export { Onboarding, OnboardingStatus, OnboardingPhase } from './Onboarding';
export { OnboardingTask, TaskStatus, TaskPriority, TaskCategory } from './OnboardingTask';
