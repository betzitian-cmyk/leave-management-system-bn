// src/services/emailService.ts

import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { User } from '../models/User';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailTemplateData {
  firstName: string;
  lastName?: string;
  email?: string;
  companyName: string;
  supportEmail: string;
  hrEmail: string;
  loginUrl: string;
  verificationUrl?: string;
  departmentName?: string;
  position?: string;
  hireDate?: string;
  managerName?: string;
  managerEmail?: string;
  employeeId?: string;
  [key: string]: any;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;
  private templatesCache: Map<string, Handlebars.TemplateDelegate> = new Map();

  constructor() {
    this.config = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true, // Use same secure setting as NotificationService
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    // Only create transporter if credentials are provided
    if (this.config.auth.user && this.config.auth.pass && this.config.host) {
      this.transporter = nodemailer.createTransport(this.config);
      console.info('📧 Email transporter created successfully');
      console.info(
        `📧 SMTP Host: ${this.config.host}, Port: ${this.config.port}, Secure: ${this.config.secure}`,
      );
    } else {
      console.warn('⚠️  Email credentials not configured. Email functionality will be disabled.');
      console.warn(
        '⚠️  Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASSWORD environment variables to enable emails.',
      );
      console.warn(
        `⚠️  Current values - Host: ${this.config.host || 'MISSING'}, User: ${this.config.auth.user || 'MISSING'}, Pass: ${this.config.auth.pass ? 'SET' : 'MISSING'}`,
      );
    }
  }

  /**
   * Load and compile Handlebars template
   */
  private getTemplate(templateName: string): Handlebars.TemplateDelegate {
    if (this.templatesCache.has(templateName)) {
      return this.templatesCache.get(templateName)!;
    }

    const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateContent);

    this.templatesCache.set(templateName, compiledTemplate);
    return compiledTemplate;
  }

  /**
   * Get default template data
   */
  private getDefaultTemplateData(): Partial<EmailTemplateData> {
    return {
      companyName: process.env.COMPANY_NAME || 'Your Company',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@company.com',
      hrEmail: process.env.HR_EMAIL || 'hr@company.com',
      loginUrl: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/login`
        : 'http://localhost:3000/login',
    };
  }

  /**
   * Generate email content from template
   */
  private generateEmailFromTemplate(templateName: string, data: EmailTemplateData): EmailTemplate {
    const template = this.getTemplate(templateName);
    const templateData = { ...this.getDefaultTemplateData(), ...data };

    const html = template(templateData);

    // Generate plain text version by stripping HTML tags
    const text = html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Extract subject from template data or use a default
    let subject = '';
    switch (templateName) {
      case 'welcome':
        subject = `Welcome to ${templateData.companyName}!`;
        break;
      case 'employee-assignment':
        subject = `Welcome to the Team - ${templateData.companyName}`;
        break;
      case 'email-verification':
        subject = `Verify Your Email - ${templateData.companyName}`;
        break;
      default:
        subject = `Message from ${templateData.companyName}`;
    }

    return { subject, html, text };
  }

  /**
   * Send email verification using Handlebars template
   */
  async sendEmailVerification(user: User, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    const templateData: EmailTemplateData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      verificationUrl,
      companyName: '',
      supportEmail: '',
      hrEmail: '',
      loginUrl: '',
    };

    const template = this.generateEmailFromTemplate('email-verification', templateData);
    await this.sendEmail(user.email, template);
  }

  /**
   * Send welcome email to new user (GUEST role)
   */
  async sendWelcomeEmail(user: User, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    const templateData: EmailTemplateData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      verificationUrl,
      companyName: '',
      supportEmail: '',
      hrEmail: '',
      loginUrl: '',
    };

    const template = this.generateEmailFromTemplate('welcome', templateData);
    await this.sendEmail(user.email, template);
  }

  /**
   * Send employee assignment notification (GUEST → EMPLOYEE)
   */
  async sendEmployeeAssignmentEmail(
    user: User,
    employeeData: {
      departmentName: string;
      position: string;
      hireDate: string;
      employeeId: string;
      managerName?: string;
      managerEmail?: string;
    },
  ): Promise<void> {
    const templateData: EmailTemplateData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      departmentName: employeeData.departmentName,
      position: employeeData.position,
      hireDate: employeeData.hireDate,
      employeeId: employeeData.employeeId,
      managerName: employeeData.managerName,
      managerEmail: employeeData.managerEmail,
      companyName: '',
      supportEmail: '',
      hrEmail: '',
      loginUrl: '',
    };

    const template = this.generateEmailFromTemplate('employee-assignment', templateData);
    await this.sendEmail(user.email, template);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const template: EmailTemplate = {
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${user.firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <br>
          <p>Best regards,<br>Your Company Team</p>
        </div>
      `,
      text: `
        Password Reset Request
        
        Hi ${user.firstName},
        
        We received a request to reset your password. Visit this link to create a new password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email.
        
        Best regards,
        Your Company Team
      `,
    };

    await this.sendEmail(user.email, template);
  }

  /**
   * Send account status update email
   */
  async sendAccountStatusUpdate(user: User, status: string): Promise<void> {
    const template: EmailTemplate = {
      subject: `Account Status Updated - ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Account Status Update</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your account status has been updated to: <strong>${status}</strong></p>
          <p>If you have any questions about this change, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Your Company Team</p>
        </div>
      `,
      text: `
        Account Status Update
        
        Hi ${user.firstName},
        
        Your account status has been updated to: ${status}
        
        If you have any questions about this change, please contact our support team.
        
        Best regards,
        Your Company Team
      `,
    };

    await this.sendEmail(user.email, template);
  }

  /**
   * Send generic email
   */
  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (!this.transporter) {
      console.warn(`📧 Email not sent to ${to}: SMTP not configured`);
      throw new Error(
        'Email transporter not configured. Please check your EMAIL_* environment variables.',
      );
    }

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || 'Your Company'}" <${this.config.auth.user}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    try {
      console.info(`📧 Attempting to send email to ${to}...`);
      await this.transporter.sendMail(mailOptions);
      console.info(`📧 Email sent successfully to ${to}: ${template.subject}`);
    } catch (error) {
      console.error('📧 Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('📧 Email connection test skipped: SMTP not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.info('📧 Email connection test successful');
      return true;
    } catch (error) {
      console.error('📧 Email connection test failed:', error);
      return false;
    }
  }
}
