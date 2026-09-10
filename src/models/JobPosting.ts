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
import { Department } from './Department';
import { JobApplication } from './JobApplication';
import { Employee } from './Employee';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('text')
  requirements!: string;

  @Column('text')
  responsibilities!: string;

  @Column()
  departmentId!: string;

  @ManyToOne(() => Department, (department) => department.jobPostings)
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status!: JobStatus;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType!: EmploymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minSalary!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxSalary!: number;

  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  remoteWork!: boolean;

  @Column({ type: 'int', nullable: true })
  experienceLevel!: number; // Years of experience

  @Column({ type: 'text', array: true, default: [] })
  skills!: string[];

  @Column({ type: 'text', array: true, default: [] })
  benefits!: string[];

  @Column({ type: 'date', nullable: true })
  applicationDeadline!: Date;

  @Column({ type: 'int', default: 1 })
  numberOfPositions!: number;

  @Column({ nullable: true, name: 'created_by' })
  createdById?: string; // HR Manager ID

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: Employee;

  @Column({ nullable: true, name: 'approved_by' })
  approvedById?: string; // Manager who approved the posting

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy?: Employee;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt!: Date;

  @OneToMany(() => JobApplication, (application) => application.jobPosting)
  applications!: JobApplication[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
