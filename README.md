# Leave Management System - Backend API

A comprehensive REST API for managing employee leave requests, balances, and approvals with JWT authentication and role-based access control.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v11+)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SaddockAime/leave-management-system-bn.git
   cd leave-management-system-bn
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env file with your database and other configurations
   ```

4. **Database Setup**

   ```bash
   npm run createAllTables
   npm run seed:all
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000` with documentation at `http://localhost:4000/api-docs`

## 🔧 Environment Variables

Create a `.env` file with these required variables:

```env
# Database
DATABASE_URL=postgres://username:password@localhost:5432/leave_management

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Required for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Email Templates & Branding (Required)
COMPANY_NAME=Your Company Name
SUPPORT_EMAIL=support@company.com
HR_EMAIL=hr@company.com

# Server
PORT=4000
NODE_ENV=development
```

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based internal authentication system
- **File Storage**: Cloudinary for images and documents
- **Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.IO for notifications
- **Logging**: Winston for structured logging
- **Validation**: Joi for request validation

### Key Features

- **🔐 Authentication & Authorization**: Complete JWT-based auth system with user registration, login, logout, password reset, email verification, and Google OAuth
- **👥 HR Management**: Comprehensive HR module with employee analytics, department performance, bulk operations, and workforce insights
- **🎯 Recruitment System**: Full recruitment lifecycle with job postings, application tracking, interview scheduling, and recruitment analytics
- **💰 Compensation Management**: Salary administration, bonus tracking, benefits enrollment, and compensation analytics
- **📚 Employee Onboarding**: Structured onboarding processes with task templates, progress tracking, and completion analytics
- **📋 Leave Management**: Advanced leave system with multiple types, approval workflows, balance tracking, and manager tools
- **👨‍💼 Manager Tools**: Team management, performance tracking, leave approvals, and department oversight
- **📁 Document Management**: Cloudinary-integrated file storage for profiles, documents, and attachments
- **🔔 Real-time Notifications**: Socket.IO notifications with email integration and preference management
- **📊 Advanced Analytics**: Comprehensive reporting across HR, recruitment, compensation, and leave modules
- **🕵️ Audit & Compliance**: Complete activity tracking, security logging, and compliance reporting
- **🏢 Organizational Structure**: Department management, manager hierarchies, and team relationships

## 📚 API Documentation

### Access

- **Swagger UI**: `http://localhost:4000/api-docs`
- **OpenAPI Spec**: `http://localhost:4000/api-docs.json`

### Authentication

The API uses internal JWT-based authentication. Users can register, login, and manage their sessions:

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john@company.com", "password": "password123"}'

# Login to get JWT token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@company.com", "password": "password123"}'

# Use token in protected requests
curl -X GET http://localhost:4000/api/leave-requests/my-leaves \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Logout (invalidates token)
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### User Roles & Permissions

- **ADMIN**: Full system access, user management, system configuration
- **HR_MANAGER**: Employee management, department oversight, leave policies
- **MANAGER**: Team management, leave approvals for direct reports
- **EMPLOYEE**: Basic access, personal leave requests, profile management

## 🛠️ Development

### Scripts

```bash
npm run dev              # Start development server
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run createAllTables  # Create database tables
npm run deleteAllTables  # Drop all database tables
npm run seed:all         # Seed database with initial data
npm run swagger:generate # Generate API documentation
npm run format           # Format code with Prettier
```

### Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Database entities
├── routes/          # API route definitions
├── middleware/      # Custom middleware
├── validations/     # Request validation schemas
├── config/          # Configuration files
├── utils/           # Utility functions
└── scripts/         # Database seeders
```

### Code Standards

- TypeScript for type safety
- Joi for request validation
- Winston for structured logging
- ESLint and Prettier for code formatting

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions by user role
- **Input Validation**: Comprehensive request validation with Joi
- **File Upload Security**: Type and size validation for uploads
- **Audit Logging**: Complete activity tracking
- **Error Handling**: Secure error responses without sensitive data

## 🗄️ Database

### Core Models

- **User**: Authentication and basic user data
- **Employee**: Extended employee profiles (linked to Users)
- **Department**: Organizational structure
- **Role**: User roles and permissions

### Leave Management Models

- **LeaveRequest**: Leave applications and status
- **LeaveType**: Different types of leave (Annual, Sick, etc.)
- **LeaveBalance**: Available leave balances by type

### HR & Management Models

- **JobPosting**: Recruitment job listings
- **JobApplication**: Candidate applications
- **Interview**: Interview scheduling and tracking
- **Onboarding**: Employee onboarding processes
- **OnboardingTask**: Individual onboarding tasks

### Compensation Models

- **Salary**: Employee salary information
- **Bonus**: Bonus allocations and tracking
- **Benefit**: Company benefits catalog
- **EmployeeBenefit**: Employee benefit enrollments

### System Models

- **Document**: File attachments with Cloudinary integration
- **Notification**: System notifications and preferences
- **AuditLog**: Comprehensive activity tracking
- **NotificationTemplate**: Email and notification templates

### Relationships

- Users have one Employee profile (created by HR/Admin)
- Employees belong to Departments
- Employees can have Managers (hierarchical structure)
- Leave Requests belong to Employees
- Documents are attached to Leave Requests

## 📊 API Modules Overview

The system provides **17 comprehensive API modules** with hundreds of endpoints:

### 🔐 Authentication & User Management (`/api/auth`)

- **Professional Registration Flow**: New users assigned GUEST role, receive welcome email with verification
- **Role-Based Progression**: GUEST → EMPLOYEE when HR creates profile, with assignment notification
- **Secure Authentication**: JWT tokens, password reset, email verification workflows
- **Google OAuth Integration**: Alternative authentication method
- **User role and status management** (Admin only)
- **Token refresh and blacklisting** for enhanced security

### 👤 Profile Management (`/api/profile`)

- User profile viewing and updating
- Profile picture upload with Cloudinary integration

### 👥 Employee Management (`/api/employees`)

- **Smart Role Progression**: Creating employee profile automatically upgrades GUEST to EMPLOYEE
- **Professional Notifications**: Welcome emails sent with department and manager information
- **HR-controlled employee profile** creation and management
- **Employee search and filtering** with pagination
- **Department-based employee viewing** for managers
- **Employee analytics and insights**

### 👨‍💼 Manager Tools (`/api/manager`)

- Team management and hierarchy viewing
- Team leave approval and oversight
- Performance tracking and analytics
- Direct report management

### 🏢 HR Management (`/api/hr`)

- Comprehensive HR dashboard and analytics
- Employee overview and workforce insights
- Department performance metrics
- Bulk employee operations
- HR reporting with multiple report types

### 🎯 Recruitment System (`/api/recruitment`)

- Job posting creation and management
- Application tracking and processing
- Interview scheduling and management
- Candidate evaluation and hiring workflows
- Recruitment analytics and metrics

### 💰 Compensation Management (`/api/compensation`)

- Salary administration and tracking
- Bonus allocation and management
- Benefits enrollment and administration
- Compensation analytics and reporting
- Payroll integration capabilities

### 📚 Onboarding System (`/api/onboarding`)

- Structured onboarding process creation
- Task templates and checklist management
- Progress tracking and completion monitoring
- Onboarding analytics and optimization

### 📋 Leave Management (`/api/leave-requests`, `/api/leave-types`, `/api/leave-balances`)

- Advanced leave request workflows
- Multiple leave types and balance tracking
- Manager approval processes
- Leave analytics and reporting
- Department and team leave oversight

### 📁 Document Management (`/api/documents`)

- Cloudinary-integrated file storage
- Document upload for leave requests
- File categorization and management
- Secure document access control

### 🔔 Notification System (`/api/notifications`)

- **Professional Email Templates**: Handlebars-powered professional email designs
- **Role-Based Notifications**: Welcome emails for GUEST, assignment emails for EMPLOYEE
- **Real-time notifications** via Socket.IO
- **Email notification preferences** and management
- **Notification history** and tracking
- **Custom notification templates** for various workflows

### 🏢 Department Management (`/api/departments`)

- Organizational structure management
- Department creation and administration
- Manager assignment and hierarchies

### 📊 Reporting & Analytics (`/api/reports`)

- Cross-module reporting capabilities
- Advanced analytics and insights
- Data export in multiple formats
- Custom report generation

### 🕵️ Audit & Compliance (`/api/audit`)

- Comprehensive activity logging
- Security event tracking
- Compliance reporting
- Audit trail management

### 🛡️ Additional Modules

- **Protected Routes**: Role-based access control across all endpoints
- **Real-time Features**: Socket.IO integration for live updates
- **Email Services**: SMTP integration for notifications and workflows

For complete API documentation, visit `/api-docs` when the server is running.

## 👤 User Onboarding Workflow

### 🚀 **Professional Registration & Role Progression**

The system implements a sophisticated user onboarding workflow with role-based access control:

#### **Step 1: User Registration (GUEST Role)**

```
POST /api/auth/register
```

- ✅ User assigned **GUEST** role initially
- ✅ **Professional welcome email** sent with verification link
- ✅ **No JWT token** returned (security best practice)
- ✅ Email verification required before login

#### **Step 2: Email Verification**

```
GET /api/auth/verify-email/:token
```

- ✅ User verifies email address
- ✅ Account activated for login
- ✅ User can now log in with GUEST permissions

#### **Step 3: Employee Profile Creation (GUEST → EMPLOYEE)**

```
POST /api/employees (HR/Admin only)
```

- ✅ HR/Admin creates employee profile for user
- ✅ User role **automatically upgraded** from GUEST to EMPLOYEE
- ✅ **Professional assignment email** sent with:
  - Department information
  - Position details
  - Manager contact information
  - Employee ID and hire date
  - Full access rights explanation

#### **Step 4: Full Employee Access**

- ✅ User now has complete employee functionality
- ✅ Can submit leave requests, access documents, etc.
- ✅ Receives role-appropriate notifications

### 📧 **Professional Email Templates**

All emails use **Handlebars templates** with professional design:

- **Welcome Email**: Clean blue gradient, verification flow explanation
- **Employee Assignment**: Green celebration theme, detailed role information
- **Email Verification**: Security-focused design with clear instructions

Templates are mobile-responsive and follow corporate design standards.

### 🛡️ **Role-Based Access Control**

The system enforces strict access control based on user roles:

#### **🔓 Public Access (No Authentication)**

- User registration and login
- Password reset and email verification
- Google OAuth authentication

#### **👥 GUEST Role Access**

- ✅ **Profile Management**: View/update profile, upload profile picture
- ✅ **Status Checking**: Check onboarding progress via `/api/auth/status`
- ✅ **Basic Notifications**: View system notifications
- ❌ **Leave Management**: Cannot create, view, or manage leave requests
- ❌ **Document Access**: Cannot upload or access documents
- ❌ **Employee Features**: Limited access until profile created

#### **👔 EMPLOYEE Role Access**

- ✅ **All GUEST permissions** +
- ✅ **Leave Management**: Create, view, update, cancel leave requests
- ✅ **Document Management**: Upload and access leave documents
- ✅ **Leave History**: View personal leave history and balances
- ✅ **Team Features**: Basic team collaboration

#### **👨‍💼 MANAGER+ Role Access**

- ✅ **All EMPLOYEE permissions** +
- ✅ **Team Management**: View and manage team leave requests
- ✅ **Approval Workflows**: Approve/reject leave requests
- ✅ **Department Oversight**: Department-level reporting

#### **👩‍💼 HR_MANAGER & ADMIN Role Access**

- ✅ **All MANAGER permissions** +
- ✅ **Employee Management**: Create employee profiles for GUEST users
- ✅ **System Administration**: User role management, system settings
- ✅ **Advanced Analytics**: Comprehensive reporting across all modules

### 📊 **Status Endpoint for Frontend Integration**

```typescript
GET / api / auth / status;
```

Perfect for frontend applications to determine user capabilities:

```json
{
  "success": true,
  "data": {
    "role": "GUEST",
    "emailVerified": true,
    "hasEmployeeProfile": false,
    "needsEmployeeProfile": true,
    "status": "GUEST_AWAITING_PROFILE"
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify `DATABASE_URL` in `.env`

2. **JWT Authentication Errors**
   - Check `JWT_SECRET` is set in `.env`
   - Verify token format in Authorization header
   - Ensure token hasn't expired or been blacklisted

3. **File Upload Issues**
   - Verify Cloudinary credentials in `.env`
   - Check file size limits (10MB max)

4. **TypeScript Compilation Errors**
   - Run `npx tsc --noEmit` to check for errors
   - Ensure all dependencies are installed

### Debug Mode

```bash
NODE_ENV=development npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Related Repositories

- [Frontend Application](https://github.com/SaddockAime/leave-management-system-fn) - React frontend (if available)

## 🆕 System Capabilities

This is a **comprehensive enterprise HR management system** with:

- ✅ **Complete HR Suite**: Full employee lifecycle from recruitment to onboarding to performance management
- ✅ **Advanced Analytics**: Detailed reporting across all modules with data-driven insights
- ✅ **Enterprise Security**: JWT authentication, audit logging, role-based access control
- ✅ **Workflow Automation**: Automated leave approvals, onboarding processes, and notifications
- ✅ **Integration Ready**: Cloudinary for files, SMTP for emails, Socket.IO for real-time updates
- ✅ **Scalable Architecture**: TypeScript, TypeORM, comprehensive validation, and structured logging
- ✅ **API-First Design**: Complete REST API with Swagger documentation for frontend integration

---

**Need help?** Check the Swagger documentation at `/api-docs` or open an issue on GitHub.
