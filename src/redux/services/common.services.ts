import { callAPi } from './http-common';

/**
 * Common Service
 * Shared endpoints for any authenticated user.
 * Endpoints: /api/v1/me, /api/v1/users/:userId
 */

const getMe = () => callAPi.get('/api/v1/me');

const getUserById = (userId: string) => callAPi.get(`/api/v1/users/${userId}`);

const commonService = {
  getMe,
  getUserById,
};

export default commonService;
