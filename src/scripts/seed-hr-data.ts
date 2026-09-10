import { getRepository } from 'typeorm';
import {
  JobPosting,
  JobApplication,
  Interview,
  Salary,
  Bonus,
  Benefit,
  EmployeeBenefit,
  Onboarding,
  OnboardingTask,
  Department,
  Employee,
} from '../models';
import { initializeDatabase } from '../config/database';

async function seedHRData() {
  try {
    // Database connection is already established by the calling script

    console.log('Starting HR data seeding...');

    // Seed Job Postings
    await seedJobPostings();

    // Seed Benefits
    await seedBenefits();

    // Seed Salaries
    await seedSalaries();

    // Seed Onboarding Templates
    await seedOnboardingTemplates();

    console.log('HR data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding HR data:', error);
    throw error;
  }
}

async function seedJobPostings() {
  const jobPostingRepository = getRepository(JobPosting);
  const departmentRepository = getRepository(Department);

  const count = await jobPostingRepository.count();
  if (count > 0) {
    console.log('Job postings already exist. Skipping seed.');
    return;
  }

  // Get departments for job postings
  const departments = await departmentRepository.find();
  if (departments.length === 0) {
    console.log('No departments found. Skipping job postings seed.');
    return;
  }

  const itDepartment = departments.find((d) => d.name === 'Information Technology');
  const hrDepartment = departments.find((d) => d.name === 'Human Resources');

  if (!itDepartment || !hrDepartment) {
    console.log('Required departments not found. Skipping job postings seed.');
    return;
  }

  const defaultJobPostings = [
    {
      title: 'Senior Software Engineer',
      description: 'We are looking for a senior software engineer to join our development team.',
      requirements: '5+ years experience, TypeScript/Node.js, PostgreSQL, REST APIs',
      responsibilities: 'Develop new features, Code review, Mentor junior developers',
      departmentId: itDepartment.id,
      location: 'Remote',
      employmentType: 'FULL_TIME' as any,
      minSalary: 80000,
      maxSalary: 120000,
      status: 'PUBLISHED' as any,
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
      benefits: ['Health Insurance', '401(k)', 'Professional Development'],
      experienceLevel: 5,
      numberOfPositions: 2,
    },
    {
      title: 'HR Coordinator',
      description: 'Support HR operations and employee lifecycle management.',
      requirements: "2+ years HR experience, Bachelor's degree, Communication skills",
      responsibilities: 'Recruitment support, Employee onboarding, HR documentation',
      departmentId: hrDepartment.id,
      location: 'On-site',
      employmentType: 'FULL_TIME' as any,
      minSalary: 45000,
      maxSalary: 60000,
      status: 'PUBLISHED' as any,
      skills: ['HR Management', 'Recruitment', 'Communication'],
      benefits: ['Health Insurance', 'Dental Insurance', 'Professional Development'],
      experienceLevel: 2,
      numberOfPositions: 1,
    },
  ];

  for (const job of defaultJobPostings) {
    const jobPosting = jobPostingRepository.create(job);
    await jobPostingRepository.save(jobPosting);
  }
}

async function seedBenefits() {
  const benefitRepository = getRepository(Benefit);

  const count = await benefitRepository.count();
  if (count > 0) {
    console.log('Benefits already exist. Skipping seed.');
    return;
  }

  const defaultBenefits = [
    {
      name: 'Health Insurance',
      description: 'Comprehensive health coverage for employees and dependents',
      type: 'HEALTH_INSURANCE' as any,
      category: 'INSURANCE' as any,
      cost: 500,
      employeeContribution: 100,
      isActive: true,
    },
    {
      name: 'Dental Insurance',
      description: 'Dental coverage for employees and dependents',
      type: 'DENTAL_INSURANCE' as any,
      category: 'INSURANCE' as any,
      cost: 100,
      employeeContribution: 25,
      isActive: true,
    },
    {
      name: '401(k) Retirement Plan',
      description: 'Retirement savings plan with company match',
      type: 'RETIREMENT_PLAN' as any,
      category: 'RETIREMENT' as any,
      cost: 0,
      employeeContribution: 0,
      isActive: true,
    },
    {
      name: 'Life Insurance',
      description: 'Life insurance coverage equal to annual salary',
      type: 'LIFE_INSURANCE' as any,
      category: 'INSURANCE' as any,
      cost: 50,
      employeeContribution: 0,
      isActive: true,
    },
    {
      name: 'Professional Development',
      description: 'Annual budget for courses, conferences, and certifications',
      type: 'EDUCATION_REIMBURSEMENT' as any,
      category: 'PROFESSIONAL_DEVELOPMENT' as any,
      cost: 2000,
      employeeContribution: 0,
      isActive: true,
    },
  ];

  for (const benefit of defaultBenefits) {
    const newBenefit = benefitRepository.create(benefit);
    await benefitRepository.save(newBenefit);
  }
}

