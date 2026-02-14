/**
 * Types for /api/users/me response (user, bank, subscription)
 */

export interface MeUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
}

export interface MeBank {
  id: string;
  name?: string;
  slug?: string;
  code?: string;
  adminEmail?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  capitalAmount?: string;
  establishedDate?: string;
  fax?: string;
  status?: string;
  subscriptionStatus?: string;
  subscriptionDate?: string;
  isGoogleLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeSubscription {
  id: string;
  status?: string;
  amount?: number;
  datePaid?: string;
  nextPayDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeProfileResponse {
  user: MeUser;
  bank: MeBank | null;
  subscription: MeSubscription | null;
}
