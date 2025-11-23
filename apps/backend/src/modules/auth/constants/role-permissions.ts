import { UserRole } from '../../../database/entities/user.entity';
import { Permission, ALL_PERMISSIONS } from './permissions';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [ALL_PERMISSIONS],

  [UserRole.RECRUITER]: [
    Permission.JOBS_CREATE,
    Permission.JOBS_READ,
    Permission.JOBS_UPDATE,
    Permission.CANDIDATES_CREATE,
    Permission.CANDIDATES_READ,
    Permission.CANDIDATES_UPDATE,
    Permission.CANDIDATES_EXPORT,
    Permission.CANDIDATES_MERGE,
    Permission.APPLICATIONS_CREATE,
    Permission.APPLICATIONS_READ,
    Permission.APPLICATIONS_UPDATE,
    Permission.APPLICATIONS_MOVE,
    Permission.APPLICATIONS_REJECT,
    Permission.INTERVIEWS_SCHEDULE,
    Permission.INTERVIEWS_RESCHEDULE,
    Permission.INTERVIEWS_CANCEL,
    Permission.INTERVIEWS_FEEDBACK,
    Permission.OFFERS_CREATE,
    Permission.OFFERS_SEND,
    Permission.OFFERS_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_CREATE_REPORTS,
    Permission.ANALYTICS_EXPORT,
  ],

  [UserRole.HIRING_MANAGER]: [
    Permission.JOBS_READ,
    Permission.CANDIDATES_READ,
    Permission.APPLICATIONS_READ,
    Permission.APPLICATIONS_UPDATE,
    Permission.APPLICATIONS_MOVE,
    Permission.APPLICATIONS_REJECT,
    Permission.INTERVIEWS_FEEDBACK,
    Permission.OFFERS_APPROVE,
    Permission.OFFERS_VIEW,
    Permission.ANALYTICS_VIEW,
  ],

  [UserRole.INTERVIEWER]: [
    Permission.CANDIDATES_READ,
    Permission.APPLICATIONS_READ,
    Permission.INTERVIEWS_FEEDBACK,
  ],

  [UserRole.COORDINATOR]: [
    Permission.CANDIDATES_READ,
    Permission.APPLICATIONS_READ,
    Permission.APPLICATIONS_UPDATE,
    Permission.INTERVIEWS_SCHEDULE,
    Permission.INTERVIEWS_RESCHEDULE,
    Permission.INTERVIEWS_CANCEL,
  ],

  [UserRole.EXECUTIVE]: [
    Permission.JOBS_READ,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
  ],
};

export function getPermissionsForRole(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Check for wildcard permission
  if (userPermissions.includes(ALL_PERMISSIONS)) {
    return true;
  }

  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check for wildcard resource permission (e.g., 'jobs:*')
  const [resource] = requiredPermission.split(':');
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}
