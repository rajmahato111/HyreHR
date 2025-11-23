import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../database/entities/user.entity';

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
