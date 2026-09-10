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
import { JobPosting } from './JobPosting';
import { Interview } from './Interview';
import { Employee } from './Employee';

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  jobPostingId!: string;

  @ManyToOne(() => JobPosting, (jobPosting) => jobPosting.applications)
  @JoinColumn({ name: 'job_posting_id' })
  jobPosting!: JobPosting;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  resumeUrl!: string;

  @Column({ nullable: true })
  coverLetterUrl!: string;

  @Column({ type: 'text', nullable: true })
  coverLetter!: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status!: ApplicationStatus;

  @Column({ type: 'text', array: true, default: [] })
  skills!: string[];

  @Column({ type: 'int', nullable: true })
  experienceYears!: number;

  @Column({ nullable: true })
  currentCompany!: string;

  @Column({ nullable: true })
  currentPosition!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expectedSalary!: number;

  @Column({ nullable: true })
  noticePeriod!: string;

  @Column({ type: 'text', array: true, default: [] })
  references!: string[];

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo!: any;

  @Column({ nullable: true, name: 'assigned_to' })
  assignedToId?: string; // HR Manager assigned to review

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo?: Employee;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt!: Date;

  @Column({ nullable: true, name: 'reviewed_by' })
  reviewedById?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy?: Employee;

  @OneToMany(() => Interview, (interview) => interview.application)
  interviews!: Interview[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
