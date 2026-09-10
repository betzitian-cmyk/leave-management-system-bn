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
import { Benefit } from './Benefit';

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  WAITING_PERIOD = 'WAITING_PERIOD',
}

@Entity('employee_benefits')
export class EmployeeBenefit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.employeeBenefits)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column()
  benefitId!: string;

  @ManyToOne(() => Benefit, (benefit) => benefit.employeeBenefits)
  @JoinColumn({ name: 'benefit_id' })
  benefit!: Benefit;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status!: EnrollmentStatus;

  @Column({ type: 'date' })
  enrollmentDate!: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  employeeContribution!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  companyContribution!: number;

  @Column({ type: 'text', array: true, default: [] })
  dependents!: string[]; // Names of covered dependents

  @Column({ type: 'text', nullable: true })
  policyNumber!: string;

  @Column({ type: 'text', nullable: true })
  groupNumber!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @Column({ type: 'text', nullable: true })
  terminationReason!: string;

  @Column({ nullable: true })
  terminatedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  terminatedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
