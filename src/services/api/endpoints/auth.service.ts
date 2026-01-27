/**
 * Authentication API Service
 * Microfinance Bank Dashboard
 */

import type {
  User,
  RegisterData,
  AuthResponse,
  LoginCredentials,
  GoogleLoginCredentials,
} from 'src/types/auth.types';

import axiosInstance from '../axios-instance';
import { BaseApiService } from '../base-api.service';

import type { ApiResponse } from '../types';

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService extends BaseApiService {
  constructor() {
    super('/auth');
  }

  /**
   * Login user with email/password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      `${this.endpoint}/login`,
      credentials
    );
    return response.data.data;
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(credentials: GoogleLoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      `${this.endpoint}/google`,
      credentials
    );
    return response.data.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      `${this.endpoint}/register`,
      data
    );
    return response.data.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await axiosInstance.post(`${this.endpoint}/logout`);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(`${this.endpoint}/me`);
    return response.data.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      `${this.endpoint}/refresh`,
      { refreshToken }
    );
    return response.data.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    await axiosInstance.post(`${this.endpoint}/password/reset-request`, data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axiosInstance.post(`${this.endpoint}/password/reset`, {
      token,
      password: newPassword,
    });
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await axiosInstance.post(`${this.endpoint}/password/change`, data);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await axiosInstance.post(`${this.endpoint}/verify-email`, { token });
  }
}

export const authService = new AuthService();
