/**
 * Users API Service
 */

import type { User } from 'src/types/auth.types';

import { BaseApiService } from '../base-api.service';

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

class UsersService extends BaseApiService<User> {
  constructor() {
    super('/users');
  }

  /**
   * Get users with filters
   */
  async getUsers(filters?: UserFilters) {
    return this.getAll(filters);
  }

  /**
   * Get paginated users
   */
  async getUsersPaginated(page: number, limit: number, filters?: UserFilters) {
    return this.getPaginated(page, limit, filters);
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: string) {
    return this.patch(userId, { status } as any);
  }

  /**
   * Update user role
   */
  async updateRole(userId: string, role: string) {
    return this.patch(userId, { role } as any);
  }
}

export const usersService = new UsersService();
