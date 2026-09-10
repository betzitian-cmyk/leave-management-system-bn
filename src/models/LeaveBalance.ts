// src/models/LeaveBalance.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Employee } from './Employee';
import { LeaveType } from './LeaveType';

@Entity('leave_balances')
@Unique(['employeeId', 'leaveTypeId', 'year'])
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.leaveBalances)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'leave_type_id' })
  leaveTypeId!: string;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveBalances)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column()
  year!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  allocated!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  used!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pending!: number;

  @Column({ name: 'carry_over', type: 'decimal', precision: 5, scale: 2, default: 0 })
  carryOver!: number;

  @Column({ name: 'adjustment', type: 'decimal', precision: 5, scale: 2, default: 0 })
  adjustment!: number;

  @Column({ nullable: true, name: 'adjustment_reason' })
  adjustmentReason!: string;

  @Column({ nullable: true, name: 'expiry_date' })
  expiryDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
