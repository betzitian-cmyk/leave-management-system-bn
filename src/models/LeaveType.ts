// src/models/LeaveType.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LeaveRequest } from './LeaveRequest';
import { LeaveBalance } from './LeaveBalance';

@Entity('leave_types')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  description!: string;

  @Column({ name: 'accrual_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  accrualRate!: number;

  @Column({ name: 'requires_documentation', default: false })
  requiresDocumentation!: boolean;

  @Column({ name: 'requires_approval', default: true })
  requiresApproval!: boolean;

  @Column({ name: 'max_days', nullable: true })
  maxDays!: number;

  @Column({ name: 'max_consecutive_days', nullable: true })
  maxConsecutiveDays!: number;

  @Column({ name: 'active', default: true })
  active!: boolean;

  @Column({ name: 'color', nullable: true })
  color!: string;

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.leaveType)
  leaveRequests!: LeaveRequest[];

  @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.leaveType)
  leaveBalances!: LeaveBalance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
