// src/models/Department.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { JobPosting } from './JobPosting';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true, name: 'manager_id' })
  managerId?: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'manager_id' })
  manager!: Employee;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees!: Employee[];

  @OneToMany(() => JobPosting, (jobPosting) => jobPosting.department)
  jobPostings!: JobPosting[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
