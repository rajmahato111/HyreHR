import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permission } from './constants/permissions';
import { getPermissionsForRole } from './constants/role-permissions';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  @RequirePermissions(Permission.SETTINGS_USERS)
  async findAll(
    @CurrentUser() currentUser: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const [users, total] = await this.userRepository.findAndCount({
      where: { organizationId: currentUser.organizationId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'active',
        'lastLogin',
        'createdAt',
      ],
    });

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  @RequirePermissions(Permission.SETTINGS_USERS)
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const user = await this.userRepository.findOne({
      where: { id, organizationId: currentUser.organizationId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'permissions',
        'timezone',
        'locale',
        'active',
        'avatarUrl',
        'lastLogin',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  @Post()
  @RequirePermissions(Permission.SETTINGS_USERS)
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: User) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
        organizationId: currentUser.organizationId,
      },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Get default permissions for role if not provided
    const permissions =
      createUserDto.permissions || getPermissionsForRole(createUserDto.role);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
      permissions,
      organizationId: currentUser.organizationId,
      active: true,
    });

    await this.userRepository.save(user);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Put(':id')
  @RequirePermissions(Permission.SETTINGS_USERS)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.userRepository.findOne({
      where: { id, organizationId: currentUser.organizationId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update permissions if role changed
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      updateUserDto.permissions = getPermissionsForRole(updateUserDto.role);
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Delete(':id')
  @RequirePermissions(Permission.SETTINGS_USERS)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const user = await this.userRepository.findOne({
      where: { id, organizationId: currentUser.organizationId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent deleting yourself
    if (user.id === currentUser.id) {
      throw new Error('Cannot delete your own account');
    }

    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
  }
}
