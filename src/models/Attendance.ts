// src/models/Attendance.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from './Employee';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export type VerificationMethod = 'MANUAL' | 'FINGERPRINT' | 'PIN';

@Entity('attendances')
@Index(['employeeId', 'date'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.attendances)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ type: 'date' })
  date!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PRESENT',
  })
  status!: AttendanceStatus;

  @Column({ name: 'check_in_time', nullable: true })
  checkInTime?: string; // Time in HH:MM format

  @Column({ name: 'check_out_time', nullable: true })
  checkOutTime?: string; // Time in HH:MM format

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy?: string; // User ID who verified the attendance

  @Column({
    name: 'verification_method',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  verificationMethod?: VerificationMethod;

  @Column({ name: 'fingerprint_template', nullable: true, type: 'text' })
  fingerprintTemplate?: string; // Base64 encoded fingerprint template used for this attendance

  @Column({ name: 'confidence_score', nullable: true, type: 'float' })
  confidenceScore?: number; // Confidence score from fingerprint verification (0-100)

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
