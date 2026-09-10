import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';

export enum BonusType {
  PERFORMANCE = 'PERFORMANCE',
  ANNUAL = 'ANNUAL',
  QUARTERLY = 'QUARTERLY',
  PROJECT = 'PROJECT',
  REFERRAL = 'REFERRAL',
  RETENTION = 'RETENTION',
  SIGN_ON = 'SIGN_ON',
  MILESTONE = 'MILESTONE',
  OTHER = 'OTHER',
}

export enum BonusStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

@Entity('bonuses')
export class Bonus {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.bonuses)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: BonusType,
    default: BonusType.OTHER,
  })
  type!: BonusType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage!: number; // Percentage of base salary

  @Column({ type: 'date' })
  effectiveDate!: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate!: Date;

  @Column({
    type: 'enum',
    enum: BonusStatus,
    default: BonusStatus.PENDING,
  })
  status!: BonusStatus;

  @Column({ type: 'text', nullable: true })
  criteria!: string; // Performance criteria met

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @Column({ nullable: true })
  rejectedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt!: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string;

  @Column({ type: 'text', nullable: true })
  paymentMethod!: string;

  @Column({ type: 'text', nullable: true })
  referenceNumber!: string;

  @Column({ type: 'boolean', default: false })
  isTaxable!: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  taxAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  netAmount!: number;

  @Column({ type: 'text', array: true, default: [] })
  attachments!: string[]; // URLs to supporting documents

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