async function seedSalaries() {
  const salaryRepository = getRepository(Salary);

  const count = await salaryRepository.count();
  if (count > 0) {
    console.log('Salaries already exist. Skipping seed.');
    return;
  }

  // Get employees to assign salaries
  const employeeRepository = getRepository(Employee);
  const employees = await employeeRepository.find();

  if (employees.length === 0) {
    console.log('No employees found. Skipping salary seed.');
    return;
  }

  const salaryData = [
    { position: 'ADMIN', baseSalary: 80000, bonus: 10000 },
    { position: 'HR_MANAGER', baseSalary: 70000, bonus: 8000 },
    { position: 'MANAGER', baseSalary: 75000, bonus: 9000 },
    { position: 'EMPLOYEE', baseSalary: 55000, bonus: 5000 },
  ];

  for (const employee of employees) {
    const salaryInfo = salaryData.find((s) => s.position === employee.position) || {
      baseSalary: 50000,
      bonus: 3000,
    };

    const salary = salaryRepository.create({
      employeeId: employee.id,
      type: 'BASE_SALARY' as any,
      amount: salaryInfo.baseSalary,
      payFrequency: 'MONTHLY' as any,
      effectiveDate: new Date(),
      isActive: true,
    });

    await salaryRepository.save(salary);
  }
}

async function seedOnboardingTemplates() {
  const onboardingRepository = getRepository(Onboarding);
  const taskRepository = getRepository(OnboardingTask);

  const count = await onboardingRepository.count();
  if (count > 0) {
    console.log('Onboarding templates already exist. Skipping seed.');
    return;
  }

  // Create onboarding template
  const onboarding = onboardingRepository.create({
    employeeId: 'template', // This will be a template
    status: 'NOT_STARTED' as any,
    currentPhase: 'PRE_BOARDING' as any,
    startDate: new Date(),
    targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isTemplate: true,
    templateName: 'Standard Employee Onboarding',
    goals: ['Complete HR paperwork', 'IT setup', 'Department introduction', 'Training completion'],
    notes: 'Standard onboarding process for new employees',
  });

  const savedOnboarding = await onboardingRepository.save(onboarding);

  // Create onboarding tasks
  const defaultTasks = [
    {
      onboardingId: savedOnboarding.id,
      title: 'Complete HR Paperwork',
      description: 'Fill out all required HR forms and documentation',
      order: 1,
      estimatedDuration: 2,
      isRequired: true,
    },
    {
      onboardingId: savedOnboarding.id,
      title: 'IT Setup',
      description: 'Get computer, email, and system access configured',
      order: 2,
      estimatedDuration: 1,
      isRequired: true,
    },
    {
      onboardingId: savedOnboarding.id,
      title: 'Department Introduction',
      description: 'Meet with team members and understand department structure',
      order: 3,
      estimatedDuration: 3,
      isRequired: true,
    },
    {
      onboardingId: savedOnboarding.id,
      title: 'Training Sessions',
      description: 'Attend required training sessions and workshops',
      order: 4,
      estimatedDuration: 8,
      isRequired: true,
    },
    {
      onboardingId: savedOnboarding.id,
      title: 'First Week Review',
      description: 'Review first week progress and set goals',
      order: 5,
      estimatedDuration: 1,
      isRequired: true,
    },
  ];

  for (const task of defaultTasks) {
    const onboardingTask = taskRepository.create(task);
    await taskRepository.save(onboardingTask);
  }
}

// Export the function for use in seed-all.ts
export { seedHRData };
