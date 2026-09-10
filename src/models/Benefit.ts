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
import { EmployeeBenefit } from './EmployeeBenefit';

export enum BenefitType {
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
  DENTAL_INSURANCE = 'DENTAL_INSURANCE',
  VISION_INSURANCE = 'VISION_INSURANCE',
  LIFE_INSURANCE = 'LIFE_INSURANCE',
  DISABILITY_INSURANCE = 'DISABILITY_INSURANCE',
  RETIREMENT_PLAN = 'RETIREMENT_PLAN',
  PAID_TIME_OFF = 'PAID_TIME_OFF',
  SICK_LEAVE = 'SICK_LEAVE',
  MATERNITY_LEAVE = 'MATERNITY_LEAVE',
  PATERNITY_LEAVE = 'PATERNITY_LEAVE',
  EDUCATION_REIMBURSEMENT = 'EDUCATION_REIMBURSEMENT',
  TRANSPORTATION = 'TRANSPORTATION',
  MEAL_ALLOWANCE = 'MEAL_ALLOWANCE',
  GYM_MEMBERSHIP = 'GYM_MEMBERSHIP',
  OTHER = 'OTHER',
}

export enum BenefitCategory {
  INSURANCE = 'INSURANCE',
  RETIREMENT = 'RETIREMENT',
  TIME_OFF = 'TIME_OFF',
  WELLNESS = 'WELLNESS',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT',
  LIFESTYLE = 'LIFESTYLE',
}

@Entity('benefits')
export class Benefit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: BenefitType,
    default: BenefitType.OTHER,
  })
  type!: BenefitType;

  @Column({
    type: 'enum',
    enum: BenefitCategory,
    default: BenefitCategory.LIFESTYLE,
  })
  category!: BenefitCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost!: number; // Cost to company per employee

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  employeeContribution!: number; // Employee contribution amount

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employeeContributionPercentage!: number; // Employee contribution percentage

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  requiresEnrollment!: boolean;

  @Column({ type: 'date', nullable: true })
  effectiveDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date;

  @Column({ type: 'text', array: true, default: [] })
  eligibilityCriteria!: string[];

  @Column({ type: 'text', array: true, default: [] })
  documentsRequired!: string[];

  @Column({ type: 'text', nullable: true })
  provider!: string; // Insurance provider, etc.

  @Column({ type: 'text', nullable: true })
  contactInfo!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ nullable: true })
  createdBy!: string;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @OneToMany(() => EmployeeBenefit, (employeeBenefit) => employeeBenefit.benefit)
  employeeBenefits!: EmployeeBenefit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
