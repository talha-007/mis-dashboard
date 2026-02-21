import { callAPi } from './http-common';

/**
 * SuperAdmin Service
 * Handles API calls for SuperAdmin role only.
 * Endpoints: /api/v1/superadmin-login, /api/v1/superAdmin/banks, /api/v1/superAdmin/subscriptions, /api/v1/users
 */

const login = (data: any) => callAPi.post('/api/v1/superadmin-login', data);

const getSystemUsers = (params?: {
  search?: string;
  page?: number;
  limit?: number;
  role?: string;
}) => callAPi.get('/api/v1/users', { params });

const getBanks = (params?: any) => callAPi.get('/api/v1/superAdmin/banks/', { params });

const getBankById = (id: string) => callAPi.get(`/api/v1/superAdmin/banks/${id}`);

const addBank = (data: any) => callAPi.post('/api/v1/superAdmin/banks/addBank', data);

const changeBankStatus = (id: string, data: any) =>
  callAPi.put(`/api/v1/superAdmin/banks/${id}/status`, data);

const deleteBank = (id: string) => callAPi.delete(`/api/v1/superAdmin/banks/${id}`);

const getSubscriptions = (params?: any) =>
  callAPi.get('/api/v1/superAdmin/subscriptions', { params });

const getSubscriptionById = (id: string) => callAPi.get(`/api/v1/superAdmin/subscriptions/${id}`);

const updateSubscription = (id: string, data: any) =>
  callAPi.put(`/api/v1/superAdmin/subscriptions/${id}`, data);

const deleteSubscription = (id: string) => callAPi.delete(`/api/v1/superAdmin/subscriptions/${id}`);

const superadminService = {
  login,
  getSystemUsers,
  getBanks,
  getBankById,
  addBank,
  changeBankStatus,
  deleteBank,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
};

export default superadminService;
