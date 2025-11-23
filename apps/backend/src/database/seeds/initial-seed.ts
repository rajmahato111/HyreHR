import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { User, UserRole } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Location } from '../entities/location.entity';
import { PipelineStage, StageType } from '../entities/pipeline-stage.entity';
import { RejectionReason } from '../entities/rejection-reason.entity';

export async function runInitialSeed(dataSource: DataSource): Promise<void> {
  const organizationRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);
  const departmentRepo = dataSource.getRepository(Department);
  const locationRepo = dataSource.getRepository(Location);
  const pipelineStageRepo = dataSource.getRepository(PipelineStage);
  const rejectionReasonRepo = dataSource.getRepository(RejectionReason);

  console.log('🌱 Starting initial seed...');

  // Create organization
  const organization = organizationRepo.create({
    name: 'Demo Company',
    slug: 'demo-company',
    settings: {
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      features: ['ats', 'crm', 'analytics'],
    },
  });
  await organizationRepo.save(organization);
  console.log('✅ Created organization:', organization.name);

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = userRepo.create({
    organizationId: organization.id,
    email: 'admin@demo.com',
    passwordHash,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    permissions: ['*'],
    timezone: 'America/New_York',
    locale: 'en',
    active: true,
  });
  await userRepo.save(adminUser);
  console.log('✅ Created admin user:', adminUser.email);

  // Create recruiter user
  const recruiterUser = userRepo.create({
    organizationId: organization.id,
    email: 'recruiter@demo.com',
    passwordHash: await bcrypt.hash('recruiter123', 10),
    firstName: 'Jane',
    lastName: 'Recruiter',
    role: UserRole.RECRUITER,
    permissions: [
      'jobs:create',
      'jobs:read',
      'jobs:update',
      'candidates:create',
      'candidates:read',
      'candidates:update',
      'applications:create',
      'applications:read',
      'applications:update',
    ],
    timezone: 'America/New_York',
    locale: 'en',
    active: true,
  });
  await userRepo.save(recruiterUser);
  console.log('✅ Created recruiter user:', recruiterUser.email);

  // Create departments
  const engineeringDept = departmentRepo.create({
    organizationId: organization.id,
    name: 'Engineering',
  });
  await departmentRepo.save(engineeringDept);

  const productDept = departmentRepo.create({
    organizationId: organization.id,
    name: 'Product',
  });
  await departmentRepo.save(productDept);

  const salesDept = departmentRepo.create({
    organizationId: organization.id,
    name: 'Sales',
  });
  await departmentRepo.save(salesDept);

  const marketingDept = departmentRepo.create({
    organizationId: organization.id,
    name: 'Marketing',
  });
  await departmentRepo.save(marketingDept);

  console.log('✅ Created departments');

  // Create locations
  const locations = [
    {
      name: 'San Francisco HQ',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      remote: false,
    },
    {
      name: 'New York Office',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      remote: false,
    },
    {
      name: 'Remote - US',
      city: undefined,
      state: undefined,
      country: 'USA',
      remote: true,
    },
    {
      name: 'Remote - Global',
      city: undefined,
      state: undefined,
      country: undefined,
      remote: true,
    },
  ];

  for (const loc of locations) {
    const location = locationRepo.create({
      organizationId: organization.id,
      ...loc,
    });
    await locationRepo.save(location);
  }

  console.log('✅ Created locations');

  // Create default pipeline stages
  const defaultStages = [
    { name: 'Applied', type: StageType.APPLIED, orderIndex: 0 },
    { name: 'Phone Screen', type: StageType.PHONE_SCREEN, orderIndex: 1 },
    { name: 'Technical Interview', type: StageType.TECHNICAL_INTERVIEW, orderIndex: 2 },
    { name: 'Onsite Interview', type: StageType.ONSITE_INTERVIEW, orderIndex: 3 },
    { name: 'Offer', type: StageType.OFFER, orderIndex: 4 },
    { name: 'Hired', type: StageType.HIRED, orderIndex: 5 },
  ];

  for (const stageData of defaultStages) {
    const stage = pipelineStageRepo.create({
      organizationId: organization.id,
      jobId: null, // Default stages have no job association
      ...stageData,
    });
    await pipelineStageRepo.save(stage);
  }

  console.log('✅ Created default pipeline stages');

  // Create rejection reasons
  const rejectionReasons = [
    { name: 'Not qualified', description: 'Candidate does not meet minimum qualifications' },
    { name: 'Position filled', description: 'Position has been filled by another candidate' },
    { name: 'Salary expectations', description: 'Salary expectations do not align' },
    { name: 'Culture fit', description: 'Not a good culture fit for the team' },
    { name: 'Withdrew application', description: 'Candidate withdrew their application' },
    { name: 'Failed assessment', description: 'Did not pass technical or skills assessment' },
    { name: 'Lack of experience', description: 'Insufficient relevant experience' },
    { name: 'Other', description: 'Other reason' },
  ];

  for (const reasonData of rejectionReasons) {
    const reason = rejectionReasonRepo.create({
      organizationId: organization.id,
      ...reasonData,
    });
    await rejectionReasonRepo.save(reason);
  }

  console.log('✅ Created rejection reasons');
  console.log('🎉 Initial seed completed!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@demo.com / admin123');
  console.log('  Recruiter: recruiter@demo.com / recruiter123');
}
