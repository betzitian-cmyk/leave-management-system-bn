// src/models/LeaveRequest.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { LeaveType } from './LeaveType';
import { Document } from './Document';

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.leaveRequests)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'leave_type_id' })
  leaveTypeId!: string;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveRequests)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column({ name: 'start_date' })
  startDate!: Date;

  @Column({ name: 'end_date' })
  endDate!: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  days!: number;

  @Column({ nullable: true })
  reason!: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING',
  })
  status!: LeaveRequestStatus;

  @Column({ nullable: true, name: 'approved_by' })
  approvedById!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'approved_by' })
  approvedBy!: Employee;

  @Column({ nullable: true, name: 'approval_date' })
  approvalDate!: Date;

  @Column({ nullable: true })
  comments!: string;

  @OneToMany(() => Document, (document) => document.leaveRequest)
  documents!: Document[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
