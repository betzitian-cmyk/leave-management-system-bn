// src/models/User.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Role } from './Role';
import { Employee } from './Employee';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password!: string; // Hashed password, nullable for OAuth users

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider!: AuthProvider;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  microsoftId?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  lastLogin?: Date;

  @Column({ nullable: true })
  emailVerified?: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  emailVerificationExpires?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  refreshTokenExpires?: Date;

  // Many-to-One relationship with role
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'role_id' })
  roleId!: string;

  // One-to-One relationship with Employee (if user is an employee)
  @OneToOne(() => Employee, (employee) => employee.user)
  employee?: Employee;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Helper methods
  hasRole(roleName: string): boolean {
    return this.role?.name === roleName || false;
  }

  hasAnyRole(roleNames: string[]): boolean {
    return this.role ? roleNames.includes(this.role.name) : false;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
