export enum Permission {
  // Jobs
  JOBS_CREATE = 'jobs:create',
  JOBS_READ = 'jobs:read',
  JOBS_UPDATE = 'jobs:update',
  JOBS_DELETE = 'jobs:delete',
  JOBS_APPROVE = 'jobs:approve',

  // Candidates
  CANDIDATES_CREATE = 'candidates:create',
  CANDIDATES_READ = 'candidates:read',
  CANDIDATES_UPDATE = 'candidates:update',
  CANDIDATES_DELETE = 'candidates:delete',
  CANDIDATES_EXPORT = 'candidates:export',
  CANDIDATES_MERGE = 'candidates:merge',

  // Applications
  APPLICATIONS_CREATE = 'applications:create',
  APPLICATIONS_READ = 'applications:read',
  APPLICATIONS_UPDATE = 'applications:update',
  APPLICATIONS_MOVE = 'applications:move',
  APPLICATIONS_REJECT = 'applications:reject',

  // Interviews
  INTERVIEWS_SCHEDULE = 'interviews:schedule',
  INTERVIEWS_RESCHEDULE = 'interviews:reschedule',
  INTERVIEWS_CANCEL = 'interviews:cancel',
  INTERVIEWS_FEEDBACK = 'interviews:feedback',

  // Offers
  OFFERS_CREATE = 'offers:create',
  OFFERS_APPROVE = 'offers:approve',
  OFFERS_SEND = 'offers:send',
  OFFERS_VIEW = 'offers:view',

  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_CREATE_REPORTS = 'analytics:create_reports',
  ANALYTICS_EXPORT = 'analytics:export',

  // Settings
  SETTINGS_ORGANIZATION = 'settings:organization',
  SETTINGS_USERS = 'settings:users',
  SETTINGS_INTEGRATIONS = 'settings:integrations',
  SETTINGS_BILLING = 'settings:billing',
}

export const ALL_PERMISSIONS = '*';
